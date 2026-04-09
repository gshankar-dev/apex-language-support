#!/usr/bin/env node
/**
 * Single-Thread Bottleneck Stress Test v2
 *
 * Measures hover responsiveness during actual workspace batch loading
 * (the real apex/sendWorkspaceBatch → unzipSync → compile → addSymbolTable pipeline)
 * to find the project size where the server becomes unresponsive.
 *
 * v2 changes:
 * - Uses the real apex/sendWorkspaceBatch protocol (ZIP + base64 batches)
 * - Spawns a completely fresh server per project size ("reload window")
 * - Sends hover probes asynchronously at fixed intervals for dense sampling
 * - Detects load completion via queue state polling
 * - Measures baseline hover latency before loading for comparison
 * - Falls back to bulk didOpen if the batch protocol isn't supported
 *
 * Server-side processing pipeline triggered by this test:
 *   apex/sendWorkspaceBatch  → store compressed batch (fast)
 *   apex/processWorkspaceBatches → forkDaemon:
 *     → base64 decode → unzipSync() → parse → compile → addSymbolTable()
 *   These synchronous operations block the event loop, starving hover requests.
 *
 * Usage:
 *   node scripts/single-thread-bottleneck-test.js
 *   node scripts/single-thread-bottleneck-test.js --project large
 *   node scripts/single-thread-bottleneck-test.js --hover-interval 200
 *   node scripts/single-thread-bottleneck-test.js --batch-size 50
 *   APEX_LS_CPU_PROFILE=1 node scripts/single-thread-bottleneck-test.js
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

let fflate;
try {
  fflate = require('fflate');
} catch {
  console.error('ERROR: fflate not found in node_modules. Run: npm install');
  process.exit(1);
}

// ─── Constants ───────────────────────────────────────────────────────────────

const REPO_ROOT = findRepoRoot(__dirname);
const FIXTURES_ROOT = path.join(
  REPO_ROOT, 'packages', 'apex-lsp-testbed', 'test', 'fixtures', 'performance-tests',
);

const PROJECT_PATHS = {
  small: path.join(FIXTURES_ROOT, 'small', 'trigger-actions'),
  medium: path.join(FIXTURES_ROOT, 'medium', 'apex-recipes'),
  large: path.join(FIXTURES_ROOT, 'large', 'eda'),
  xlarge: path.join(FIXTURES_ROOT, 'xlarge', 'mega-enterprise'),
};

const LATENCY_THRESHOLDS = {
  acceptable: 500,
  degraded: 2000,
  unresponsive: 5000,
  timeout: 15000,
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Utility Functions ───────────────────────────────────────────────────────

function findRepoRoot(fromDir) {
  let current = path.resolve(fromDir);
  for (let i = 0; i < 20; i++) {
    const pkg = path.join(current, 'package.json');
    if (fs.existsSync(pkg)) {
      try {
        const json = JSON.parse(fs.readFileSync(pkg, 'utf8'));
        if (json.name === '@salesforce/apex-language-server') return current;
      } catch { /* skip */ }
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return process.cwd();
}

function findServerPath() {
  const bundled = path.join(REPO_ROOT, 'packages', 'apex-ls', 'dist', 'server.node.js');
  const compiled = path.join(REPO_ROOT, 'packages', 'apex-ls', 'out', 'node', 'server.node.js');
  if (fs.existsSync(bundled)) return bundled;
  if (fs.existsSync(compiled)) return compiled;
  return null;
}

function pathToUri(filePath) {
  const abs = path.resolve(filePath);
  return process.platform === 'win32'
    ? 'file:///' + abs.replace(/\\/g, '/')
    : 'file://' + abs;
}

function readApexFiles(projectPath) {
  const files = [];
  function walk(dir) {
    try {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.isFile() && (entry.name.endsWith('.cls') || entry.name.endsWith('.trigger'))) {
          files.push({
            uri: pathToUri(full),
            filePath: full,
            content: fs.readFileSync(full, 'utf8'),
            version: 1,
          });
        }
      }
    } catch { /* skip */ }
  }
  walk(projectPath);
  return files;
}

function findHoverTargets(files, limit) {
  const targets = [];
  for (const file of files) {
    if (targets.length >= limit) break;
    if (!file.filePath.endsWith('.cls')) continue;
    const lines = file.content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const idx = lines[i].indexOf('class ');
      if (idx >= 0) {
        targets.push({
          uri: file.uri,
          filePath: file.filePath,
          line: i,
          character: idx + 6,
          content: file.content,
        });
        break;
      }
    }
  }
  return targets;
}

