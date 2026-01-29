#!/usr/bin/env node
/*
 * Collect metrics for workspace loading performance (lazy → full awareness).
 * Cannot trigger "Find All References" from Node; outputs instructions and a metrics
 * template. Optionally parses a CPU profile or log file to fill metrics.
 *
 * Usage:
 *   node scripts/collect-workspace-load-metrics.js [--project small|medium|large] [--output metrics.json]
 *   node scripts/collect-workspace-load-metrics.js --parse-profile <file.cpuprofile> [--output metrics.json]
 *   node scripts/collect-workspace-load-metrics.js --parse-log <server-log.txt> [--output metrics.json]
 */

const fs = require('fs');
const path = require('path');

function getDefaultOutputPath(project) {
  const dir = path.join(process.cwd(), 'performance-metrics');
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (_) {}
  return path.join(dir, `workspace-load-${project || 'run'}.json`);
}

function writeTemplate(outputPath, project) {
  const template = {
    scenario: 'workspace-load',
    project: project || 'unknown',
    collectedAt: new Date().toISOString(),
    instructions:
      'Manual: Start CPU profiling with tag workspace-load. Trigger Find All References. Stop profiling. Fill metrics from profile or log.',
    metrics: {
      totalTimeMs: null,
      filesProcessed: null,
      filesPerSecond: null,
      queueDepthMax: null,
      profilePath: null,
    },
  };
  fs.writeFileSync(outputPath, JSON.stringify(template, null, 2), 'utf8');
  console.log(`Wrote metrics template: ${outputPath}`);
}

function printInstructions(project) {
  console.log(`
Workspace Load Metrics – Manual Steps
=====================================
Automated option (equal across 3 projects): from repo root run:
  ./scripts/run-all-workspace-loads.sh

Manual (when you need CPU profiles):
1. Open the ${project || 'target'} Apex project in VS Code/Cursor.
2. Set apex.environment.serverMode to "development" and enable profiling.
3. Start CPU profiling with tag: workspace-load-${project || 'run'}.
4. Trigger full workspace load: run "Find All References" (e.g. on a common symbol).
5. Wait until loading completes (watch Output panel for queue state).
6. Stop CPU profiling.
7. Run: node scripts/analyze-cpu-profiles.js <saved.cpuprofile> --output report.html
8. Fill metrics in the JSON template (totalTimeMs, filesProcessed, etc.) or use --parse-profile/--parse-log.
`);
}

function parseProfileForWorkspaceLoad(profilePath) {
  const raw = fs.readFileSync(profilePath, 'utf8');
  const profile = JSON.parse(raw);
  const nodes = profile.nodes || [];
  const samples = profile.samples || [];
  const timeDeltas = profile.timeDeltas || [];
  // totalTimeMs = full profile duration (wall clock from start to stop), not "workspace load only".
  // Only comparable across runs if you start profiling right before and stop right after the load.
  let totalUs = 0;
  if (timeDeltas.length) {
    totalUs = timeDeltas.reduce((a, b) => a + b, 0);
  } else {
    totalUs = profile.endTime - profile.startTime || 0;
  }
  const totalMs = totalUs / 1000;
  const workspaceRelated = nodes.filter((n) => {
    const name = ((n.callFrame || {}).functionName || '').toLowerCase();
    return (
      name.includes('workspace') ||
      name.includes('reference') ||
      name.includes('index') ||
      name.includes('batch')
    );
  }).length;
  return {
    totalTimeMs: Math.round(totalMs),
    filesProcessed: null,
    filesPerSecond: null,
    queueDepthMax: null,
    profilePath,
    nodesAnalyzed: nodes.length,
    workspaceRelatedNodes: workspaceRelated,
  };
}

function main() {
  const args = process.argv.slice(2);
  let project = 'run';
  let outputPath = null;
  let parseProfilePath = null;
  let parseLogPath = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--project' && i + 1 < args.length) {
      project = args[++i];
    } else if (args[i] === '--output' && i + 1 < args.length) {
      outputPath = args[++i];
    } else if (args[i] === '--parse-profile' && i + 1 < args.length) {
      parseProfilePath = args[++i];
    } else if (args[i] === '--parse-log' && i + 1 < args.length) {
      parseLogPath = args[++i];
    }
  }

  outputPath = outputPath || getDefaultOutputPath(project);

  if (parseProfilePath) {
    if (!fs.existsSync(parseProfilePath)) {
      console.error(`Profile not found: ${parseProfilePath}`);
      process.exit(1);
    }
    const metrics = parseProfileForWorkspaceLoad(parseProfilePath);
    const out = {
      scenario: 'workspace-load',
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
    const log = fs.readFileSync(parseLogPath, 'utf8');
    const queueStateLines = log
      .split('\n')
      .filter((l) => l.includes('[QueueState]'));
    let queueDepthMax = 0;
    for (const line of queueStateLines) {
      const idx = line.indexOf('{');
      if (idx === -1) continue;
      try {
        const obj = JSON.parse(line.slice(idx));
        const sizes = obj.queueSizes || {};
        const sum = Object.values(sizes).reduce((a, b) => a + Number(b), 0);
        queueDepthMax = Math.max(queueDepthMax, sum);
      } catch (_) {
        const m = line.match(/"\d+":(\d+)/g);
        if (m) {
          for (const part of m) {
            const v = parseInt(part.split(':')[1], 10);
            queueDepthMax = Math.max(queueDepthMax, v);
          }
        }
      }
    }
    const out = {
      scenario: 'workspace-load',
      project,
      collectedAt: new Date().toISOString(),
      source: { type: 'log', path: parseLogPath },
      metrics: {
        totalTimeMs: null,
        filesProcessed: null,
        filesPerSecond: null,
        queueDepthMax: queueDepthMax || null,
      },
    };
    fs.writeFileSync(outputPath, JSON.stringify(out, null, 2), 'utf8');
    console.log(`Wrote metrics from log: ${outputPath}`);
    return;
  }

  writeTemplate(outputPath, project);
  printInstructions(project);
}

main();
