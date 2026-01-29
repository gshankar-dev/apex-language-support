#!/usr/bin/env node
/*
 * Performance comparison report generator for Apex Language Server.
 * Compares metrics across projects (small / medium / large) and generates
 * a report (JSON and optional HTML).
 *
 * Usage:
 *   node scripts/generate-performance-comparison.js [--metrics-dir <dir>] [--output report.json]
 *
 * Expects metrics files named like: workspace-load-metrics.json, hover-metrics.json, etc.
 * Or project-specific: small-workspace-load.json, medium-hover.json, large-document-open.json.
 * Each file should be JSON with: { project, scenario, timestamp, metrics: { ... } }
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_METRICS_DIR = path.join(process.cwd(), 'performance-metrics');
const SCENARIOS = [
  'workspace-load',
  'client-responsiveness',
  'high-priority-request',
  'event-loop-blocking',
  'queue-priority',
  'document-open',
  'deferred-reference',
];
const PROJECT_SIZES = ['small', 'medium', 'large'];

const SCENARIO_CONFIG = [
  {
    id: 'workspace-load',
    title: 'Workspace Loading Performance',
    badge: '🔴',
    description:
      'Transitioning from lazy to full awareness freezes the client.',
    chartFields: [
      { key: 'totalTimeMs', label: 'Total time (ms)' },
      { key: 'filesProcessed', label: 'Files processed' },
      { key: 'filesPerSecond', label: 'Throughput (files/sec)' },
    ],
  },
  {
    id: 'client-responsiveness',
    title: 'Client Responsiveness',
    badge: '🔴',
    description:
      'UI locks during heavy processing (back pressure). From CPU profile: profile duration and node count; UI freeze/lag need instrumentation.',
    chartFields: [
      { key: 'totalProfileTimeMs', label: 'Profile duration (ms)' },
      {
        key: 'blockingRelatedNodes',
        label: 'Send/response/notification nodes',
      },
      { key: 'uiFreezeCount', label: 'UI freeze count (instrumentation)' },
      { key: 'maxFreezeDurationMs', label: 'Max freeze (ms)' },
      { key: 'eventLoopLagMaxMs', label: 'Event loop lag max (ms)' },
    ],
  },
  {
    id: 'high-priority-request',
    title: 'High-Priority Request Processing',
    badge: '🟠',
    description:
      'Hover and Go-to-Definition not preempting lower-priority tasks.',
    chartFields: [
      { key: 'avgLatencyMs', label: 'Avg latency (ms)' },
      { key: 'p95LatencyMs', label: 'P95 latency (ms)' },
      { key: 'successCount', label: 'Success count' },
    ],
  },
  {
    id: 'event-loop-blocking',
    title: 'Event Loop Blocking',
    badge: '🟠',
    description: 'Compute-bound tasks blocking the single thread >100ms.',
    chartFields: [
      { key: 'longTaskCount', label: 'Long task count' },
      { key: 'maxBlockingMs', label: 'Max blocking (ms)' },
      { key: 'eventLoopLagMaxMs', label: 'Event loop lag max (ms)' },
    ],
  },
  {
    id: 'queue-priority',
    title: 'Queue Priority Management',
    badge: '🟡',
    description: '6-queue priority system suffering from starvation.',
    chartFields: [
      { key: 'avgQueueDepth', label: 'Avg queue depth' },
      { key: 'sampleCount', label: 'Queue state samples' },
      { key: 'queueDepthMaxByPriority', label: 'Max depth (sum)' },
    ],
  },
  {
    id: 'document-open',
    title: 'Document Open Processing',
    badge: '🟡',
    description: 'Bursts of file opens (500+) clog the pipeline.',
    chartFields: [
      { key: 'documentOpenCount', label: 'Document open count' },
      { key: 'totalTimeMs', label: 'Total time (ms)' },
      { key: 'documentsPerSecond', label: 'Documents/sec' },
    ],
  },
  {
    id: 'deferred-reference',
    title: 'Deferred Reference Processing',
    badge: '🟢',
    description:
      'Retry mechanisms causing explosion of background work. From CPU profile: duration and deferred/retry-related node count; retry/task counts need logs or instrumentation.',
    chartFields: [
      { key: 'totalTimeMs', label: 'Profile duration (ms)' },
      { key: 'deferredRelatedNodes', label: 'Deferred/retry/reference nodes' },
      { key: 'retryCount', label: 'Retry count (from logs)' },
      { key: 'deferredTaskCount', label: 'Deferred task count' },
      { key: 'timeSpentMs', label: 'Time spent (ms)' },
    ],
  },
];

function loadMetricsFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function collectMetricsFromDir(dir) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    return [];
  }
  const entries = [];
  const files = fs.readdirSync(dir);
  for (const f of files) {
    if (!f.endsWith('.json') || f === 'performance-comparison.json') continue;
    const fullPath = path.join(dir, f);
    const data = loadMetricsFile(fullPath);
    if (!data) continue;
    if (data.entries && data.byProject) continue;
    const project = data.project || data.projectSize || inferProject(f);
    const scenario = data.scenario || data.scenarioName || inferScenario(f);
    if (project === 'unknown' && scenario === 'unknown') continue;
    entries.push({
      file: f,
      path: fullPath,
      project,
      scenario,
      timestamp: data.timestamp || data.collectedAt,
      metrics: data.metrics || data,
    });
  }
  return entries;
}

function inferProject(filename) {
  const lower = filename.toLowerCase();
  if (lower.includes('small')) return 'small';
  if (lower.includes('medium')) return 'medium';
  if (lower.includes('large')) return 'large';
  return 'unknown';
}

function inferScenario(filename) {
  const lower = filename.toLowerCase().replace(/-/g, ' ');
  for (const s of SCENARIOS) {
    if (lower.includes(s.replace(/-/g, ' '))) return s;
  }
  return 'unknown';
}

function buildComparison(entries) {
  const byProject = {};
  const byScenario = {};
  for (const e of entries) {
    byProject[e.project] = byProject[e.project] || [];
    byProject[e.project].push(e);
    byScenario[e.scenario] = byScenario[e.scenario] || [];
    byScenario[e.scenario].push(e);
  }
  return {
    generatedAt: new Date().toISOString(),
    sourceFiles: entries.length,
    byProject,
    byScenario,
    entries: entries.map((e) => ({
      file: e.file,
      project: e.project,
      scenario: e.scenario,
      timestamp: e.timestamp,
      metrics: e.metrics,
    })),
  };
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getChartValue(m, key) {
  if (!m || m[key] == null) return 0;
  const v = m[key];
  if (typeof v === 'number' && !Number.isNaN(v)) return v;
  if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
    const vals = Object.values(v).filter((x) => typeof x === 'number');
    return vals.length ? Math.max(...vals) : 0;
  }
  return 0;
}

function buildChartDataByScenario(entries) {
  const byScenario = {};
  for (const e of entries) {
    if (!PROJECT_SIZES.includes(e.project)) continue;
    byScenario[e.scenario] = byScenario[e.scenario] || [];
    byScenario[e.scenario].push(e);
  }
  for (const scenario of Object.keys(byScenario)) {
    byScenario[scenario].sort(
      (a, b) =>
        PROJECT_SIZES.indexOf(a.project) - PROJECT_SIZES.indexOf(b.project),
    );
  }
  return byScenario;
}

function formatMetricValue(val) {
  if (val == null) return '—';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  if (typeof val === 'object')
    return (
      JSON.stringify(val).slice(0, 40) +
      (JSON.stringify(val).length > 40 ? '…' : '')
    );
  if (typeof val === 'number' && (val > 9999 || (val < 1 && val > 0)))
    return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (typeof val === 'number')
    return Number.isInteger(val) ? String(val) : val.toFixed(2);
  return String(val);
}

function generateHtmlReport(comparison, outputPath) {
  const entries = comparison.entries.filter((e) =>
    PROJECT_SIZES.includes(e.project),
  );
  const byScenario = buildChartDataByScenario(entries);

  const scenarioSections = [];
  const chartConfigs = [];

  for (let i = 0; i < SCENARIO_CONFIG.length; i++) {
    const config = SCENARIO_CONFIG[i];
    const data = byScenario[config.id] || [];
    const hasData = data.length > 0;
    const labels = data.map((e) => e.project);
    const chartIds = [];
    const datasets = [];

    for (let j = 0; j < config.chartFields.length; j++) {
      const field = config.chartFields[j];
      const values = data.map((e) => getChartValue(e.metrics, field.key));
      const hasAny = values.some((v) => v !== 0);
      const chartId = `chart_${config.id}_${j}`;
      chartIds.push({ chartId, label: field.label, values, hasAny });
      if (hasAny) datasets.push({ chartId, label: field.label, values });
    }

    scenarioSections.push({
      config,
      hasData,
      labels,
      chartIds: chartIds.filter((c) => c.hasAny),
      noDataMsg: `No data — run collect-*-metrics.js for ${config.id} (see scripts/PERFORMANCE_METRICS_REFERENCE.md)`,
    });
    chartConfigs.push({ config, labels, datasets });
  }

  const allMetricKeys = new Set();
  for (const e of entries) {
    if (e.metrics && typeof e.metrics === 'object') {
      Object.keys(e.metrics).forEach((k) => allMetricKeys.add(k));
    }
  }
  const metricColumns = [...allMetricKeys].slice(0, 14);

  const tableRows = entries.map((e) => {
    const m = e.metrics || {};
    const cells = {
      project: e.project,
      scenario: e.scenario,
      timestamp: (e.timestamp || '-').toString().slice(0, 24),
      ...Object.fromEntries(
        metricColumns.map((col) => [col, formatMetricValue(m[col])]),
      ),
    };
    return cells;
  });

  const tableHeaderCells = [
    'Project',
    'Scenario',
    'Timestamp',
    ...metricColumns,
  ]
    .map((h) => `<th>${escapeHtml(h)}</th>`)
    .join('');

  const sectionsHtml = scenarioSections
    .map(
      (s) => `
  <section class="scenario-section">
    <h2>${s.config.badge} ${escapeHtml(s.config.title)}</h2>
    <p class="scenario-desc">${escapeHtml(s.config.description)}</p>
    ${
      s.hasData && s.chartIds.length > 0
        ? `<div class="charts">${s.chartIds
            .map(
              (c) => `
      <div class="chart-card">
        <h3>${escapeHtml(c.label)}</h3>
        <div class="chart-container"><canvas id="${c.chartId}"></canvas></div>
      </div>`,
            )
            .join('')}</div>`
        : `<p class="no-data">${escapeHtml(s.noDataMsg)}</p>`
    }
  </section>`,
    )
    .join('');

  const tableBodyHtml = tableRows
    .map(
      (r) => `
    <tr>
      <td>${escapeHtml(r.project)}</td>
      <td>${escapeHtml(r.scenario)}</td>
      <td>${escapeHtml(r.timestamp)}</td>
      ${metricColumns.map((col) => `<td class="num">${escapeHtml(r[col] || '—')}</td>`).join('')}
    </tr>`,
    )
    .join('');

  const chartDataForScript = chartConfigs
    .filter((c) => c.datasets.length > 0)
    .flatMap((c) =>
      c.datasets.map((d) => ({
        chartId: d.chartId,
        label: d.label,
        labels: c.labels,
        values: d.values,
      })),
    );

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Performance Comparison - Apex LS</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; margin: 24px; background: #1e1e1e; color: #d4d4d4; max-width: 1200px; }
    h1 { color: #4ec9b0; margin-bottom: 0.25em; }
    h2 { color: #9cdcfe; margin-top: 1.5em; margin-bottom: 0.25em; font-size: 1.1em; }
    .meta { color: #808080; margin-bottom: 24px; font-size: 0.9em; }
    .scenario-section { margin-bottom: 2em; }
    .scenario-desc { color: #9e9e9e; font-size: 0.9em; margin: 0 0 12px 0; }
    .no-data { color: #808080; font-style: italic; padding: 12px; background: #252526; border-radius: 6px; }
    .charts { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin: 12px 0; }
    .chart-card { background: #252526; border-radius: 8px; padding: 16px; border: 1px solid #404040; }
    .chart-card h3 { margin: 0 0 12px 0; font-size: 0.9em; color: #d4d4d4; }
    .chart-container { position: relative; height: 200px; }
    table { border-collapse: collapse; width: 100%; margin: 16px 0; font-size: 0.85em; }
    th, td { border: 1px solid #404040; padding: 8px 10px; text-align: left; }
    th { background: #2d2d2d; color: #4ec9b0; font-weight: 600; }
    tr:nth-child(even) { background: #252526; }
    td.num { text-align: right; font-variant-numeric: tabular-nums; }
  </style>
</head>
<body>
  <h1>Performance Comparison Report</h1>
  <p class="meta">Generated: ${comparison.generatedAt} &bull; ${comparison.sourceFiles} metric file(s) &bull; 7 bottleneck areas</p>

  ${sectionsHtml}

  <h2>All metrics (table)</h2>
  <div style="overflow-x: auto;">
  <table>
    <thead><tr>${tableHeaderCells}</tr></thead>
    <tbody>${tableBodyHtml}
    </tbody>
  </table>
  </div>

  <script>
    (function() {
      const chartData = ${JSON.stringify(chartDataForScript)};
      const barColors = ['#4ec9b0', '#9cdcfe', '#ce9178'];
      const opts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: '#404040' }, ticks: { color: '#d4d4d4', font: { size: 11 } } }, x: { grid: { display: false }, ticks: { color: '#d4d4d4', font: { size: 11 } } } } };
      chartData.forEach(function(c) {
        const el = document.getElementById(c.chartId);
        if (!el) return;
        const colors = barColors.slice(0, c.labels.length);
        new Chart(el, { type: 'bar', data: { labels: c.labels, datasets: [{ label: c.label, data: c.values, backgroundColor: colors, borderColor: colors, borderWidth: 1 }] }, options: opts });
      });
    })();
  </script>
</body>
</html>`;

  fs.writeFileSync(outputPath, html, 'utf8');
  console.log(`Wrote HTML: ${outputPath}`);
}

function summarizeMetrics(m) {
  if (!m || typeof m !== 'object') return m;
  const keys = Object.keys(m);
  if (keys.length <= 8) return m;
  const summary = {};
  for (const k of [
    'totalTimeMs',
    'durationMs',
    'avgLatencyMs',
    'filesProcessed',
    'successCount',
    'errorCount',
    'queueDepth',
    'eventLoopLagMs',
  ]) {
    if (m[k] != null) summary[k] = m[k];
  }
  return Object.keys(summary).length ? summary : m;
}

function main() {
  const args = process.argv.slice(2);
  let metricsDir = DEFAULT_METRICS_DIR;
  let outputJson = path.join(process.cwd(), 'performance-comparison.json');
  let outputHtml = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--metrics-dir' && i + 1 < args.length) {
      metricsDir = args[++i];
    } else if (args[i] === '--output' && i + 1 < args.length) {
      outputJson = args[++i];
    } else if (args[i] === '--html' && i + 1 < args.length) {
      outputHtml = args[++i];
    }
  }

  const entries = collectMetricsFromDir(metricsDir);
  if (entries.length === 0) {
    console.warn(
      `No JSON metrics found in ${metricsDir}. Add metrics files (e.g. from collect-*-metrics.js).`,
    );
    const sample = {
      project: 'small',
      scenario: 'workspace-load',
      timestamp: new Date().toISOString(),
      metrics: { totalTimeMs: 0, filesProcessed: 0 },
    };
    fs.mkdirSync(metricsDir, { recursive: true });
    fs.writeFileSync(
      path.join(metricsDir, 'sample-metrics.json'),
      JSON.stringify(sample, null, 2),
    );
    console.log(`Created sample: ${metricsDir}/sample-metrics.json`);
  }

  const comparison = buildComparison(entries);
  fs.writeFileSync(outputJson, JSON.stringify(comparison, null, 2), 'utf8');
  console.log(`Wrote JSON: ${outputJson}`);

  if (outputHtml) {
    generateHtmlReport(comparison, outputHtml);
  } else {
    const htmlPath = outputJson.replace(/\.json$/i, '.html');
    generateHtmlReport(comparison, htmlPath);
  }
}

main();
