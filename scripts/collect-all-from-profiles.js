#!/usr/bin/env node
/*
 * Extract metrics for all CPU-profile–based scenarios from one or more
 * .cpuprofile files. One profile per project; each profile is used to fill
 * workspace-load, client-responsiveness, event-loop-blocking, document-open,
 * and deferred-reference metrics for that project.
 *
 * Usage (from repo root):
 *   node scripts/collect-all-from-profiles.js [--metrics-dir performance-metrics]
 *
 * Expects .cpuprofile files in metrics-dir named: workspace-load-<project>.cpuprofile
 * where project is small | medium | large. For each file found, runs the
 * corresponding collect-*-metrics.js --parse-profile and writes the scenario JSONs.
 *
 * Optional: single profile
 *   node scripts/collect-all-from-profiles.js --profile path/to/foo.cpuprofile --project small
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO_ROOT = process.cwd();
const SCRIPTS_DIR = path.join(REPO_ROOT, 'scripts');
const DEFAULT_METRICS_DIR = path.join(REPO_ROOT, 'performance-metrics');

const PROJECTS = ['small', 'medium', 'large'];

const SCENARIOS_FROM_PROFILE = [
  'collect-workspace-load-metrics.js',
  'collect-client-responsiveness-metrics.js',
  'collect-event-loop-blocking-metrics.js',
  'collect-document-open-metrics.js',
  'collect-deferred-reference-metrics.js',
];

function main() {
  const args = process.argv.slice(2);
  let metricsDir = DEFAULT_METRICS_DIR;
  let singleProfile = null;
  let singleProject = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--metrics-dir' && i + 1 < args.length) {
      metricsDir = path.resolve(args[++i]);
    } else if (args[i] === '--profile' && i + 1 < args.length) {
      singleProfile = path.resolve(args[++i]);
    } else if (args[i] === '--project' && i + 1 < args.length) {
      singleProject = args[++i];
    }
  }

  const profiles = [];
  if (singleProfile && singleProject) {
    if (!fs.existsSync(singleProfile)) {
      console.error(`Profile not found: ${singleProfile}`);
      process.exit(1);
    }
    profiles.push({ path: singleProfile, project: singleProject });
  } else {
    for (const project of PROJECTS) {
      const name = `workspace-load-${project}.cpuprofile`;
      const full = path.join(metricsDir, name);
      if (fs.existsSync(full)) {
        profiles.push({ path: full, project });
      }
    }
  }

  if (profiles.length === 0) {
    console.log(
      'No .cpuprofile files found. Either:\n' +
        '  - Run ./scripts/run-all-scenarios.sh --with-profiling and let it copy profiles into performance-metrics/, or\n' +
        '  - Copy workspace-load-<small|medium|large>.cpuprofile into performance-metrics/, or\n' +
        '  - Use --profile <path> --project <small|medium|large>',
    );
    process.exit(0);
  }

  for (const { path: profilePath, project } of profiles) {
    console.log(
      `Extracting metrics from ${path.basename(profilePath)} (${project})…`,
    );
    for (const script of SCENARIOS_FROM_PROFILE) {
      const scriptPath = path.join(SCRIPTS_DIR, script);
      if (!fs.existsSync(scriptPath)) continue;
      const scenario = script
        .replace('collect-', '')
        .replace('-metrics.js', '');
      const outputPath = path.join(metricsDir, `${scenario}-${project}.json`);
      try {
        execSync(
          `node "${scriptPath}" --parse-profile "${profilePath}" --project ${project} --output "${outputPath}"`,
          { stdio: 'inherit', cwd: REPO_ROOT },
        );
      } catch (e) {
        // script may exit 1 if parsing fails; continue with others
      }
    }
  }
  console.log(
    'Done. Run: node scripts/generate-performance-comparison.js --metrics-dir ' +
      metricsDir,
  );
}

main();
