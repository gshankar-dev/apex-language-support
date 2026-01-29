/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the
 * repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/*
 * Run all automated performance scenarios for one or all projects:
 * 1. Workspace load (references)
 * 2. High-priority request (hover) — N hovers, record latencies
 *
 * With APEX_LS_CPU_PROFILE=1 the server is started with --cpu-prof so Node
 * writes a .cpuprofile when the server exits (in the server cwd, usually the project dir).
 *
 * Usage (from repo root, after npm run compile && npm run bundle):
 *   node packages/apex-lsp-testbed/out/scripts/run-all-scenarios.js [--project small|medium|large]
 *   APEX_LS_CPU_PROFILE=1 node packages/apex-lsp-testbed/out/scripts/run-all-scenarios.js
 *   node packages/apex-lsp-testbed/out/scripts/run-all-scenarios.js --hover-count 30
 *
 * Writes: performance-metrics/workspace-load-<project>.json, high-priority-request-<project>.json
 */

import * as fs from 'fs';
import * as path from 'path';
import { createTestServer } from '../test-utils/serverFactory';
import type { ServerType } from '../utils/serverUtils';

const REPO_ROOT = findRepoRoot(__dirname);
const FIXTURES_ROOT = path.join(
  REPO_ROOT,
  'packages',
  'apex-lsp-testbed',
  'test',
  'fixtures',
  'performance-tests',
);

const PROJECT_PATHS: Record<string, string> = {
  small: path.join(FIXTURES_ROOT, 'small', 'trigger-actions'),
  medium: path.join(FIXTURES_ROOT, 'medium', 'apex-recipes'),
  large: path.join(FIXTURES_ROOT, 'large', 'eda'),
};

const DEFAULT_HOVER_COUNT = 30;

function findRepoRoot(fromDir: string): string {
  let current = path.resolve(fromDir);
  for (let i = 0; i < 20; i++) {
    const pkg = path.join(current, 'package.json');
    if (fs.existsSync(pkg)) {
      try {
        const json = JSON.parse(fs.readFileSync(pkg, 'utf8'));
        if (json.name === '@salesforce/apex-language-server') {
          return current;
        }
      } catch {
        // ignore
      }
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return process.cwd();
}

function pathToUri(filePath: string): string {
  const abs = path.resolve(filePath);
  if (process.platform === 'win32') {
    return 'file:///' + abs.replace(/\\/g, '/');
  }
  return 'file://' + abs;
}

function findFirstApexFileAndPosition(
  workspacePath: string,
): { uri: string; filePath: string; line: number; character: number } | null {
  let firstCls = '';
  function walk(dir: string): boolean {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const e of entries) {
        const full = path.join(dir, e.name);
        if (
          e.name.startsWith('.') ||
          e.name === 'node_modules' ||
          e.name === 'dist' ||
          e.name === 'out'
        )
          continue;
        if (e.isDirectory()) {
          if (walk(full)) return true;
        } else if (e.isFile() && e.name.endsWith('.cls')) {
          firstCls = full;
          return true;
        }
      }
    } catch {
      // ignore
    }
    return false;
  }
  walk(workspacePath);
  if (!firstCls) return null;
  const content = fs.readFileSync(firstCls, 'utf8');
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const idx = lines[i].indexOf('class ');
    if (idx >= 0) {
      return {
        uri: pathToUri(firstCls),
        filePath: firstCls,
        line: i,
        character: idx,
      };
    }
  }
  return {
    uri: pathToUri(firstCls),
    filePath: firstCls,
    line: 0,
    character: 0,
  };
}

function findHoverPositions(
  workspacePath: string,
  limit: number,
): Array<{ uri: string; filePath: string; line: number; character: number }> {
  const list: string[] = [];
  function walk(dir: string): void {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const e of entries) {
        const full = path.join(dir, e.name);
        if (
          e.name.startsWith('.') ||
          e.name === 'node_modules' ||
          e.name === 'dist' ||
          e.name === 'out'
        )
          continue;
        if (e.isDirectory()) walk(full);
        else if (e.isFile() && e.name.endsWith('.cls')) list.push(full);
      }
    } catch {
      // ignore
    }
  }
  walk(workspacePath);
  const positions: Array<{
    uri: string;
    filePath: string;
    line: number;
    character: number;
  }> = [];
  for (const filePath of list.slice(0, limit * 2)) {
    if (positions.length >= limit) break;
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length && positions.length < limit; i++) {
        const idx = lines[i].indexOf('class ');
        if (idx >= 0) {
          positions.push({
            uri: pathToUri(filePath),
            filePath,
            line: i,
            character: idx,
          });
          break;
        }
      }
    } catch {
      // skip
    }
  }
  return positions;
}

