#!/usr/bin/env node
/*
 * Collect metrics for deferred reference processing (retry explosion, background work).
 * Manual testing or log parsing; outputs instructions and a metrics template.
 * Optionally parses a CPU profile to attribute time to deferred/retry related functions.
 *
 * Usage:
 *   node scripts/collect-deferred-reference-metrics.js [--project small|medium|large] [--output metrics.json]
 *   node scripts/collect-deferred-reference-metrics.js --parse-profile <file.cpuprofile> [--output metrics.json]
 *   node scripts/collect-deferred-reference-metrics.js --parse-log <server-log.txt> [--output metrics.json]
 */

const fs = require('fs');
const path = require('path');

function getDefaultOutputPath(project) {
  const dir = path.join(process.cwd(), 'performance-metrics');
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (_) {}
  return path.join(dir, `deferred-reference-${project || 'run'}.json`);
}

function writeTemplate(outputPath, project) {
  const template = {
    scenario: 'deferred-reference',
    project: project || 'unknown',
    collectedAt: new Date().toISOString(),
    instructions:
      'Manual: Start profiling with tag deferred-reference. Trigger workspace load (lazy mode). Wait for background resolution. Stop profiling. Fill metrics or use --parse-profile/--parse-log.',
    metrics: {
      retryCount: null,
      deferredTaskCount: null,
      timeSpentMs: null,
      profilePath: null,
    },
  };
  fs.writeFileSync(outputPath, JSON.stringify(template, null, 2), 'utf8');
  console.log(`Wrote metrics template: ${outputPath}`);
}

function printInstructions(project) {
  console.log(`
Deferred Reference Metrics – Manual Steps
=========================================
1. Open the ${project || 'target'} Apex project in VS Code/Cursor.
2. Start CPU profiling with tag: deferred-reference-${project || 'run'}.
3. Trigger workspace load (Find All References) so deferred reference resolution runs (with retries).
4. Wait for background resolution to settle. Stop profiling.
5. In CPU profile, look for deferred/retry/reference-related functions.
6. Fill metrics (retryCount, deferredTaskCount, timeSpentMs) or use --parse-profile/--parse-log.
`);
}

function parseProfileForDeferred(profilePath) {
  const raw = fs.readFileSync(profilePath, 'utf8');
  const profile = JSON.parse(raw);
  const nodes = profile.nodes || [];
  const timeDeltas = profile.timeDeltas || [];
  const totalUs = timeDeltas.length
    ? timeDeltas.reduce((a, b) => a + b, 0)
    : profile.endTime - profile.startTime || 0;
  const deferredRelated = nodes.filter((n) => {
    const name = ((n.callFrame || {}).functionName || '').toLowerCase();
    return (
      name.includes('deferred') ||
      name.includes('retry') ||
      name.includes('reference') ||
      name.includes('background')
    );
  }).length;
  return {
    totalTimeMs: Math.round(totalUs / 1000),
    retryCount: null,
    deferredTaskCount: null,
    timeSpentMs: null,
    profilePath,
    deferredRelatedNodes: deferredRelated,
  };
}

function parseLogForDeferred(logPath) {
  const log = fs.readFileSync(logPath, 'utf8');
  const retryMatches = log.match(/retry|Retry/g);
  const deferredMatches = log.match(/deferred|Deferred/g);
  return {
    retryCount: retryMatches ? retryMatches.length : null,
    deferredTaskCount: deferredMatches ? deferredMatches.length : null,
    timeSpentMs: null,
  };
}

function main() {
  const args = process.argv.slice(2);
  let project = 'run';
  let outputPath = null;
  let parseProfilePath = null;
  let parseLogPath = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--project' && i + 1 < args.length) project = args[++i];
    else if (args[i] === '--output' && i + 1 < args.length)
      outputPath = args[++i];
    else if (args[i] === '--parse-profile' && i + 1 < args.length)
      parseProfilePath = args[++i];
    else if (args[i] === '--parse-log' && i + 1 < args.length)
      parseLogPath = args[++i];
  }

  outputPath = outputPath || getDefaultOutputPath(project);

  if (parseProfilePath) {
    if (!fs.existsSync(parseProfilePath)) {
      console.error(`Profile not found: ${parseProfilePath}`);
      process.exit(1);
    }
    const metrics = parseProfileForDeferred(parseProfilePath);
    const out = {
      scenario: 'deferred-reference',
      project,
      collectedAt: new Date().toISOString(),
      source: { type: 'cpuprofile', path: parseProfilePath },
      metrics,
    };
    fs.writeFileSync(outputPath, JSON.stringify(out, null, 2), 'utf8');
    console.log(`Wrote metrics from profile: ${outputPath}`);
    return;
  }

  if (parseLogPath) {
    if (!fs.existsSync(parseLogPath)) {
      console.error(`Log file not found: ${parseLogPath}`);
      process.exit(1);
    }
    const metrics = parseLogForDeferred(parseLogPath);
    const out = {
      scenario: 'deferred-reference',
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
