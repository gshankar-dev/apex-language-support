/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the
 * repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/*
 * Automated workspace load: starts the Apex LSP server (nodeServer) with a given
 * project, sends textDocument/references (simulating "Find All References"),
 * measures time to response, and writes metrics JSON.
 *
 * Run from repo root after npm run compile && npm run bundle:
 *   node packages/apex-lsp-testbed/out/scripts/run-workspace-load.js --project small
 *   node packages/apex-lsp-testbed/out/scripts/run-workspace-load.js --project medium
 *   node packages/apex-lsp-testbed/out/scripts/run-workspace-load.js --project large
 * Or with path:
 *   node packages/apex-lsp-testbed/out/scripts/run-workspace-load.js --workspace-path /path/to/project
 *
 * Writes: <repo-root>/performance-metrics/workspace-load-<project>.json
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

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  let project = '';
  let workspacePath = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--project' && i + 1 < args.length) {
      project = args[++i];
    } else if (args[i] === '--workspace-path' && i + 1 < args.length) {
      workspacePath = args[++i];
    }
  }

  if (!project && !workspacePath) {
    console.error(
      'Usage: node run-workspace-load.js --project small|medium|large',
    );
    console.error(
      '   or: node run-workspace-load.js --workspace-path /path/to/project',
    );
    process.exit(1);
  }

  const resolvedPath = workspacePath
    ? path.resolve(workspacePath)
    : PROJECT_PATHS[project];
  const projectLabel = project || path.basename(resolvedPath);

  if (!resolvedPath || !fs.existsSync(resolvedPath)) {
    console.error(`Workspace path does not exist: ${resolvedPath}`);
    process.exit(1);
  }

  const metricsDir = path.join(REPO_ROOT, 'performance-metrics');
  fs.mkdirSync(metricsDir, { recursive: true });

  const target = findFirstApexFileAndPosition(resolvedPath);
  if (!target) {
    console.error('No Apex .cls file found in workspace');
    process.exit(1);
  }

  console.log(`Workspace: ${resolvedPath}`);
  console.log(
    `Trigger position: ${target.uri} L${target.line + 1}:${target.character + 1}`,
  );
  console.log('Starting server and sending references request...');

  const serverType: ServerType = 'nodeServer';
  let context;
  try {
    context = await createTestServer({
      serverType,
      workspacePath: resolvedPath,
      verbose: false,
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
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

  const start = Date.now();
  let totalTimeMs = 0;
  let success = false;

  try {
    await client.sendRequest('textDocument/references', {
      textDocument: { uri: target.uri },
      position: { line: target.line, character: target.character },
      context: { includeDeclaration: true },
    });
    totalTimeMs = Date.now() - start;
    success = true;
  } catch (err) {
    totalTimeMs = Date.now() - start;
    console.error('References request error:', err);
  } finally {
    await cleanup();
  }

  const filesProcessed = countApexFiles(resolvedPath);
  const filesPerSecond =
    totalTimeMs > 0 ? (filesProcessed / totalTimeMs) * 1000 : null;

  const metrics = {
    scenario: 'workspace-load',
    project: projectLabel,
    collectedAt: new Date().toISOString(),
    source: 'automated',
    metrics: {
      totalTimeMs,
      filesProcessed,
      filesPerSecond:
        filesPerSecond != null ? Math.round(filesPerSecond * 100) / 100 : null,
      queueDepthMax: null,
      success,
    },
  };

  const outPath = path.join(metricsDir, `workspace-load-${projectLabel}.json`);
  fs.writeFileSync(outPath, JSON.stringify(metrics, null, 2), 'utf8');
  console.log(`Wrote: ${outPath}`);
  console.log(
    `Total time: ${totalTimeMs}ms | Files: ${filesProcessed} | Success: ${success}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
