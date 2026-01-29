#!/usr/bin/env node
/*
 * Collect metrics for high-priority request processing (hover, go-to-definition).
 * Outputs instructions and a metrics template. Use --parse-results to fill from
 * hover-test-results.json (from run-hover-test.js / hover-test.js in project dir).
 *
 * Usage:
 *   node scripts/collect-high-priority-request-metrics.js [--project-dir .] [--project small] [--output metrics.json]
 *   node scripts/collect-high-priority-request-metrics.js --parse-results path/to/hover-test-results.json [--project small] [--output metrics.json]
 */

const fs = require('fs');
const path = require('path');

function getDefaultOutputPath(project) {
  const dir = path.join(process.cwd(), 'performance-metrics');
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (_) {}
  return path.join(dir, `high-priority-request-${project || 'run'}.json`);
}

function writeTemplateAndInstructions(projectDir, project, outputPath, count) {
  const template = {
    scenario: 'high-priority-request',
    project: project || 'unknown',
    collectedAt: new Date().toISOString(),
    instructions:
      'Run hover test in project: node run-hover-test.js (or hover-test.js with LSP). Then use --parse-results hover-test-results.json to fill metrics.',
    metrics: {
      requestCount: null,
      successCount: null,
      avgLatencyMs: null,
      minLatencyMs: null,
      maxLatencyMs: null,
      p95LatencyMs: null,
    },
  };
  fs.writeFileSync(outputPath, JSON.stringify(template, null, 2), 'utf8');
  console.log(`Wrote metrics template: ${outputPath}`);
  console.log(`
High-Priority Request Metrics (Hover / Go-to-Def)
=================================================
1. Open project in VS Code/Cursor: ${projectDir || '.'}
2. Start profiling with tag: high-priority-${project || 'run'}.
3. In project dir run: node run-hover-test.js --count ${count || 50}
4. Hover over symbols from hover-positions.json (optionally during workspace load).
5. If you ran hover-test.js with LSP, use: --parse-results hover-test-results.json
`);
}

function main() {
  const args = process.argv.slice(2);
  let projectDir = process.cwd();
  let project = 'run';
  let outputPath = null;
  let count = 50;
  let parseResultsPath = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--project-dir' && i + 1 < args.length)
      projectDir = args[++i];
    else if (args[i] === '--project' && i + 1 < args.length)
      project = args[++i];
    else if (args[i] === '--output' && i + 1 < args.length)
      outputPath = args[++i];
    else if (args[i] === '--count' && i + 1 < args.length)
      count = parseInt(args[++i], 10);
    else if (args[i] === '--parse-results' && i + 1 < args.length)
      parseResultsPath = args[++i];
  }

  outputPath = outputPath || getDefaultOutputPath(project);

  if (parseResultsPath) {
    if (!fs.existsSync(parseResultsPath)) {
      console.error(`Results file not found: ${parseResultsPath}`);
      process.exit(1);
    }
    const data = JSON.parse(fs.readFileSync(parseResultsPath, 'utf8'));
    const summary = data.summary || {};
    const out = {
      scenario: 'high-priority-request',
      project,
      collectedAt: new Date().toISOString(),
      source: { type: 'hover-test-results', path: parseResultsPath },
      metrics: {
        requestCount: summary.total ?? data.results?.length,
        successCount: summary.successful ?? null,
        avgLatencyMs:
          summary.avgTime != null ? Math.round(summary.avgTime) : null,
        minLatencyMs: summary.minTime ?? null,
        maxLatencyMs: summary.maxTime ?? null,
        p95LatencyMs: null,
      },
    };
    fs.writeFileSync(outputPath, JSON.stringify(out, null, 2), 'utf8');
    console.log(`Wrote metrics from results: ${outputPath}`);
    return;
  }

  writeTemplateAndInstructions(projectDir, project, outputPath, count);
}

main();