function countApexFiles(workspacePath: string): number {
  let count = 0;
  function walk(dir: string): void {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const e of entries) {
        const full = path.join(dir, e.name);
        if (
          e.name.startsWith('.') ||
          e.name === 'node_modules' ||
          e.name === 'dist' ||
          e.name === 'out'
        )
          continue;
        if (e.isDirectory()) walk(full);
        else if (e.isFile() && e.name.endsWith('.cls')) count++;
      }
    } catch {
      // ignore
    }
  }
  walk(workspacePath);
  return count;
}

async function runProject(
  projectLabel: string,
  resolvedPath: string,
  metricsDir: string,
  hoverCount: number,
): Promise<void> {
  const target = findFirstApexFileAndPosition(resolvedPath);
  if (!target) {
    console.error(`[${projectLabel}] No Apex .cls file found`);
    return;
  }

  const serverType: ServerType = 'nodeServer';
  let context;
  try {
    context = await createTestServer({
      serverType,
      workspacePath: resolvedPath,
      verbose: false,
      initOptions: {
        initializationOptions: {
          apex: { environment: { serverMode: 'development' } },
        },
      },
    });
  } catch (err) {
    console.error(`[${projectLabel}] Failed to start server:`, err);
    return;
  }

  const { client, cleanup } = context;

  let documentContent: string;
  try {
    documentContent = fs.readFileSync(target.filePath, 'utf8');
  } catch {
    documentContent = '';
  }
  client.sendNotification('textDocument/didOpen', {
    textDocument: {
      uri: target.uri,
      languageId: 'apex',
      version: 1,
      text: documentContent,
    },
  });
  await new Promise((r) => setTimeout(r, 500));

  // --- Queue state sampling (development mode): poll apex/queueState during references ---
  const queueSamples: Array<{
    queueSizes: Record<string, number>;
    started?: number;
    completed?: number;
  }> = [];
  const QUEUE_POLL_MS = 200;
  const MAX_QUEUE_SAMPLES = 200; // ~40s max
  const QUEUE_STATE_TIMEOUT_MS = 2000; // avoid blocking when server is busy (e.g. large project)
  let queuePollInterval: ReturnType<typeof setInterval> | null = null;
  const pollQueueState = (): void => {
    if (queueSamples.length >= MAX_QUEUE_SAMPLES) return;
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error('apex/queueState timeout')),
        QUEUE_STATE_TIMEOUT_MS,
      ),
    );
    Promise.race([client.sendRequest('apex/queueState', {}), timeout])
      .then(
        (res: {
          metrics?: {
            queueSizes?: Record<string, number>;
            tasksStarted?: number;
            tasksCompleted?: number;
          };
        }) => {
          if (res?.metrics) {
            queueSamples.push({
              queueSizes: res.metrics.queueSizes || {},
              started: res.metrics.tasksStarted,
              completed: res.metrics.tasksCompleted,
            });
          }
        },
      )
      .catch(() => {});
  };

  // --- Workspace load (references) ---
  const refStart = Date.now();
  queuePollInterval = setInterval(pollQueueState, QUEUE_POLL_MS);
  pollQueueState(); // first sample immediately
  let refSuccess = false;
  try {
    await client.sendRequest('textDocument/references', {
      textDocument: { uri: target.uri },
      position: { line: target.line, character: target.character },
      context: { includeDeclaration: true },
    });
    refSuccess = true;
  } catch (err) {
    console.error(`[${projectLabel}] References error:`, err);
  } finally {
    if (queuePollInterval) {
      clearInterval(queuePollInterval);
      queuePollInterval = null;
    }
    pollQueueState(); // one final sample after references complete
  }
  const totalTimeMs = Date.now() - refStart;

  // Always write queue-samples so the shell script can parse and create queue-priority-<project>.json
  // (report shows all 3 projects)
  const queueSamplesPath = path.join(
    metricsDir,
    `queue-samples-${projectLabel}.json`,
  );
  fs.writeFileSync(
    queueSamplesPath,
    JSON.stringify({ samples: queueSamples }, null, 0),
    'utf8',
  );
  if (queueSamples.length > 0) {
    console.log(
      `[${projectLabel}] Queue state: ${queueSamples.length} samples → ${queueSamplesPath}`,
    );
  } else {
    console.log(
      `[${projectLabel}] Queue state: 0 samples → ${queueSamplesPath} ` +
        '(apex/queueState may time out when server is busy)',
    );
  }
  const filesProcessed = countApexFiles(resolvedPath);
  const filesPerSecond =
    totalTimeMs > 0 ? (filesProcessed / totalTimeMs) * 1000 : null;

  const workspaceLoadPath = path.join(
    metricsDir,
    `workspace-load-${projectLabel}.json`,
  );
  fs.writeFileSync(
    workspaceLoadPath,
    JSON.stringify(
      {
        scenario: 'workspace-load',
        project: projectLabel,
        collectedAt: new Date().toISOString(),
        source: 'automated',
        metrics: {
          totalTimeMs,
          filesProcessed,
          filesPerSecond:
            filesPerSecond != null
              ? Math.round(filesPerSecond * 100) / 100
              : null,
          queueDepthMax: null,
          success: refSuccess,
        },
      },
      null,
      2,
    ),
    'utf8',
  );
  console.log(
    `[${projectLabel}] Workspace load: ${totalTimeMs}ms, ${filesProcessed} files → ${workspaceLoadPath}`,
  );

  // --- Hovers (high-priority request) ---
  const hoverPositions = findHoverPositions(resolvedPath, hoverCount);
  const latencies: number[] = [];
  let successCount = 0;
  for (const pos of hoverPositions) {
    const start = Date.now();
    try {
      await client.sendRequest('textDocument/hover', {
        textDocument: { uri: pos.uri },
        position: { line: pos.line, character: pos.character },
      });
      latencies.push(Date.now() - start);
      successCount++;
    } catch {
      latencies.push(Date.now() - start);
    }
  }

  await cleanup();

  const avgLatencyMs =
    latencies.length > 0
      ? latencies.reduce((a, b) => a + b, 0) / latencies.length
      : null;
  const sorted = [...latencies].sort((a, b) => a - b);
  const p95 =
    sorted.length > 0
      ? sorted[Math.min(Math.floor(sorted.length * 0.95), sorted.length - 1)]
      : null;

  const highPriorityPath = path.join(
    metricsDir,
    `high-priority-request-${projectLabel}.json`,
  );
  fs.writeFileSync(
    highPriorityPath,
    JSON.stringify(
      {
        scenario: 'high-priority-request',
        project: projectLabel,
        collectedAt: new Date().toISOString(),
        source: 'automated',
        metrics: {
          requestCount: latencies.length,
          successCount,
          avgLatencyMs: avgLatencyMs != null ? Math.round(avgLatencyMs) : null,
          minLatencyMs: latencies.length > 0 ? Math.min(...latencies) : null,
          maxLatencyMs: latencies.length > 0 ? Math.max(...latencies) : null,
          p95LatencyMs: p95 != null ? Math.round(p95) : null,
        },
      },
      null,
      2,
    ),
    'utf8',
  );
  console.log(
    `[${projectLabel}] Hovers: ${latencies.length} requests, ` +
      `avg ${avgLatencyMs != null ? Math.round(avgLatencyMs) : '-'}ms → ${highPriorityPath}`,
  );
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  let project = '';
  let hoverCount = DEFAULT_HOVER_COUNT;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--project' && i + 1 < args.length) {
      project = args[++i];
    } else if (args[i] === '--hover-count' && i + 1 < args.length) {
      hoverCount = parseInt(args[++i], 10) || DEFAULT_HOVER_COUNT;
    }
  }

  const metricsDir = path.join(REPO_ROOT, 'performance-metrics');
  fs.mkdirSync(metricsDir, { recursive: true });

  const projects = project
    ? [project]
    : (Object.keys(PROJECT_PATHS) as Array<keyof typeof PROJECT_PATHS>);

  if (process.env.APEX_LS_CPU_PROFILE) {
    console.log(
      'APEX_LS_CPU_PROFILE is set: server will run with --cpu-prof ' +
        '(profile written on exit).',
    );
  }

  console.log(
    `Running all scenarios for: ${projects.join(', ')} (hover count: ${hoverCount})`,
  );

  for (const p of projects) {
    const resolvedPath = PROJECT_PATHS[p];
    if (!resolvedPath || !fs.existsSync(resolvedPath)) {
      console.error(`Skipping ${p}: path not found`);
      continue;
    }
    await runProject(p, resolvedPath, metricsDir, hoverCount);
  }

  console.log(
    'Done. Regenerate report: node scripts/generate-performance-comparison.js ' +
      '--metrics-dir performance-metrics --output performance-metrics/performance-comparison.json',
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
