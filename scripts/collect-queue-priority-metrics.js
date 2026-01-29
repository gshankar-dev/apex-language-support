#!/usr/bin/env node
/*
 * Collect metrics for queue priority management (starvation, depth per priority).
 * Parses [QueueState] lines from server log or outputs instructions and template.
 *
 * Usage:
 *   node scripts/collect-queue-priority-metrics.js [--project small|medium|large] [--output metrics.json]
 *   node scripts/collect-queue-priority-metrics.js --parse-log <server-log.txt> [--output metrics.json]
 *   node scripts/collect-queue-priority-metrics.js --parse-queue-samples <queue-samples.json> [--project small] [--output metrics.json]
 */

const fs = require('fs');
const path = require('path');

function getDefaultOutputPath(project) {
  const dir = path.join(process.cwd(), 'performance-metrics');
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (_) {}
  return path.join(dir, `queue-priority-${project || 'run'}.json`);
}

function writeTemplate(outputPath, project) {
  const template = {
    scenario: 'queue-priority',
    project: project || 'unknown',
    collectedAt: new Date().toISOString(),
    instructions:
      'Manual: Run with serverMode development. Trigger workspace load. Copy Output panel (Apex Language Server) log. Use --parse-log <saved-log.txt> to fill metrics.',
    metrics: {
      queueDepthMaxByPriority: null,
      starvationCount: null,
      avgQueueDepth: null,
      sampleCount: null,
    },
  };
  fs.writeFileSync(outputPath, JSON.stringify(template, null, 2), 'utf8');
  console.log(`Wrote metrics template: ${outputPath}`);
}

function printInstructions(project) {
  console.log(`
Queue Priority Metrics – Manual Steps
=====================================
1. Set apex.environment.serverMode to "development" in .vscode/settings.json.
2. Open the ${project || 'target'} Apex project. Open Output panel → "Apex Language Server Extension (Worker/Server)".
3. Trigger workspace load (Find All References). Watch for [QueueState] messages (every ~200ms).
4. Copy the log to a file, then run: node scripts/collect-queue-priority-metrics.js --parse-log <log.txt> [--project ${project || 'run'}]
`);
}

function parseLogForQueueState(logPath) {
  const log = fs.readFileSync(logPath, 'utf8');
  const lines = log.split('\n').filter((l) => l.includes('[QueueState]'));
  const samples = [];
  let queueDepthMaxByPriority = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const line of lines) {
    const idx = line.indexOf('{');
    if (idx === -1) continue;
    const jsonStr = line.slice(idx);
    try {
      const obj = JSON.parse(jsonStr);
      const sizes = obj.queueSizes || {};
      for (const [p, v] of Object.entries(sizes)) {
        const key = parseInt(p, 10);
        const val = parseInt(v, 10);
        if (val > (queueDepthMaxByPriority[key] ?? 0))
          queueDepthMaxByPriority[key] = val;
      }
      samples.push({
        queueSizes: sizes,
        started: obj.started ?? null,
        completed: obj.completed ?? null,
      });
    } catch (_) {
      const m = line.match(/"(\d+)":(\d+)/g);
      if (m) {
        const sizes = {};
        for (const part of m) {
          const kv = part.match(/"(\d+)":(\d+)/);
          if (kv) {
            const p = parseInt(kv[1], 10);
            const v = parseInt(kv[2], 10);
            sizes[p] = v;
            if (v > (queueDepthMaxByPriority[p] ?? 0))
              queueDepthMaxByPriority[p] = v;
          }
        }
        samples.push({ queueSizes: sizes, started: null, completed: null });
      }
    }
  }
  let totalDepth = 0;
  let depthCount = 0;
  for (const s of samples) {
    const sum = Object.values(s.queueSizes || {}).reduce((a, b) => a + b, 0);
    totalDepth += sum;
    depthCount++;
  }
  return {
    sampleCount: samples.length,
    queueDepthMaxByPriority,
    avgQueueDepth: depthCount > 0 ? Math.round(totalDepth / depthCount) : null,
    starvationCount: null,
  };
}

function parseQueueSamplesFile(samplesPath) {
  const raw = fs.readFileSync(samplesPath, 'utf8');
  const data = JSON.parse(raw);
  const samples = Array.isArray(data.samples) ? data.samples : [];
  const queueDepthMaxByPriority = {};
  let totalDepth = 0;
  for (const s of samples) {
    const sizes = s.queueSizes || {};
    let sum = 0;
    for (const [p, v] of Object.entries(sizes)) {
      const val = typeof v === 'number' ? v : parseInt(v, 10);
      if (Number.isNaN(val)) continue;
      sum += val;
      const key = p;
      if (val > (queueDepthMaxByPriority[key] ?? 0))
        queueDepthMaxByPriority[key] = val;
    }
    totalDepth += sum;
  }
  return {
    sampleCount: samples.length,
    queueDepthMaxByPriority: Object.keys(queueDepthMaxByPriority).length
      ? queueDepthMaxByPriority
      : null,
    avgQueueDepth:
      samples.length > 0 ? Math.round(totalDepth / samples.length) : null,
    starvationCount: null,
  };
}

function main() {
  const args = process.argv.slice(2);
  let project = 'run';
  let outputPath = null;
  let parseLogPath = null;
  let parseQueueSamplesPath = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--project' && i + 1 < args.length) project = args[++i];
    else if (args[i] === '--output' && i + 1 < args.length)
      outputPath = args[++i];
    else if (args[i] === '--parse-log' && i + 1 < args.length)
      parseLogPath = args[++i];
    else if (args[i] === '--parse-queue-samples' && i + 1 < args.length)
      parseQueueSamplesPath = args[++i];
  }

  outputPath = outputPath || getDefaultOutputPath(project);

  if (parseQueueSamplesPath) {
    if (!fs.existsSync(parseQueueSamplesPath)) {
      console.error(`Queue samples file not found: ${parseQueueSamplesPath}`);
      process.exit(1);
    }
    const metrics = parseQueueSamplesFile(parseQueueSamplesPath);
    const out = {
      scenario: 'queue-priority',
      project,
      collectedAt: new Date().toISOString(),
      source: { type: 'queue-samples', path: parseQueueSamplesPath },
      metrics,
    };
    fs.writeFileSync(outputPath, JSON.stringify(out, null, 2), 'utf8');
    console.log(`Wrote metrics from queue samples: ${outputPath}`);
    return;
  }

  if (parseLogPath) {
    if (!fs.existsSync(parseLogPath)) {
      console.error(`Log file not found: ${parseLogPath}`);
      process.exit(1);
    }
    const metrics = parseLogForQueueState(parseLogPath);
    const out = {
      scenario: 'queue-priority',
      project,
      collectedAt: new Date().toISOString(),
      source: { type: 'log', path: parseLogPath },
      metrics,
    };
    fs.writeFileSync(outputPath, JSON.stringify(out, null, 2), 'utf8');
    console.log(`Wrote metrics from log: ${outputPath}`);
    return;
  }

  writeTemplate(outputPath, project);
  printInstructions(project);
}

main();