// ─── Workspace Batch Creation ────────────────────────────────────────────────
// Replicates the extension's workspace-batch-compressor.ts:
//   fflate.zipSync({ [uri]: content, __metadata.json: ... }) → base64

function createWorkspaceBatches(files, batchSize) {
  const totalBatches = Math.ceil(files.length / batchSize);
  const batches = [];
  const encoder = new TextEncoder();

  for (let i = 0; i < totalBatches; i++) {
    const slice = files.slice(i * batchSize, (i + 1) * batchSize);
    const isLast = i === totalBatches - 1;
    const fileMetadata = slice.map((f) => ({ uri: f.uri, version: f.version }));

    const zipEntries = {};
    for (const file of slice) {
      zipEntries[file.uri] = encoder.encode(file.content);
    }
    zipEntries['__metadata.json'] = encoder.encode(
      JSON.stringify({ batchIndex: i, totalBatches, isLastBatch: isLast, fileMetadata }),
    );

    const compressed = fflate.zipSync(zipEntries, { level: 6 });
    batches.push({
      batchIndex: i,
      totalBatches,
      isLastBatch: isLast,
      compressedData: Buffer.from(compressed).toString('base64'),
      fileMetadata,
    });
  }
  return batches;
}

// ─── Lightweight JSON-RPC Client ─────────────────────────────────────────────

class JsonRpcClient {
  constructor(serverPath, args, env) {
    this.id = 1;
    this.pending = new Map();
    this.buffer = '';
    this.contentLength = -1;
    this.notifications = [];

    const nodeArgs = [];
    if (process.env.APEX_LS_CPU_PROFILE === '1') {
      nodeArgs.push('--cpu-prof');
    }
    nodeArgs.push(serverPath, '--stdio');

    this.proc = spawn('node', [...nodeArgs, ...(args || [])], {
      env: { ...process.env, ...env, NODE_OPTIONS: '--enable-source-maps' },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    this.proc.stdout.on('data', (chunk) => this._onData(chunk.toString()));
    this.proc.stderr.on('data', () => {});
  }

  _onData(data) {
    this.buffer += data;
    while (true) {
      if (this.contentLength === -1) {
        const headerEnd = this.buffer.indexOf('\r\n\r\n');
        if (headerEnd === -1) return;
        const match = this.buffer.substring(0, headerEnd).match(/Content-Length:\s*(\d+)/i);
        if (!match) { this.buffer = this.buffer.substring(headerEnd + 4); continue; }
        this.contentLength = parseInt(match[1], 10);
        this.buffer = this.buffer.substring(headerEnd + 4);
      }
      if (Buffer.byteLength(this.buffer, 'utf8') < this.contentLength) return;
      const body = Buffer.from(this.buffer, 'utf8').slice(0, this.contentLength).toString('utf8');
      this.buffer = Buffer.from(this.buffer, 'utf8').slice(this.contentLength).toString('utf8');
      this.contentLength = -1;

      try {
        const msg = JSON.parse(body);
        if (msg.id !== undefined && this.pending.has(msg.id)) {
          const { resolve, reject } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) reject(new Error(msg.error.message || JSON.stringify(msg.error)));
          else resolve(msg.result);
        } else if (!msg.id && msg.method) {
          this.notifications.push(msg);
        }
      } catch { /* skip parse errors */ }
    }
  }

  sendRequest(method, params, timeoutMs = 60000) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.pending.set(id, { resolve, reject });
      const msg = JSON.stringify({ jsonrpc: '2.0', id, method, params });
      const header = `Content-Length: ${Buffer.byteLength(msg, 'utf8')}\r\n\r\n`;
      try {
        this.proc.stdin.write(header + msg);
      } catch (err) {
        this.pending.delete(id);
        reject(err);
        return;
      }
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`Timeout: ${method} after ${timeoutMs}ms`));
        }
      }, timeoutMs);
    });
  }

  sendNotification(method, params) {
    const msg = JSON.stringify({ jsonrpc: '2.0', method, params });
    const header = `Content-Length: ${Buffer.byteLength(msg, 'utf8')}\r\n\r\n`;
    try { this.proc.stdin.write(header + msg); } catch { /* ignore */ }
  }

  async shutdown() {
    try {
      await this.sendRequest('shutdown', null, 5000);
      this.sendNotification('exit', null);
    } catch { /* ignore */ }
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        try { this.proc.kill('SIGKILL'); } catch { /* ignore */ }
        resolve();
      }, 5000);
      this.proc.on('close', () => { clearTimeout(timer); resolve(); });
    });
  }
}

