#!/usr/bin/env node
/**
 * Finds the file count where v0.5.0 and v0.5.39 performance diverges.
 * 
 * Progressively loads files via sendWorkspaceBatch (with didOpen fallback)
 * and measures hover latency at each step. Both versions get a fresh server
 * per run and use the same set of files.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

let fflate;
try { fflate = require('fflate'); } catch {
  console.error('fflate not found. Run: npm install');
  process.exit(1);
}

const REPO_ROOT = path.resolve(__dirname, '..');
const FIXTURES = path.join(REPO_ROOT, 'packages', 'apex-lsp-testbed', 'test', 'fixtures', 'performance-tests');
const LARGE_PROJECT = path.join(FIXTURES, 'large');

const STEPS = [5, 10, 15, 20, 30, 50, 75, 100, 150, 200, 300, 450, 662];
const HOVERS_PER_STEP = 5;
const HOVER_TIMEOUT = 15000;

const SERVERS = {};
const possibleServers = [
  ['0.5.0', path.join(process.env.HOME, '.cursor/extensions/salesforce.apex-language-server-extension-0.5.0/server.node.js')],
  ['0.5.39', path.join(process.env.HOME, '.cursor/extensions/salesforce.apex-language-server-extension-0.5.39-universal/dist/server.node.js')],
];
for (const [label, p] of possibleServers) {
  if (fs.existsSync(p)) SERVERS[label] = p;
}

function pathToUri(p) { return 'file://' + path.resolve(p); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

class LSPClient {
  constructor(serverPath) {
    this.pending = new Map();
    this.buffer = '';
    this.contentLength = -1;
    this.nextId = 1;
    this.proc = spawn('node', [serverPath, '--stdio'], {
      env: { ...process.env, NODE_OPTIONS: '--enable-source-maps' },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    this.proc.stdout.on('data', (chunk) => this._onData(chunk.toString()));
    this.proc.stderr.on('data', () => {});
  }

  _onData(data) {
    this.buffer += data;
    while (true) {
      if (this.contentLength === -1) {
        const idx = this.buffer.indexOf('\r\n\r\n');
        if (idx === -1) return;
        const match = this.buffer.substring(0, idx).match(/Content-Length:\s*(\d+)/i);
        if (!match) return;
        this.contentLength = parseInt(match[1], 10);
        this.buffer = this.buffer.substring(idx + 4);
      }
      if (this.buffer.length < this.contentLength) return;
      const body = this.buffer.substring(0, this.contentLength);
      this.buffer = this.buffer.substring(this.contentLength);
      this.contentLength = -1;
      try {
        const msg = JSON.parse(body);
        if (msg.id && this.pending.has(msg.id)) {
          this.pending.get(msg.id)(msg);
          this.pending.delete(msg.id);
        }
      } catch {}
    }
  }

  sendRequest(method, params, timeoutMs = 30000) {
    return new Promise((resolve, reject) => {
      const id = this.nextId++;
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error(`Timeout: ${method}`)); }, timeoutMs);
      this.pending.set(id, (msg) => {
        clearTimeout(timer);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      });
      const body = JSON.stringify({ jsonrpc: '2.0', id, method, params });
      this.proc.stdin.write(`Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`);
    });
  }

  sendNotification(method, params) {
    const body = JSON.stringify({ jsonrpc: '2.0', method, params });
    this.proc.stdin.write(`Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`);
  }

  async shutdown() {
    try { await this.sendRequest('shutdown', null, 5000); this.sendNotification('exit', null); } catch {}
    setTimeout(() => this.proc.kill(), 2000);
  }
}

function readAllApexFiles(projectDir) {
  const results = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.sfdx') walk(full);
      else if (entry.name.endsWith('.cls') && !entry.name.endsWith('-meta.xml')) {
        results.push({ path: full, uri: pathToUri(full), content: fs.readFileSync(full, 'utf8') });
      } else if (entry.name.endsWith('.trigger')) {
        results.push({ path: full, uri: pathToUri(full), content: fs.readFileSync(full, 'utf8') });
      }
    }
  }
  walk(projectDir);
  return results;
}

function createBatch(files, batchIndex, totalBatches) {
  const zipInput = {};
  const metadata = { fileMetadata: [] };
  const encoder = new TextEncoder();
  for (const f of files) {
    zipInput[f.uri] = encoder.encode(f.content);
    metadata.fileMetadata.push({ uri: f.uri, version: 1 });
  }
  zipInput['__metadata.json'] = encoder.encode(JSON.stringify(metadata));
  const compressed = fflate.zipSync(zipInput, { level: 1 });
  return {
    compressedData: Buffer.from(compressed).toString('base64'),
    batchIndex,
    totalBatches,
    fileMetadata: metadata.fileMetadata,
  };
}

function findHoverPosition(content) {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/\b(String|Integer|List|Boolean|Map)\b/) && !lines[i].match(/class|interface/)) {
      const m = lines[i].match(/\b(String|Integer|List|Boolean|Map)\b/);
      return { line: i, character: lines[i].indexOf(m[0]) + 1 };
    }
  }
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/\bclass\b/)) return { line: i, character: lines[i].indexOf('class') + 2 };
  }
  return { line: Math.min(2, lines.length - 1), character: 4 };
}

async function measureHoverLatency(client, targets, count) {
  const latencies = [];
  for (let i = 0; i < count; i++) {
    const target = targets[i % targets.length];
    const t = Date.now();
    try {
      await client.sendRequest('textDocument/hover', {
        textDocument: { uri: target.uri },
        position: target.position,
      }, HOVER_TIMEOUT);
      latencies.push(Date.now() - t);
    } catch {
      latencies.push(HOVER_TIMEOUT);
    }
  }
  latencies.sort((a, b) => a - b);
  const avg = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
  const p95idx = Math.min(Math.floor(latencies.length * 0.95), latencies.length - 1);
  return { avg, p95: latencies[p95idx], max: latencies[latencies.length - 1], count: latencies.length };
}

async function runThresholdTest(label, serverPath, allFiles) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  ${label}`);
  console.log(`${'═'.repeat(60)}`);

  const client = new LSPClient(serverPath);

  await client.sendRequest('initialize', {
    processId: process.pid,
    rootUri: pathToUri(LARGE_PROJECT),
    rootPath: LARGE_PROJECT,
    capabilities: {
      textDocument: {
        hover: { contentFormat: ['plaintext'] },
        synchronization: { didOpen: true, didChange: true },
      },
      workspace: { workspaceFolders: true },
    },
    workspaceFolders: [{ uri: pathToUri(LARGE_PROJECT), name: 'large' }],
    initializationOptions: { apex: { environment: { serverMode: 'development' } } },
  });
  client.sendNotification('initialized', {});
  await sleep(2000);

  // Warm up standard library with a synthetic file
  const warmupUri = pathToUri('/tmp/apex-warmup/Warmup.cls');
  const warmupContent = `public class Warmup { public static void run() { String s = 'hi'; Integer i = 1; List<String> l = new List<String>(); Map<String,Object> m = new Map<String,Object>(); System.debug(s); } }`;
  client.sendNotification('textDocument/didOpen', {
    textDocument: { uri: warmupUri, languageId: 'apex', version: 1, text: warmupContent },
  });
  try { await client.sendRequest('textDocument/hover', { textDocument: { uri: warmupUri }, position: { line: 0, character: 60 } }, 30000); } catch {}
  await sleep(1000);

  // Prepare hover targets from the full file list
  const hoverTargets = allFiles.slice(0, 20).map(f => ({
    uri: f.uri,
    position: findHoverPosition(f.content),
  }));

  // Open the first few hover targets so the server knows them
  for (const t of hoverTargets.slice(0, 3)) {
    const file = allFiles.find(f => f.uri === t.uri);
    if (file) {
      client.sendNotification('textDocument/didOpen', {
        textDocument: { uri: file.uri, languageId: 'apex', version: 1, text: file.content },
      });
    }
  }
  await sleep(500);

  // Baseline hover (no workspace files loaded)
  const baseline = await measureHoverLatency(client, hoverTargets, HOVERS_PER_STEP);
  console.log(`  Baseline (0 files): avg=${baseline.avg}ms p95=${baseline.p95}ms`);

  const results = [{ fileCount: 0, ...baseline }];
  let filesLoaded = 0;
  let supportsBatch = true;

  for (const targetCount of STEPS) {
    if (targetCount > allFiles.length) break;

    const newFiles = allFiles.slice(filesLoaded, targetCount);
    if (newFiles.length === 0) continue;

    // Send new files as a batch (or didOpen fallback)
    if (supportsBatch) {
      const batch = createBatch(newFiles, 0, 1);
      try {
        await client.sendRequest('apex/sendWorkspaceBatch', batch, 30000);
      } catch (err) {
        if (err.message.includes('Unhandled method') || err.message.includes('Method not found')) {
          supportsBatch = false;
        }
      }
    }
    if (!supportsBatch) {
      for (const f of newFiles) {
        client.sendNotification('textDocument/didOpen', {
          textDocument: { uri: f.uri, languageId: 'apex', version: 1, text: f.content },
        });
      }
    }

    filesLoaded = targetCount;

    // Wait for processing to settle
    const waitMs = Math.min(5000, Math.max(1000, newFiles.length * 50));
    await sleep(waitMs);

    // Try queue state to detect idle
    for (let attempt = 0; attempt < 10; attempt++) {
      try {
        const qs = await client.sendRequest('apex/queueState', {}, 3000);
        const metrics = qs?.metrics || qs || {};
        const queued = Object.values(metrics.queueSizes || {}).reduce((a, b) => a + b, 0);
        if (queued === 0 && metrics.tasksStarted > 0 && metrics.tasksStarted === metrics.tasksCompleted) break;
      } catch { break; }
      await sleep(2000);
    }

    const measurement = await measureHoverLatency(client, hoverTargets, HOVERS_PER_STEP);
    results.push({ fileCount: filesLoaded, ...measurement });
    console.log(`  ${String(filesLoaded).padStart(4)} files: avg=${String(measurement.avg).padStart(5)}ms  p95=${String(measurement.p95).padStart(5)}ms  max=${String(measurement.max).padStart(5)}ms`);
  }

  await client.shutdown();
  return results;
}

async function main() {
  console.log('Disparity Threshold Test');
  console.log('Progressively loads files and measures hover latency at each step.\n');

  const allFiles = readAllApexFiles(LARGE_PROJECT);
  console.log(`Project: ${LARGE_PROJECT} (${allFiles.length} Apex files)`);
  console.log(`Steps: ${STEPS.filter(s => s <= allFiles.length).join(', ')} files\n`);

  const allResults = {};
  for (const [label, serverPath] of Object.entries(SERVERS)) {
    const results = await runThresholdTest(label, serverPath, allFiles);
    allResults[label] = results;
    await sleep(3000);
  }

  // Find divergence point
  console.log(`\n${'═'.repeat(60)}`);
  console.log('  COMPARISON');
  console.log(`${'═'.repeat(60)}\n`);

  const versions = Object.keys(allResults);
  if (versions.length >= 2) {
    const v1 = versions[0], v2 = versions[1];
    const r1 = allResults[v1], r2 = allResults[v2];

    console.log(`  ${'Files'.padStart(6)}  │  ${v1.padEnd(15)}  │  ${v2.padEnd(15)}  │  Ratio`);
    console.log(`  ${'─'.repeat(60)}`);

    let divergencePoint = null;

    for (let i = 0; i < Math.min(r1.length, r2.length); i++) {
      const a = r1[i], b = r2[i];
      const ratio = b.p95 > 0 && a.p95 > 0 ? (b.p95 / a.p95).toFixed(1) + 'x' : '-';
      console.log(`  ${String(a.fileCount).padStart(6)}  │  ${(a.p95 + 'ms').padStart(15)}  │  ${(b.p95 + 'ms').padStart(15)}  │  ${ratio}`);

      if (!divergencePoint && a.fileCount > 0 && b.p95 > a.p95 * 3 && b.p95 > 100) {
        divergencePoint = { fileCount: a.fileCount, v1p95: a.p95, v2p95: b.p95 };
      }
    }

    if (divergencePoint) {
      console.log(`\n  Divergence detected at ~${divergencePoint.fileCount} files`);
      console.log(`    ${v1}: ${divergencePoint.v1p95}ms — ${v2}: ${divergencePoint.v2p95}ms`);
    } else {
      console.log(`\n  No significant divergence detected in the measured range.`);
    }
  }

  const outputPath = path.join(REPO_ROOT, 'performance-metrics', 'disparity-threshold.json');
  fs.writeFileSync(outputPath, JSON.stringify(allResults, null, 2));
  console.log(`\n  Results: ${outputPath}`);
}

process.on('uncaughtException', (err) => {
  if (err.code === 'EPIPE' || err.code === 'ERR_STREAM_DESTROYED') return;
  console.error('Uncaught:', err);
  process.exit(1);
});

main().catch(console.error);
