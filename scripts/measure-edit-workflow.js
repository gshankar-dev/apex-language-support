#!/usr/bin/env node
/**
 * Measures language server responsiveness for the common single-file editing workflow:
 *   1. Open a file → first hover (cold)
 *   2. Edit the file → hover again (recompile)
 *   3. Open a second file → hover (cross-file)
 *   4. Open a third file → hover
 *   5. Go back to first file → hover (warm cache)
 *   6. Completion request
 *   7. DocumentSymbol request
 *   8. Definition (go-to-definition) request
 *
 * Runs against any server version via --server-path.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const FIXTURES = path.join(REPO_ROOT, 'packages', 'apex-lsp-testbed', 'test', 'fixtures', 'performance-tests');

const SERVERS = {};

// Auto-detect available servers
const possibleServers = [
  ['0.5.0', path.join(process.env.HOME, '.cursor/extensions/salesforce.apex-language-server-extension-0.5.0/server.node.js')],
  ['0.5.39', path.join(process.env.HOME, '.cursor/extensions/salesforce.apex-language-server-extension-0.5.39-universal/dist/server.node.js')],
  ['local-build', path.join(REPO_ROOT, 'packages/apex-ls/dist/server.node.js')],
];
for (const [label, p] of possibleServers) {
  if (fs.existsSync(p)) SERVERS[label] = p;
}

function pathToUri(p) {
  return 'file://' + path.resolve(p);
}

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

function findApexFiles(dir, limit = 5) {
  const results = [];
  function walk(d) {
    if (results.length >= limit) return;
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      if (results.length >= limit) return;
      const full = path.join(d, entry.name);
      if (entry.isDirectory() && entry.name !== 'node_modules') walk(full);
      else if (entry.name.endsWith('.cls') && !entry.name.endsWith('-meta.xml')) {
        const content = fs.readFileSync(full, 'utf8');
        if (content.length > 100 && content.includes('class ')) {
          results.push({ path: full, uri: pathToUri(full), content });
        }
      }
    }
  }
  walk(dir);
  return results;
}

function findMethodLine(content) {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.match(/\b(public|private|protected|global)\b.*\b(void|String|Integer|Boolean|List|Map|Set)\b.*\(/)) {
      const match = line.match(/\b\w+\s*\(/);
      if (match) return { line: i, character: line.indexOf(match[0]) + 2 };
    }
  }
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/\bclass\b/)) {
      return { line: i, character: lines[i].indexOf('class') + 2 };
    }
  }
  return { line: 2, character: 4 };
}

function findVariableLine(content) {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/\b(String|Integer|List|Map|Boolean|Id)\b\s+\w+/) && !lines[i].match(/class|interface/)) {
      const match = lines[i].match(/\b(String|Integer|List|Map|Boolean|Id)\b/);
      if (match) return { line: i, character: lines[i].indexOf(match[0]) + 1 };
    }
  }
  return findMethodLine(content);
}

async function timed(label, fn) {
  const t = Date.now();
  let result, error;
  try { result = await fn(); } catch (e) { error = e; }
  const ms = Date.now() - t;
  return { label, ms, error: error?.message || null, result };
}

async function runEditWorkflow(label, serverPath) {
  const projectPath = path.join(FIXTURES, 'large');
  const files = findApexFiles(projectPath, 5);
  if (files.length < 3) {
    console.log(`  Not enough Apex files found in ${projectPath}`);
    return null;
  }

  const client = new LSPClient(serverPath);
  const steps = [];

  // Initialize
  const init = await timed('initialize', () =>
    client.sendRequest('initialize', {
      processId: process.pid,
      rootUri: pathToUri(projectPath),
      rootPath: projectPath,
      capabilities: {
        textDocument: {
          hover: { contentFormat: ['plaintext'] },
          completion: { completionItem: { snippetSupport: false } },
          documentSymbol: { hierarchicalDocumentSymbolSupport: true },
          definition: {},
          synchronization: { didOpen: true, didChange: true },
        },
        workspace: { workspaceFolders: true },
      },
      workspaceFolders: [{ uri: pathToUri(projectPath), name: path.basename(projectPath) }],
      initializationOptions: {
        apex: { environment: { serverMode: 'development' } },
      },
    })
  );
  steps.push(init);
  client.sendNotification('initialized', {});

  // Wait for server to fully register handlers
  await new Promise(r => setTimeout(r, 2000));

  const f1 = files[0], f2 = files[1], f3 = files[2];
  const pos1 = findMethodLine(f1.content);
  const pos2 = findMethodLine(f2.content);
  const pos3 = findMethodLine(f3.content);
  const varPos1 = findVariableLine(f1.content);

  // Step 1: Open file 1, hover (cold — no files open yet)
  client.sendNotification('textDocument/didOpen', {
    textDocument: { uri: f1.uri, languageId: 'apex', version: 1, text: f1.content },
  });
  await new Promise(r => setTimeout(r, 500));
  steps.push(await timed('hover file1 (cold open)', () =>
    client.sendRequest('textDocument/hover', { textDocument: { uri: f1.uri }, position: pos1 })
  ));

  // Step 2: Edit file 1 (add a comment), hover again (recompile)
  const editedContent = f1.content.replace(/\{/, '{\n  // edit marker\n');
  client.sendNotification('textDocument/didChange', {
    textDocument: { uri: f1.uri, version: 2 },
    contentChanges: [{ text: editedContent }],
  });
  await new Promise(r => setTimeout(r, 300));
  steps.push(await timed('hover file1 (after edit)', () =>
    client.sendRequest('textDocument/hover', { textDocument: { uri: f1.uri }, position: pos1 })
  ));

  // Step 3: Open file 2, hover (second file)
  client.sendNotification('textDocument/didOpen', {
    textDocument: { uri: f2.uri, languageId: 'apex', version: 1, text: f2.content },
  });
  await new Promise(r => setTimeout(r, 300));
  steps.push(await timed('hover file2 (second file)', () =>
    client.sendRequest('textDocument/hover', { textDocument: { uri: f2.uri }, position: pos2 })
  ));

  // Step 4: Open file 3, hover (third file)
  client.sendNotification('textDocument/didOpen', {
    textDocument: { uri: f3.uri, languageId: 'apex', version: 1, text: f3.content },
  });
  await new Promise(r => setTimeout(r, 300));
  steps.push(await timed('hover file3 (third file)', () =>
    client.sendRequest('textDocument/hover', { textDocument: { uri: f3.uri }, position: pos3 })
  ));

  // Step 5: Go back to file 1, hover (warm cache)
  steps.push(await timed('hover file1 (warm cache)', () =>
    client.sendRequest('textDocument/hover', { textDocument: { uri: f1.uri }, position: pos1 })
  ));

  // Step 6: Completion on file 1
  steps.push(await timed('completion file1', () =>
    client.sendRequest('textDocument/completion', {
      textDocument: { uri: f1.uri },
      position: varPos1,
      context: { triggerKind: 1 },
    })
  ));

  // Step 7: Document symbols on file 1
  steps.push(await timed('documentSymbol file1', () =>
    client.sendRequest('textDocument/documentSymbol', { textDocument: { uri: f1.uri } })
  ));

  // Step 8: Go-to-definition on file 1
  steps.push(await timed('definition file1', () =>
    client.sendRequest('textDocument/definition', {
      textDocument: { uri: f1.uri },
      position: varPos1,
    })
  ));

  await client.shutdown();
  return steps;
}

async function main() {
  const runs = 3;
  const serverFilter = process.argv[2];

  const servers = serverFilter
    ? Object.entries(SERVERS).filter(([k]) => k.includes(serverFilter))
    : Object.entries(SERVERS);

  if (servers.length === 0) {
    console.error('No servers found. Available:', Object.keys(SERVERS).join(', '));
    process.exit(1);
  }

  console.log('Edit Workflow Performance Test');
  console.log(`Running ${runs} iterations per version\n`);
  console.log('Workflow: open file → hover → edit → hover → open 2nd file → hover');
  console.log('          → open 3rd file → hover → back to 1st → hover');
  console.log('          → completion → documentSymbol → go-to-definition\n');

  const allResults = {};

  for (const [label, serverPath] of servers) {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  ${label}`);
    console.log(`  ${serverPath}`);
    console.log(`${'═'.repeat(60)}`);

    const runResults = [];
    for (let r = 0; r < runs; r++) {
      console.log(`\n  Run ${r + 1}/${runs}:`);
      const steps = await runEditWorkflow(label, serverPath);
      if (!steps) continue;

      for (const s of steps) {
        const status = s.error ? `ERROR: ${s.error}` : `${s.ms}ms`;
        console.log(`    ${s.label.padEnd(30)} ${status}`);
      }
      runResults.push(steps);
      await new Promise(r => setTimeout(r, 2000));
    }

    if (runResults.length > 0) {
      console.log(`\n  Medians (${runResults.length} runs):`);
      const stepNames = runResults[0].map(s => s.label);
      const medians = {};
      for (let i = 0; i < stepNames.length; i++) {
        const values = runResults.map(r => r[i].ms).sort((a, b) => a - b);
        const med = values[Math.floor(values.length / 2)];
        medians[stepNames[i]] = med;
        console.log(`    ${stepNames[i].padEnd(30)} ${med}ms`);
      }
      allResults[label] = { medians, runs: runResults };
    }
  }

  // Save results
  const outputPath = path.join(REPO_ROOT, 'performance-metrics', 'edit-workflow-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(allResults, null, 2));
  console.log(`\nResults saved to ${outputPath}`);
}

process.on('uncaughtException', (err) => {
  if (err.code === 'EPIPE' || err.code === 'ERR_STREAM_DESTROYED') return;
  console.error('Uncaught:', err);
  process.exit(1);
});

main().catch(console.error);