// ─── Statistics ──────────────────────────────────────────────────────────────

function computeStats(results) {
  if (results.length === 0) {
    return { count: 0, avg: null, p50: null, p95: null, max: null, min: null, timeouts: 0, errors: 0 };
  }
  const latencies = results.map((r) => r.latencyMs).sort((a, b) => a - b);
  return {
    count: results.length,
    avg: Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length),
    p50: latencies[Math.floor(latencies.length * 0.5)],
    p95: latencies[Math.min(Math.floor(latencies.length * 0.95), latencies.length - 1)],
    max: latencies[latencies.length - 1],
    min: latencies[0],
    timeouts: results.filter((r) => r.status === 'timeout').length,
    errors: results.filter((r) => r.status === 'error').length,
  };
}

// ─── Stress Test Per Project ─────────────────────────────────────────────────

async function stressTestProject(label, projectPath, config) {
  const STEPS = 8;
  const step = (n, msg) => console.log(`  [${n}/${STEPS}] ${msg}`);

  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  PROJECT: ${label}`);
  console.log(`${'═'.repeat(70)}`);

  // ── Phase 1: Read files & create batches (client-side prep) ──

  step(1, 'Reading Apex files and creating ZIP batches...');
  const allFiles = readApexFiles(projectPath);
  const batches = createWorkspaceBatches(allFiles, config.batchSize);
  const targets = findHoverTargets(allFiles, Math.max(config.hoverTargets, 5));

  const totalZipKB = batches
    .reduce((sum, b) => sum + b.compressedData.length, 0) / 1024;
  console.log(
    `    ${allFiles.length} files → ${batches.length} batches ` +
    `(${totalZipKB.toFixed(0)}KB base64 total)`,
  );
  console.log(`    ${targets.length} hover targets found`);

  if (targets.length === 0) {
    console.log('    SKIP: No hover targets');
    return null;
  }

  // ── Phase 2: Start fresh server ──

  step(2, 'Starting fresh server...');
  const serverPath = config.serverPath || findServerPath();
  if (!serverPath) {
    console.error('    Server not found. Run: npm run compile && npm run bundle');
    console.error('    Or specify --server-path <path-to-server.js>');
    return null;
  }
  console.log(`    Server: ${serverPath}`);

  const client = new JsonRpcClient(serverPath, [], {
    APEX_LS_MODE: 'development',
    APEX_LSP_WORKSPACE: projectPath,
  });

  try {
    await client.sendRequest('initialize', {
      processId: process.pid,
      rootUri: pathToUri(projectPath),
      rootPath: projectPath,
      capabilities: {
        textDocument: {
          hover: { contentFormat: ['plaintext'] },
          synchronization: { didOpen: true, didChange: true },
        },
        workspace: { workspaceFolders: true },
      },
      workspaceFolders: [{ uri: pathToUri(projectPath), name: path.basename(projectPath) }],
      initializationOptions: {
        apex: { environment: { serverMode: 'development' } },
      },
    });
    client.sendNotification('initialized', {});
  } catch (err) {
    console.error(`    Init failed: ${err.message}`);
    await client.shutdown();
    return null;
  }

  // ── Phase 3: Open hover targets ──

  step(3, 'Opening hover targets...');
  for (const t of targets.slice(0, 3)) {
    client.sendNotification('textDocument/didOpen', {
      textDocument: { uri: t.uri, languageId: 'apex', version: 1, text: t.content },
    });
  }
  await sleep(1000);

  // ── Phase 4: Warm up standard library ──
  // Force the server to compile a file that references all major standard types.
  // This triggers lazy loading of standard library symbols so the one-time cost
  // is excluded from batch processing measurements.

  step(4, 'Warming up standard library...');
  const warmupContent = `public class ApexStdLibWarmup {
  public static void exerciseStdLib() {
    String s = 'hello';
    Integer i = 42;
    Long l = 123L;
    Double d = 3.14;
    Decimal dec = 99.99;
    Boolean b = true;
    Date dt = Date.today();
    DateTime dtt = DateTime.now();
    Time t = Time.newInstance(0, 0, 0, 0);
    Blob bl = Blob.valueOf(s);
    Id recordId;
    Object obj = s;
    List<String> lst = new List<String>();
    Set<Integer> st = new Set<Integer>();
    Map<String, Object> mp = new Map<String, Object>();
    System.debug(s);
    System.assertEquals(42, i);
    JSON.serialize(mp);
    Type tp = Type.forName('String');
    Pattern p = Pattern.compile('.*');
    Matcher m = p.matcher(s);
    Http h = new Http();
    HttpRequest req = new HttpRequest();
    HttpResponse res;
    Math.abs(i);
    String.format('{0}', new List<String>{s});
    EncodingUtil.base64Encode(bl);
    Crypto.generateDigest('SHA-256', bl);
    UserInfo.getUserId();
    Schema.SObjectType sot;
    Database.QueryLocator ql;
    Messaging.SingleEmailMessage email;
    ApexPages.StandardController sc;
    Test.startTest();
    Test.stopTest();
  }
}`;

  const warmupUri = pathToUri(path.join(projectPath, '__warmup__.cls'));
  client.sendNotification('textDocument/didOpen', {
    textDocument: { uri: warmupUri, languageId: 'apex', version: 1, text: warmupContent },
  });

  // Send hover to force full compilation of the warmup file
  try {
    await client.sendRequest('textDocument/hover', {
      textDocument: { uri: warmupUri },
      position: { line: 2, character: 12 },
    }, 60000);
  } catch { /* compilation may fail for some types — that's fine */ }

  // Wait for background processing to settle.
  // Try queue state polling first; fall back to a fixed delay if the server doesn't support it.
  let warmupIdleStreak = 0;
  let supportsQueueState = true;
  const warmupStart = Date.now();
  const warmupTimeout = 60000;

  // Quick probe to see if queueState is supported
  try {
    await client.sendRequest('apex/queueState', {}, 3000);
  } catch {
    supportsQueueState = false;
  }

  if (supportsQueueState) {
    while (warmupIdleStreak < 3 && (Date.now() - warmupStart) < warmupTimeout) {
      await sleep(2000);
      try {
        const qs = await client.sendRequest('apex/queueState', {}, 5000);
        const metrics = qs?.metrics || qs || {};
        const totalQueued = Object.values(metrics.queueSizes || {})
          .reduce((a, b) => a + b, 0);
        const isIdle = totalQueued === 0 &&
          metrics.tasksStarted > 0 &&
          metrics.tasksStarted === metrics.tasksCompleted;
        if (isIdle) warmupIdleStreak++;
        else warmupIdleStreak = 0;
      } catch { warmupIdleStreak = 0; }
    }
  } else {
    // No queue state support — send a second hover and wait for it (proves compilation is done)
    await sleep(2000);
    try {
      await client.sendRequest('textDocument/hover', {
        textDocument: { uri: warmupUri },
        position: { line: 5, character: 12 },
      }, 30000);
    } catch { /* ok */ }
    warmupIdleStreak = 3;
  }

  const warmupTimeMs = Date.now() - warmupStart;
  if (warmupIdleStreak >= 3) {
    console.log(`    Standard library warmed up in ${(warmupTimeMs / 1000).toFixed(1)}s`);
  } else {
    console.log(`    Warm-up did not fully settle (${(warmupTimeMs / 1000).toFixed(1)}s, proceeding)`);
  }

  // Close warmup file to avoid polluting results
  client.sendNotification('textDocument/didClose', {
    textDocument: { uri: warmupUri },
  });
  await sleep(500);

  // ── Phase 5: Measure baseline hover latency (on warmed-up server) ──

  step(5, 'Measuring baseline hover latency...');
  const baselineResults = [];
  for (let i = 0; i < 5; i++) {
    const t = targets[i % targets.length];
    const start = Date.now();
    try {
      await client.sendRequest('textDocument/hover', {
        textDocument: { uri: t.uri },
        position: { line: t.line, character: t.character },
      }, 10000);
      baselineResults.push({ latencyMs: Date.now() - start, status: 'success' });
    } catch {
      baselineResults.push({ latencyMs: Date.now() - start, status: 'error' });
    }
    await sleep(200);
  }
  const baselineStats = computeStats(baselineResults);
  console.log(
    `    Baseline: avg=${baselineStats.avg}ms p95=${baselineStats.p95}ms ` +
    `(${baselineStats.count} hovers)`,
  );

  // ── Phase 6: Send workspace batches ──

  step(6, `Sending ${batches.length} workspace batches...`);
  const batchSendStart = Date.now();
  let batchErrors = 0;
  let useBatchProtocol = true;

  for (const batch of batches) {
    try {
      const result = await client.sendRequest('apex/sendWorkspaceBatch', batch, 30000);
      if (!result?.success && !result?.stored) batchErrors++;
    } catch (err) {
      if (err.message.includes('Method not found') || err.message.includes('-32601') || err.message.includes('Unhandled method')) {
        useBatchProtocol = false;
        break;
      }
      batchErrors++;
      console.warn(`    Batch ${batch.batchIndex} error: ${err.message}`);
    }
  }

  const batchSendTimeMs = Date.now() - batchSendStart;
  let loadMode;

  if (useBatchProtocol) {
    loadMode = 'batch';
    console.log(
      `    Sent in ${batchSendTimeMs}ms` +
      `${batchErrors > 0 ? ` (${batchErrors} errors)` : ''}`,
    );
  } else {
    loadMode = 'didOpen';
    console.log('    batch protocol not supported, falling back to bulk didOpen');
    const openStart = Date.now();
    for (let i = 0; i < allFiles.length; i++) {
      const f = allFiles[i];
      client.sendNotification('textDocument/didOpen', {
        textDocument: { uri: f.uri, languageId: 'apex', version: 1, text: f.content },
      });
      if (i % 50 === 49) await sleep(50);
    }
    console.log(`    Sent ${allFiles.length} didOpen in ${Date.now() - openStart}ms`);
  }

  // ── Phase 7: Trigger processing & start hover probing ──

  step(7, 'Processing + probing hover latency...');
  const processingStart = Date.now();

  if (useBatchProtocol) {
    try {
      await client.sendRequest(
        'apex/processWorkspaceBatches',
        { totalBatches: batches.length },
        30000,
      );
    } catch (err) {
      console.warn(`    processWorkspaceBatches: ${err.message}`);
    }
    client.sendNotification('apex/workspaceLoadComplete', { success: true });
  }

  // Async hover probing: fire a new hover every N ms regardless of outstanding requests
  const hoverResults = [];
  const queueSamples = [];
  let loadComplete = false;
  let loadCompleteMs = null;
  let idleStreak = 0;
  let hoverIndex = 0;
  const hoverPromises = [];
  const MIN_IDLE_WAIT_MS = 3000;

  const hoverTimer = setInterval(() => {
    const idx = hoverIndex++;
    const target = targets[idx % targets.length];
    const duringLoad = !loadComplete;
    const sendTimeMs = Date.now();

    const p = client
      .sendRequest('textDocument/hover', {
        textDocument: { uri: target.uri },
        position: { line: target.line, character: target.character },
      }, LATENCY_THRESHOLDS.timeout)
      .then(() => {
        hoverResults.push({
          index: idx,
          latencyMs: Date.now() - sendTimeMs,
          duringLoad,
          elapsedMs: sendTimeMs - processingStart,
          status: 'success',
        });
      })
      .catch((err) => {
        hoverResults.push({
          index: idx,
          latencyMs: Date.now() - sendTimeMs,
          duringLoad,
          elapsedMs: sendTimeMs - processingStart,
          status: err.message.includes('Timeout') ? 'timeout' : 'error',
        });
      });
    hoverPromises.push(p);
  }, config.hoverIntervalMs);

  // Queue state polling (independent of hovers) — only if the server supports it
  const queueTimer = supportsQueueState ? setInterval(async () => {
    try {
      const qs = await client.sendRequest('apex/queueState', {}, 5000);
      const metrics = qs?.metrics || qs || {};
      queueSamples.push({
        timestampMs: Date.now() - processingStart,
        queueSizes: metrics.queueSizes || {},
        tasksStarted: metrics.tasksStarted,
        tasksCompleted: metrics.tasksCompleted,
      });

      if (
        !loadComplete &&
        metrics.tasksStarted > 0 &&
        (Date.now() - processingStart) > MIN_IDLE_WAIT_MS
      ) {
        const totalQueued = Object.values(metrics.queueSizes || {})
          .reduce((a, b) => a + b, 0);
        const isIdle = totalQueued === 0 &&
          metrics.tasksStarted === metrics.tasksCompleted;
        if (isIdle) idleStreak++;
        else idleStreak = 0;

        if (idleStreak >= 3) {
          loadComplete = true;
          loadCompleteMs = Date.now();
        }
      }
    } catch { /* server blocked — that's data too */ }
  }, 2000) : null;

  // Wait for load to complete or timeout.
  // Detection methods:
  //   1. Queue state polling (when supported): all queues empty + tasks balanced for 3 consecutive polls
  //   2. Hover latency stabilization (fallback): last 10 hovers all < 200ms, with a minimum 10s wait
  const maxWaitMs = config.maxWaitMs;
  const waitStart = Date.now();
  const MIN_PROCESSING_BEFORE_STABLE_CHECK = 10000;

  while (!loadComplete && (Date.now() - waitStart) < maxWaitMs) {
    await sleep(1000);

    // Fallback: detect completion via hover latency when queue state isn't available
    if (!supportsQueueState && (Date.now() - processingStart) > MIN_PROCESSING_BEFORE_STABLE_CHECK) {
      const recent = hoverResults.slice(-10);
      if (recent.length >= 10 && recent.every((h) => h.status === 'success' && h.latencyMs < 200)) {
        loadComplete = true;
        loadCompleteMs = Date.now();
      }
    }
  }

  if (loadComplete) {
    const elapsed = ((loadCompleteMs - processingStart) / 1000).toFixed(1);
    const method = supportsQueueState ? 'queue drained' : 'hover latency stabilized';
    console.log(`    Load complete at ${elapsed}s (${method}), gathering post-load baseline...`);
    await sleep(config.hoverIntervalMs * 15);
  } else {
    console.log(`    Load did not complete within ${maxWaitMs / 1000}s timeout`);
    loadCompleteMs = Date.now();
  }

  clearInterval(hoverTimer);
  if (queueTimer) clearInterval(queueTimer);
  await Promise.allSettled(hoverPromises);

  const processingTimeMs = loadCompleteMs - processingStart;

  // ── Phase 8: Analyze ──

  step(8, 'Analyzing results...');

  const duringLoadHovers = hoverResults.filter((h) => h.duringLoad);
  const afterLoadHovers = hoverResults.filter((h) => !h.duringLoad);
  const duringStats = computeStats(duringLoadHovers);
  const afterStats = computeStats(afterLoadHovers);
  const allStats = computeStats(hoverResults);

  let severity;
  const criticalP95 = duringStats.p95 || 0;
  if (criticalP95 < LATENCY_THRESHOLDS.acceptable) severity = 'OK';
  else if (criticalP95 < LATENCY_THRESHOLDS.degraded) severity = 'DEGRADED';
  else if (criticalP95 < LATENCY_THRESHOLDS.unresponsive) severity = 'UNRESPONSIVE';
  else severity = 'BLOCKED';

  const stalls = duringLoadHovers.filter((h) => h.latencyMs > 2000).length;

  const phases = [
    ['Baseline', baselineStats],
    ['During Load', duringStats],
    ['After Load', afterStats],
  ];
  console.log('');
  console.log(
    `    ${'Phase'.padEnd(14)} ` +
    `${'Count'.padStart(6)} ${'Avg'.padStart(8)} ${'P50'.padStart(8)} ` +
    `${'P95'.padStart(8)} ${'Max'.padStart(8)} ${'T/O'.padStart(5)}`,
  );
  console.log(`    ${'─'.repeat(60)}`);
  for (const [name, stats] of phases) {
    if (stats.count === 0) {
      console.log(`    ${name.padEnd(14)} ${String(0).padStart(6)}        -        -        -        -     -`);
    } else {
      console.log(
        `    ${name.padEnd(14)} ` +
        `${String(stats.count).padStart(6)} ` +
        `${(stats.avg + 'ms').padStart(8)} ` +
        `${(stats.p50 + 'ms').padStart(8)} ` +
        `${(stats.p95 + 'ms').padStart(8)} ` +
        `${(stats.max + 'ms').padStart(8)} ` +
        `${String(stats.timeouts).padStart(5)}`,
      );
    }
  }
  console.log(`    ${'─'.repeat(60)}`);
  console.log(
    `    Processing: ${(processingTimeMs / 1000).toFixed(1)}s ` +
    `| Batch send: ${batchSendTimeMs}ms ` +
    `| Severity: ${severity}`,
  );
  if (stalls > 0) {
    console.log(`    Event loop stalls (hover > 2s): ${stalls}`);
  }

  // ── Shutdown ──

  console.log('  Shutting down server...');
  await client.shutdown();

  const result = {
    project: label,
    fileCount: allFiles.length,
    batchCount: batches.length,
    loadMode,
    warmupTimeMs: warmupTimeMs,
    batchSendTimeMs,
    processingTimeMs,
    severity,
    baseline: baselineStats,
    duringLoad: duringStats,
    afterLoad: afterStats,
    overall: allStats,
    queueSampleCount: queueSamples.length,
    eventLoopStalls: stalls,
    filesPerSecond: processingTimeMs > 0
      ? Math.round((allFiles.length / processingTimeMs) * 1000 * 100) / 100
      : null,
  };

  return { result, hoverResults, queueSamples, baselineResults };
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const config = {
    batchSize: 100,
    hoverIntervalMs: 300,
    hoverTargets: 20,
    maxWaitMs: 300000,
    cooldownMs: 5000,
    serverPath: '',
    outputFile: '',
    label: '',
  };
  let projectFilter = '';
  let thresholdMs = LATENCY_THRESHOLDS.degraded;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--project' && i + 1 < args.length) projectFilter = args[++i];
    else if (args[i] === '--hover-interval' && i + 1 < args.length) config.hoverIntervalMs = parseInt(args[++i], 10);
    else if (args[i] === '--batch-size' && i + 1 < args.length) config.batchSize = parseInt(args[++i], 10);
    else if (args[i] === '--hover-targets' && i + 1 < args.length) config.hoverTargets = parseInt(args[++i], 10);
    else if (args[i] === '--threshold' && i + 1 < args.length) thresholdMs = parseInt(args[++i], 10);
    else if (args[i] === '--max-wait' && i + 1 < args.length) config.maxWaitMs = parseInt(args[++i], 10) * 1000;
    else if (args[i] === '--cooldown' && i + 1 < args.length) config.cooldownMs = parseInt(args[++i], 10) * 1000;
    else if (args[i] === '--server-path' && i + 1 < args.length) config.serverPath = args[++i];
    else if (args[i] === '--output' && i + 1 < args.length) config.outputFile = args[++i];
    else if (args[i] === '--label' && i + 1 < args.length) config.label = args[++i];
    else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
Single-Thread Bottleneck Stress Test v2
═══════════════════════════════════════

Tests hover responsiveness during real workspace batch loading.
Each project gets a fresh server process ("reload window").

Options:
  --project <name>        Run one project (small|medium|large|xlarge)
  --server-path <path>    Path to server.js (default: local repo build)
                          Use to test VS Code extension versions, e.g.:
                          ~/.vscode/extensions/salesforce.apex-*/server.js
  --output <path>         Output JSON path (default: performance-metrics/single-thread-bottleneck.json)
  --label <name>          Label for this test run (e.g. "release-0.4.0", "pre-release-0.5.0")
  --hover-interval <ms>   Delay between hover probes (default: 300)
  --batch-size <n>        Files per ZIP batch (default: 100)
  --hover-targets <n>     Distinct hover target files (default: 20)
  --threshold <ms>        P95 latency for "degraded" (default: 2000)
  --max-wait <sec>        Max wait for load completion (default: 300)
  --cooldown <sec>        Pause between projects (default: 5)

Environment:
  APEX_LS_CPU_PROFILE=1   Enable CPU profiling for the server
`);
      return;
    }
  }

  const serverLabel = config.label || (config.serverPath ? path.basename(path.dirname(config.serverPath)) : 'local-build');

  console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║  SINGLE-THREAD BOTTLENECK STRESS TEST v2                           ║
