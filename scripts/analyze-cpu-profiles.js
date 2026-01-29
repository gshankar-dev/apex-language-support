#!/usr/bin/env node
/*
 * Automated CPU profile analysis for Apex Language Server performance profiling.
 * Parses V8/Node .cpuprofile JSON, analyzes 7 bottleneck categories, and
 * generates HTML reports with interactive Chart.js visualizations.
 *
 * Usage:
 *   node scripts/analyze-cpu-profiles.js <profile.cpuprofile> [--output report.html]
 *   node scripts/analyze-cpu-profiles.js --dir <profiles-dir> [--output report.html]
 *
 * Bottleneck categories (aligned with Performance Profiling doc):
 * 1. Workspace loading
 * 2. Client responsiveness / back pressure
 * 3. High-priority request processing (hover, go-to-definition)
 * 4. Event loop blocking
 * 5. Queue priority management
 * 6. Document open processing
 * 7. Deferred reference processing
 */

const fs = require('fs');
const path = require('path');

const BOTTLENECK_CATEGORIES = {
  workspaceLoading: {
    name: 'Workspace Loading',
    keywords: [
      'workspace',
      'Workspace',
      'findAllReferences',
      'findReferences',
      'symbolIndex',
      'SymbolIndex',
      'batch',
      'Batch',
      'loadWorkspace',
      'fullWorkspace',
      'lazy',
      'Indexer',
      'indexer',
    ],
  },
  clientResponsiveness: {
    name: 'Client Responsiveness',
    keywords: [
      'backPressure',
      'back pressure',
      'sendRequest',
      'notification',
      'response',
      'client',
      'Client',
      'connection',
      'Connection',
    ],
  },
  highPriorityRequest: {
    name: 'High-Priority Request (Hover, Go-to-Def)',
    keywords: [
      'hover',
      'Hover',
      'definition',
      'Definition',
      'goToDefinition',
      'textDocument/hover',
      'immediate',
      'Immediate',
      'priority',
    ],
  },
  eventLoopBlocking: {
    name: 'Event Loop Blocking',
    keywords: [
      'runMicrotasks',
      'nextTick',
      'setImmediate',
      'Promise',
      '(idle)',
      '(program)',
      'Timer',
      'timers',
    ],
  },
  queuePriority: {
    name: 'Queue Priority Management',
    keywords: [
      'queue',
      'Queue',
      'scheduler',
      'Scheduler',
      'priority',
      'enqueue',
      'dequeue',
      'processTask',
      'Priority',
    ],
  },
  documentOpen: {
    name: 'Document Open Processing',
    keywords: [
      'didOpen',
      'didChange',
      'textDocument',
      'documentOpen',
      'DocumentManager',
      'document',
      'openDocument',
    ],
  },
  deferredReference: {
    name: 'Deferred Reference Processing',
    keywords: [
      'deferred',
      'Deferred',
      'retry',
      'Retry',
      'reference',
      'references',
      'resolveReference',
      'background',
    ],
  },
};

function categorizeFunction(name, url = '') {
  const text = `${name || ''} ${url || ''}`.toLowerCase();
  for (const [key, config] of Object.entries(BOTTLENECK_CATEGORIES)) {
    for (const kw of config.keywords) {
      if (text.includes(kw.toLowerCase())) return key;
    }
  }
  return 'other';
}

function loadProfile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function parseProfile(profile) {
  const nodes = profile.nodes || [];
  const samples = profile.samples || [];
  const timeDeltas = profile.timeDeltas || [];

  if (samples.length === 0)
    return { byCategory: {}, byFunction: [], totalTime: 0 };

  const nodeById = new Map();
  for (const node of nodes) {
    nodeById.set(node.id, node);
  }

  const selfTimeUs = new Map();
  for (let i = 0; i < samples.length; i++) {
    const nodeId = samples[i];
    const deltaUs = timeDeltas[i] != null ? timeDeltas[i] : 1000;
    selfTimeUs.set(nodeId, (selfTimeUs.get(nodeId) || 0) + deltaUs);
  }

  let totalTime = 0;
  const byCategory = {};
  for (const key of Object.keys(BOTTLENECK_CATEGORIES)) byCategory[key] = 0;
  byCategory.other = 0;

  const byFunction = [];
  for (const [nodeId, timeUs] of selfTimeUs) {
    const node = nodeById.get(parseInt(nodeId, 10));
    if (!node) continue;
    const callFrame = node.callFrame || {};
    const name = callFrame.functionName || '(anonymous)';
    const url = callFrame.url || '';
    totalTime += timeUs;
    const category = categorizeFunction(name, url);
    byCategory[category] = (byCategory[category] || 0) + timeUs;
    byFunction.push({
      name,
      url,
      category,
      selfTimeUs: timeUs,
      selfTimeMs: (timeUs / 1000).toFixed(2),
    });
  }

  byFunction.sort((a, b) => b.selfTimeUs - a.selfTimeUs);

  return { byCategory, byFunction, totalTime };
}

