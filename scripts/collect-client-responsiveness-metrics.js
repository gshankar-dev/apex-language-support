#!/usr/bin/env node
/*
 * Collect metrics for client responsiveness (UI locking, back pressure).
 * Requires manual testing in the IDE; outputs instructions and a metrics template.
 * Optionally parses a CPU profile or log to extract blocking/lag metrics.
 *
 * Usage:
 *   node scripts/collect-client-responsiveness-metrics.js [--project small|medium|large] [--output metrics.json]
 *   node scripts/collect-client-responsiveness-metrics.js --parse-profile <file.cpuprofile> [--output metrics.json]
 */

const fs = require('fs');
const path = require('path');

function getDefaultOutputPath(project) {
  const dir = path.join(process.cwd(), 'performance-metrics');
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (_) {}
  return path.join(dir, `client-responsiveness-${project || 'run'}.json`);
}

function writeTemplate(outputPath, project) {
  const template = {
    scenario: 'client-responsiveness',
    project: project || 'unknown',
    collectedAt: new Date().toISOString(),
    instructions:
      'Manual: Start profiling. During workspace load, type/scroll/open files. Note UI freezes. Stop profiling. Fill metrics.',
    metrics: {
      uiFreezeCount: null,
      maxFreezeDurationMs: null,
      eventLoopLagMaxMs: null,
      backPressureEvents: null,
      profilePath: null,
    },
  };
  fs.writeFileSync(outputPath, JSON.stringify(template, null, 2), 'utf8');
  console.log(`Wrote metrics template: ${outputPath}`);
}

function printInstructions(project) {
  console.log(`
Client Responsiveness Metrics – Manual Steps
============================================
1. Open the ${project || 'target'} Apex project in VS Code/Cursor.
2. Start CPU profiling with tag: client-responsiveness-${project || 'run'}.
3. Trigger workspace load (Find All References).
4. While loading, interact with the UI: type, scroll, open files, run hover.
5. Note: number of UI freezes, approximate max freeze duration (ms).
6. Stop profiling.
7. Fill the metrics JSON (uiFreezeCount, maxFreezeDurationMs, etc.) or use --parse-profile.
`);
}

function parseProfileForResponsiveness(profilePath) {
  const raw = fs.readFileSync(profilePath, 'utf8');
  const profile = JSON.parse(raw);
  const nodes = profile.nodes || [];
  const timeDeltas = profile.timeDeltas || [];
  const totalUs = timeDeltas.length
    ? timeDeltas.reduce((a, b) => a + b, 0)
    : profile.endTime - profile.startTime || 0;
  const totalMs = totalUs / 1000;
  const blockingRelated = nodes.filter((n) => {
    const name = ((n.callFrame || {}).functionName || '').toLowerCase();
    return (
      name.includes('send') ||
      name.includes('response') ||
      name.includes('notification') ||
      name.includes('connection')
    );
  }).length;
  return {
    totalProfileTimeMs: Math.round(totalMs),
    blockingRelatedNodes: blockingRelated,
    profilePath,
    uiFreezeCount: null,
    maxFreezeDurationMs: null,
    eventLoopLagMaxMs: null,
  };
}

function main() {
  const args = process.argv.slice(2);
  let project = 'run';
  let outputPath = null;
  let parseProfilePath = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--project' && i + 1 < args.length) {
      project = args[++i];
    } else if (args[i] === '--output' && i + 1 < args.length) {
      outputPath = args[++i];
    } else if (args[i] === '--parse-profile' && i + 1 < args.length) {
      parseProfilePath = args[++i];
    }
  }

  outputPath = outputPath || getDefaultOutputPath(project);

  if (parseProfilePath) {
    if (!fs.existsSync(parseProfilePath)) {
      console.error(`Profile not found: ${parseProfilePath}`);
      process.exit(1);
    }
    const metrics = parseProfileForResponsiveness(parseProfilePath);
    const out = {
      scenario: 'client-responsiveness',
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
