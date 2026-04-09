#!/usr/bin/env node
/**
 * Measures server startup/initialization time for the Apex Language Server.
 * Spawns the server, sends initialize, and records how long each phase takes.
 */

const { spawn } = require('child_process');
const path = require('path');

const SERVERS = {
  '0.5.0': path.join(
    process.env.HOME, '.cursor/extensions/salesforce.apex-language-server-extension-0.5.0/server.node.js'
  ),
  '0.5.39': path.join(
    process.env.HOME, '.cursor/extensions/salesforce.apex-language-server-extension-0.5.39-universal/dist/server.node.js'
  ),
};

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
        const header = this.buffer.substring(0, idx);
        const match = header.match(/Content-Length:\s*(\d+)/i);
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

  sendRequest(method, params, timeoutMs = 60000) {
    return new Promise((resolve, reject) => {
      const id = this.nextId++;
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Timeout: ${method}`));
      }, timeoutMs);
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
    try {
      await this.sendRequest('shutdown', null, 5000);
      this.sendNotification('exit', null);
    } catch {}
    setTimeout(() => this.proc.kill(), 2000);
  }
}

const WARMUP_CONTENT = `public class ApexStdLibWarmup {
  public static void exerciseStdLib() {
    String s = 'hello';
    Integer i = 42;
    List<String> lst = new List<String>();
    Map<String, Object> mp = new Map<String, Object>();
    Set<Integer> st = new Set<Integer>();
    System.debug(s);
    Date dt = Date.today();
    DateTime dtt = DateTime.now();
    Boolean b = true;
    Decimal d = 99.99;
    Id recordId;
    Blob bl = Blob.valueOf(s);
    Type tp = Type.forName('String');
    Http h = new Http();
    HttpRequest req = new HttpRequest();
    Schema.SObjectType sot;
    Database.QueryLocator ql;
  }
}`;

async function measureStartup(label, serverPath, runs = 3) {
  const results = [];

  for (let run = 0; run < runs; run++) {
    const timings = {};
    const t0 = Date.now();

    const client = new LSPClient(serverPath);
    timings.spawnMs = Date.now() - t0;

    const t1 = Date.now();
    await client.sendRequest('initialize', {
      processId: process.pid,
      capabilities: {},
      rootUri: pathToUri('/tmp/apex-startup-test'),
    });
    timings.initializeMs = Date.now() - t1;

    const t2 = Date.now();
    client.sendNotification('initialized', {});
    timings.initializedMs = Date.now() - t2;

    const warmupUri = pathToUri('/tmp/apex-startup-test/ApexStdLibWarmup.cls');

    // Open + hover to force first compilation (standard library hydration)
    const t3 = Date.now();
    client.sendNotification('textDocument/didOpen', {
      textDocument: { uri: warmupUri, languageId: 'apex', version: 1, text: WARMUP_CONTENT },
    });

    try {
      await client.sendRequest('textDocument/hover', {
        textDocument: { uri: warmupUri },
        position: { line: 2, character: 12 },
      }, 60000);
    } catch {}
    timings.firstHoverMs = Date.now() - t3;

    // Second hover (everything cached)
    const t4 = Date.now();
    try {
      await client.sendRequest('textDocument/hover', {
        textDocument: { uri: warmupUri },
        position: { line: 5, character: 12 },
      }, 30000);
    } catch {}
    timings.secondHoverMs = Date.now() - t4;

    timings.totalMs = Date.now() - t0;

    await client.shutdown();
    results.push(timings);

    await new Promise(r => setTimeout(r, 2000));
  }

  return results;
}

function median(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

async function main() {
  const runs = 3;
  console.log(`Measuring startup time (${runs} runs each)\n`);

  const allResults = {};

  for (const [label, serverPath] of Object.entries(SERVERS)) {
    const fs = require('fs');
    if (!fs.existsSync(serverPath)) {
      console.log(`Skipping ${label}: ${serverPath} not found`);
      continue;
    }

    console.log(`\n=== ${label} ===`);
    const results = await measureStartup(label, serverPath, runs);
    allResults[label] = results;

    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      console.log(`  Run ${i + 1}: initialize=${r.initializeMs}ms, firstHover=${r.firstHoverMs}ms, secondHover=${r.secondHoverMs}ms, total=${r.totalMs}ms`);
    }

    const medians = {};
    for (const key of Object.keys(results[0])) {
      medians[key] = median(results.map(r => r[key]));
    }
    console.log(`  Median: initialize=${medians.initializeMs}ms, firstHover=${medians.firstHoverMs}ms, secondHover=${medians.secondHoverMs}ms, total=${medians.totalMs}ms`);
  }

  // Write JSON
  const outputPath = path.join(__dirname, '..', 'performance-metrics', 'startup-times.json');
  require('fs').writeFileSync(outputPath, JSON.stringify(allResults, null, 2));
  console.log(`\nResults saved to ${outputPath}`);
}

main().catch(console.error);