║                                                                    ║
║  Real workspace batch loading (ZIP → unzipSync → compile → index)  ║
║  Fresh server per project • Dense hover probing • Queue monitoring ║
╚══════════════════════════════════════════════════════════════════════╝

  Config:
    Server:          ${config.serverPath || 'local repo build'}
    Label:           ${serverLabel}
    Hover interval:  ${config.hoverIntervalMs}ms
    Batch size:      ${config.batchSize} files/batch
    Hover targets:   ${config.hoverTargets}
    Max wait:        ${config.maxWaitMs / 1000}s
    Cooldown:        ${config.cooldownMs / 1000}s
    CPU profiling:   ${process.env.APEX_LS_CPU_PROFILE ? 'ON' : 'OFF'}
`);

  const projects = projectFilter ? [projectFilter] : Object.keys(PROJECT_PATHS);
  const allResults = [];

  for (let pi = 0; pi < projects.length; pi++) {
    const label = projects[pi];
    const projectPath = PROJECT_PATHS[label];
    if (!projectPath || !fs.existsSync(projectPath)) {
      console.log(`Skipping ${label}: path not found`);
      continue;
    }

    try {
      const data = await stressTestProject(label, projectPath, config);
      if (data) allResults.push(data);
    } catch (err) {
      console.error(`\n  ERROR testing ${label}: ${err.message}`);
      console.error('  Continuing to next project...');
    }

    if (pi < projects.length - 1) {
      console.log(`\n  Cooldown: ${config.cooldownMs / 1000}s before next project...`);
      await sleep(config.cooldownMs);
    }
  }

  if (allResults.length === 0) {
    console.error('\nNo results collected. Ensure projects exist and server is built.');
    process.exit(1);
  }

  // ─── Summary Table ───

  console.log(`\n${'═'.repeat(78)}`);
  console.log('  SCALING CURVE');
  console.log(`${'═'.repeat(78)}\n`);

  const header = [
    'Project'.padEnd(8),
    'Files'.padStart(6),
    'Batch'.padStart(6),
    'Warmup'.padStart(7),
    'Load(s)'.padStart(8),
    'Base p95'.padStart(9),
    'p95 During'.padStart(11),
    'p95 After'.padStart(10),
    'Stalls'.padStart(7),
    'Severity'.padStart(14),
  ].join(' │ ');
  console.log('  ' + header);
  console.log('  ' + '─'.repeat(header.length));

  for (const { result: r } of allResults) {
    const row = [
      r.project.padEnd(8),
      String(r.fileCount).padStart(6),
      String(r.batchCount).padStart(6),
      ((r.warmupTimeMs / 1000).toFixed(0) + 's').padStart(7),
      (r.processingTimeMs / 1000).toFixed(1).padStart(8),
      (r.baseline.p95 != null ? r.baseline.p95 + 'ms' : '-').padStart(9),
      (r.duringLoad.p95 != null ? r.duringLoad.p95 + 'ms' : '-').padStart(11),
      (r.afterLoad.p95 != null ? r.afterLoad.p95 + 'ms' : '-').padStart(10),
      String(r.eventLoopStalls).padStart(7),
      r.severity.padStart(14),
    ].join(' │ ');
    console.log('  ' + row);
  }

  // ─── Inflection Point ───

  console.log(`\n${'─'.repeat(78)}`);
  console.log('  INFLECTION POINT\n');

  let inflection = null;
  for (const { result: r } of allResults) {
    if (r.duringLoad.p95 !== null && r.duringLoad.p95 >= thresholdMs && !inflection) {
      inflection = r;
    }
  }

  if (inflection) {
    console.log(
      `  BOTTLENECK at ${inflection.project} ` +
      `(${inflection.fileCount} files, ${inflection.batchCount} batches)`,
    );
    console.log(`    P95 during load: ${inflection.duringLoad.p95}ms (threshold: ${thresholdMs}ms)`);
    console.log(`    Processing time: ${(inflection.processingTimeMs / 1000).toFixed(1)}s`);
    console.log(`    Event loop stalls: ${inflection.eventLoopStalls}`);
    console.log('');
    console.log('    Root cause: synchronous operations in the batch processing pipeline:');
    console.log('      1. unzipSync()      — decompresses each ZIP batch on the event loop');
    console.log('      2. compile()        — synchronous Apex parsing and type checking');
    console.log('      3. addSymbolTable() — synchronous symbol graph updates (yields/100)');
    console.log('      4. controllerLoop() — single-threaded drain cannot interleave');
  } else {
    const last = allResults[allResults.length - 1].result;
    if (last.duringLoad.count === 0) {
      console.log('  Processing completed before hover probes could measure during-load latency.');
      console.log('  Try: --hover-interval 100 for more aggressive probing.');
    } else {
      console.log(`  No bottleneck detected up to ${last.fileCount} files.`);
      console.log(`  P95 during load: ${last.duringLoad.p95}ms (threshold: ${thresholdMs}ms)`);
    }
  }

  // ─── Write JSON ───

  const metricsDir = path.join(REPO_ROOT, 'performance-metrics');
  fs.mkdirSync(metricsDir, { recursive: true });
  const outputPath = config.outputFile
    ? path.resolve(config.outputFile)
    : path.join(metricsDir, 'single-thread-bottleneck.json');

  const output = {
    testType: 'single-thread-bottleneck-v2',
    timestamp: new Date().toISOString(),
    serverLabel,
    serverPath: config.serverPath || 'local-build',
    config,
    thresholds: LATENCY_THRESHOLDS,
    results: allResults.map((d) => d.result),
    inflectionPoint: inflection
      ? {
          project: inflection.project,
          fileCount: inflection.fileCount,
          p95DuringLoadMs: inflection.duringLoad.p95,
          processingTimeMs: inflection.processingTimeMs,
        }
      : null,
    detailedHoverData: Object.fromEntries(
      allResults.map((d) => [d.result.project, d.hoverResults]),
    ),
    queueData: Object.fromEntries(
      allResults.map((d) => [d.result.project, d.queueSamples]),
    ),
  };

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n  Results: ${outputPath}`);
  console.log(`\n${'═'.repeat(78)}\n`);
}

process.on('uncaughtException', (err) => {
  if (err.code === 'EPIPE' || err.code === 'ERR_STREAM_DESTROYED') return;
  console.error('Uncaught exception:', err);
  process.exit(1);
});

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