function generateHtmlReport(analysisResults, outputPath, sourceLabel) {
  const categories = Object.entries(BOTTLENECK_CATEGORIES).map(([key, c]) => ({
    key,
    name: c.name,
    timeMs: (analysisResults.byCategory[key] || 0) / 1000,
  }));
  const totalMs = analysisResults.totalTime / 1000;
  categories.forEach((c) => {
    c.percent = totalMs > 0 ? ((c.timeMs / totalMs) * 100).toFixed(1) : '0';
  });

  const topFunctions = analysisResults.byFunction.slice(0, 30).map((f) => ({
    name: f.name.length > 60 ? f.name.slice(0, 57) + '...' : f.name,
    category: f.category,
    selfTimeMs: f.selfTimeMs,
  }));

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CPU Profile Analysis - Apex LS</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: system-ui, sans-serif; margin: 24px; background: #1e1e1e; color: #d4d4d4; }
    h1 { color: #4ec9b0; }
    h2 { color: #9cdcfe; margin-top: 32px; }
    .meta { color: #808080; margin-bottom: 24px; }
    table { border-collapse: collapse; width: 100%; margin: 16px 0; }
    th, td { border: 1px solid #404040; padding: 8px 12px; text-align: left; }
    th { background: #2d2d2d; color: #4ec9b0; }
    tr:nth-child(even) { background: #252526; }
    .chart-container { max-width: 600px; height: 300px; margin: 24px 0; }
    code { background: #3c3c3c; padding: 2px 6px; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>CPU Profile Analysis</h1>
  <p class="meta">Source: ${sourceLabel} | Total sampled time: ${totalMs.toFixed(2)} ms | Generated: ${new Date().toISOString()}</p>

  <h2>Time by Bottleneck Category</h2>
  <div class="chart-container">
    <canvas id="categoryChart"></canvas>
  </div>
  <table>
    <thead><tr><th>Category</th><th>Time (ms)</th><th>%</th></tr></thead>
    <tbody>
      ${categories.map((c) => `<tr><td>${c.name}</td><td>${Number(c.timeMs).toFixed(2)}</td><td>${c.percent}%</td></tr>`).join('')}
    </tbody>
  </table>

  <h2>Top 30 Functions by Self Time</h2>
  <table>
    <thead><tr><th>Function</th><th>Category</th><th>Self time (ms)</th></tr></thead>
    <tbody>
      ${topFunctions.map((f) => `<tr><td><code>${escapeHtml(f.name)}</code></td><td>${f.category}</td><td>${f.selfTimeMs}</td></tr>`).join('')}
    </tbody>
  </table>

  <script>
    const categories = ${JSON.stringify(categories)};
    const ctx = document.getElementById('categoryChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: categories.map(c => c.name),
        datasets: [{
          label: 'Time (ms)',
          data: categories.map(c => c.timeMs),
          backgroundColor: categories.map((_, i) => [
            'rgba(78, 201, 176, 0.8)',
            'rgba(156, 220, 254, 0.8)',
            'rgba(206, 145, 120, 0.8)',
            'rgba(189, 147, 249, 0.8)',
            'rgba(241, 250, 140, 0.8)',
            'rgba(255, 121, 198, 0.8)',
            'rgba(80, 250, 123, 0.8)',
            'rgba(128, 128, 128, 0.8)',
          ][i % 8]),
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#404040' }, ticks: { color: '#d4d4d4' } },
          x: { grid: { display: false }, ticks: { color: '#d4d4d4', maxRotation: 45 } },
        },
      },
    });
  </script>
</body>
</html>`;

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  fs.writeFileSync(outputPath, html, 'utf8');
  console.log(`Wrote HTML report: ${outputPath}`);
}

function main() {
  const args = process.argv.slice(2);
  let profilePath = null;
  let dirPath = null;
  let outputPath = path.join(process.cwd(), 'cpu-profile-analysis.html');

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--output' && i + 1 < args.length) {
      outputPath = args[++i];
    } else if (args[i] === '--dir' && i + 1 < args.length) {
      dirPath = args[++i];
    } else if (!args[i].startsWith('--')) {
      profilePath = args[i];
    }
  }

  if (!profilePath && !dirPath) {
    console.error(
      'Usage: node scripts/analyze-cpu-profiles.js <file.cpuprofile> [--output report.html]',
    );
    console.error(
      '   or: node scripts/analyze-cpu-profiles.js --dir <dir> [--output report.html]',
    );
    process.exit(1);
  }

  let analysis;
  let sourceLabel;

  if (profilePath) {
    if (!fs.existsSync(profilePath)) {
      console.error(`File not found: ${profilePath}`);
      process.exit(1);
    }
    const profile = loadProfile(profilePath);
    analysis = parseProfile(profile);
    sourceLabel = path.basename(profilePath);
  } else if (dirPath) {
    if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
      console.error(`Directory not found or not a directory: ${dirPath}`);
      process.exit(1);
    }
    const files = fs
      .readdirSync(dirPath)
      .filter((f) => f.endsWith('.cpuprofile'));
    if (files.length === 0) {
      console.error(`No .cpuprofile files in: ${dirPath}`);
      process.exit(1);
    }
    const combined = { byCategory: {}, byFunction: [], totalTime: 0 };
    for (const key of Object.keys(BOTTLENECK_CATEGORIES))
      combined.byCategory[key] = 0;
    combined.byCategory.other = 0;
    for (const f of files) {
      const p = loadProfile(path.join(dirPath, f));
      const a = parseProfile(p);
      for (const [k, v] of Object.entries(a.byCategory)) {
        combined.byCategory[k] = (combined.byCategory[k] || 0) + v;
      }
      combined.totalTime += a.totalTime;
      combined.byFunction.push(...a.byFunction);
    }
    combined.byFunction.sort((a, b) => b.selfTimeUs - a.selfTimeUs);
    analysis = combined;
    sourceLabel = `${dirPath} (${files.length} profiles)`;
  } else {
    console.error(
      'Provide either a .cpuprofile file path or --dir <directory>',
    );
    process.exit(1);
  }

  generateHtmlReport(analysis, outputPath, sourceLabel);
}

main();
