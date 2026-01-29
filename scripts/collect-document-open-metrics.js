#!/usr/bin/env node
/*
 * Collect metrics for document open processing (burst of didOpen, pipeline clogging).
 * Manual testing or log parsing; outputs instructions and a metrics template.
 * Optionally parses a CPU profile to attribute time to document-open related functions.
 *
 * Usage:
 *   node scripts/collect-document-open-metrics.js [--project small|medium|large] [--output metrics.json]
 *   node scripts/collect-document-open-metrics.js --parse-profile <file.cpuprofile> [--output metrics.json]
 *   node scripts/collect-document-open-metrics.js --parse-log <server-log.txt> [--output metrics.json]
 */

const fs = require('fs');
const path = require('path');

function getDefaultOutputPath(project) {
  const dir = path.join(process.cwd(), 'performance-metrics');
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (_) {}
  return path.join(dir, `document-open-${project || 'run'}.json`);
}

function writeTemplate(outputPath, project) {
  const template = {
    scenario: 'document-open',
    project: project || 'unknown',
    collectedAt: new Date().toISOString(),
    instructions:
      'Manual: Start profiling with tag document-open. Trigger workspace load (500+ didOpen). Stop profiling. Fill metrics or use --parse-profile/--parse-log.',
    metrics: {
      documentOpenCount: null,
      totalTimeMs: null,
      documentsPerSecond: null,
      maxQueueDepth: null,
      profilePath: null,
    },
  };
  fs.writeFileSync(outputPath, JSON.stringify(template, null, 2), 'utf8');
  console.log(`Wrote metrics template: ${outputPath}`);
}

function printInstructions(project) {
  console.log(`
Document Open Metrics – Manual Steps
====================================
1. Open the ${project || 'target'} Apex project in VS Code/Cursor.
2. Start CPU profiling with tag: document-open-${project || 'run'}.
3. Trigger full workspace load (Find All References) so 500+ textDocument/didOpen are sent.
4. Wait for load to complete. Stop profiling.
5. Run: node scripts/analyze-cpu-profiles.js <profile.cpuprofile>
6. Fill metrics (documentOpenCount, totalTimeMs, documentsPerSecond) or use --parse-profile/--parse-log.
`);
}

function parseProfileForDocumentOpen(profilePath) {
  const raw = fs.readFileSync(profilePath, 'utf8');
  const profile = JSON.parse(raw);
  const nodes = profile.nodes || [];
  const timeDeltas = profile.timeDeltas || [];
  const totalUs = timeDeltas.length
    ? timeDeltas.reduce((a, b) => a + b, 0)
    : profile.endTime - profile.startTime || 0;
  const docRelated = nodes.filter((n) => {
    const name = ((n.callFrame || {}).functionName || '').toLowerCase();
    return (
      name.includes('didopen') ||
      name.includes('document') ||
      name.includes('open') ||
      name.includes('textdocument')
    );
  }).length;
  return {
    totalTimeMs: Math.round(totalUs / 1000),
    documentOpenCount: null,
    documentsPerSecond: null,
    maxQueueDepth: null,
    profilePath,
    documentRelatedNodes: docRelated,
  };
}

function parseLogForDocumentOpen(logPath) {
  const log = fs.readFileSync(logPath, 'utf8');
  const didOpenMatches = log.match(/didOpen|textDocument\/didOpen/g);
  const count = didOpenMatches ? didOpenMatches.length : 0;
  return {
    documentOpenCount: count,
    totalTimeMs: null,
    documentsPerSecond: null,
    maxQueueDepth: null,
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
    const metrics = parseProfileForDocumentOpen(parseProfilePath);
    const out = {
      scenario: 'document-open',
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
    const metrics = parseLogForDocumentOpen(parseLogPath);
    const out = {
      scenario: 'document-open',
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
