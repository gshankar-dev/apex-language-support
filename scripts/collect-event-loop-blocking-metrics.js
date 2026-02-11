#!/usr/bin/env node
/*
 * Collect metrics for event loop blocking (compute-bound tasks >100ms).
 * Manual testing required; outputs instructions and a metrics template.
 * Optionally parses a CPU profile to estimate long-running functions.
 *
 * Usage:
 *   node scripts/collect-event-loop-blocking-metrics.js [--project small|medium|large] [--output metrics.json]
 *   node scripts/collect-event-loop-blocking-metrics.js --parse-profile <file.cpuprofile> [--output metrics.json]
 */

const fs = require('fs');
const path = require('path');

function getDefaultOutputPath(project) {
  const dir = path.join(process.cwd(), 'performance-metrics');
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (_) {}
  return path.join(dir, `event-loop-blocking-${project || 'run'}.json`);
}

function writeTemplate(outputPath, project) {
  const template = {
    scenario: 'event-loop-blocking',
    project: project || 'unknown',
    collectedAt: new Date().toISOString(),
    instructions:
      'Manual: Start profiling. Trigger workspace load. During load, type/scroll. Note UI freezes. Stop profiling. Fill metrics or use --parse-profile.',
    metrics: {
      // longTaskCount: number of tasks that ran >100ms (event-loop blockers).
      longTaskCount: null,
      // maxBlockingMs: longest single blocking stretch in ms (max self-time of any sample).
      maxBlockingMs: null,
      eventLoopLagMaxMs: null,
      profilePath: null,
    },
  };
  fs.writeFileSync(outputPath, JSON.stringify(template, null, 2), 'utf8');
  console.log(`Wrote metrics template: ${outputPath}`);
}

function printInstructions(project) {
  console.log(`
Event Loop Blocking Metrics – Manual Steps
==========================================
1. Open the ${project || 'target'} Apex project in VS Code/Cursor.
2. Start CPU profiling with tag: event-loop-blocking-${project || 'run'}.
3. Trigger workspace load (Find All References).
4. During load: type in editor, scroll, open files. Note when UI freezes and for how long.
5. Stop profiling.
6. In CPU profile analysis, look for functions with high self time (>100ms) and high hit count.
7. Fill metrics (longTaskCount, maxBlockingMs) or use --parse-profile.
`);
}

function parseProfileForEventLoop(profilePath) {
  const raw = fs.readFileSync(profilePath, 'utf8');
  const profile = JSON.parse(raw);
  const nodes = profile.nodes || [];
  const samples = profile.samples || [];
  const timeDeltas = profile.timeDeltas || [];
  const nodeById = new Map();
  for (const n of nodes) nodeById.set(n.id, n);
  const selfTimeUs = new Map();
  for (let i = 0; i < samples.length; i++) {
    const deltaUs = timeDeltas[i] != null ? timeDeltas[i] : 1000;
    const id = samples[i];
    selfTimeUs.set(id, (selfTimeUs.get(id) || 0) + deltaUs);
  }
  let longTaskCount = 0;
  let maxBlockingUs = 0;
  for (const [id, us] of selfTimeUs) {
    if (us > 100000) longTaskCount++;
    if (us > maxBlockingUs) maxBlockingUs = us;
  }
  const totalUs = timeDeltas.length
    ? timeDeltas.reduce((a, b) => a + b, 0)
    : profile.endTime - profile.startTime || 0;
  return {
    totalProfileTimeMs: Math.round(totalUs / 1000),
    longTaskCount,
    maxBlockingMs: Math.round(maxBlockingUs / 1000),
    eventLoopLagMaxMs: null,
    profilePath,
  };
}

function main() {
  const args = process.argv.slice(2);
  let project = 'run';
  let outputPath = null;
  let parseProfilePath = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--project' && i + 1 < args.length) project = args[++i];
    else if (args[i] === '--output' && i + 1 < args.length)
      outputPath = args[++i];
    else if (args[i] === '--parse-profile' && i + 1 < args.length)
      parseProfilePath = args[++i];
  }

  outputPath = outputPath || getDefaultOutputPath(project);

  if (parseProfilePath) {
    if (!fs.existsSync(parseProfilePath)) {
      console.error(`Profile not found: ${parseProfilePath}`);
      process.exit(1);
    }
    const metrics = parseProfileForEventLoop(parseProfilePath);
    const out = {
      scenario: 'event-loop-blocking',
      project,
      collectedAt: new Date().toISOString(),
      source: { type: 'cpuprofile', path: parseProfilePath },
      metrics,
    };
    fs.writeFileSync(outputPath, JSON.stringify(out, null, 2), 'utf8');
    console.log(`Wrote metrics from profile: ${outputPath}`);
    return;
  }

  writeTemplate(outputPath, project);
  printInstructions(project);
}

main();
