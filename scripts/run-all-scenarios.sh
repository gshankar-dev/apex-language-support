#!/usr/bin/env bash
#
# Run all automated performance scenarios (workspace load + hovers) for
# small, medium, and large projects. Optionally enable CPU profiling on the
# server so Node writes a .cpuprofile when each server exits.
#
# Prerequisites (from repo root): npm run compile && npm run bundle
#
# Usage (from repo root):
#   ./scripts/run-all-scenarios.sh                    # run all 3 projects, no profiling
#   ./scripts/run-all-scenarios.sh --with-profiling   # run with CPU profiling on server
#   ./scripts/run-all-scenarios.sh --project small    # run only small
#   ./scripts/run-all-scenarios.sh --with-profiling --project large
#
# With --with-profiling: server runs with Node --cpu-prof; one .cpuprofile per project
# is written when each server exits. This script then copies them to performance-metrics/
# and runs collect-all-from-profiles.js to fill all scenario metrics from each profile.
#
# Writes: performance-metrics/workspace-load-{small,medium,large}.json,
#         performance-metrics/high-priority-request-{small,medium,large}.json,
#         and (when --with-profiling) all other scenario JSONs from each .cpuprofile.
# Then runs generate-performance-comparison.js.
#

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TESTBED_SCRIPT="$REPO_ROOT/packages/apex-lsp-testbed/out/scripts/run-all-scenarios.js"
METRICS_DIR="$REPO_ROOT/performance-metrics"

cd "$REPO_ROOT"

if [ ! -f "$TESTBED_SCRIPT" ]; then
  echo "Error: run-all-scenarios.js not found. Run first: npm run compile"
  echo "  Expected: $TESTBED_SCRIPT"
  exit 1
fi

if [ ! -f "$REPO_ROOT/packages/apex-ls/dist/server.node.js" ] && [ ! -f "$REPO_ROOT/packages/apex-ls/out/node/server.node.js" ]; then
  echo "Error: Apex LS server not built. Run: npm run compile && npm run bundle"
  exit 1
fi

mkdir -p "$METRICS_DIR"

WITH_PROFILING=""
EXTRA_ARGS=""
while [ $# -gt 0 ]; do
  case "$1" in
    --with-profiling)
      WITH_PROFILING=1
      shift
      ;;
    *)
      EXTRA_ARGS="$EXTRA_ARGS $1"
      shift
      ;;
  esac
done

if [ -n "$WITH_PROFILING" ]; then
  echo "Running with CPU profiling (APEX_LS_CPU_PROFILE=1). Server will write .cpuprofile on exit."
  export APEX_LS_CPU_PROFILE=1
fi

echo "=============================================="
echo "Running all scenarios (workspace load + hovers)"
echo "=============================================="
node "$TESTBED_SCRIPT" $EXTRA_ARGS

echo ""
echo "=============================================="
echo "Parsing queue state samples (queue-priority metrics)"
echo "=============================================="
for size in small medium large; do
  if [ -f "$METRICS_DIR/queue-samples-$size.json" ]; then
    node "$SCRIPT_DIR/collect-queue-priority-metrics.js" \
      --parse-queue-samples "$METRICS_DIR/queue-samples-$size.json" \
      --project "$size" \
      --output "$METRICS_DIR/queue-priority-$size.json"
    echo "  Parsed queue-samples-$size.json → queue-priority-$size.json"
  fi
done

if [ -n "$WITH_PROFILING" ]; then
  echo ""
  echo "=============================================="
  echo "Copying .cpuprofile files and extracting metrics"
  echo "=============================================="
  FIXTURES="$REPO_ROOT/packages/apex-lsp-testbed/test/fixtures/performance-tests"
  for size in small medium large; do
    case "$size" in
      small)  PROJ_DIR="$FIXTURES/small/trigger-actions" ;;
      medium) PROJ_DIR="$FIXTURES/medium/apex-recipes"   ;;
      large)  PROJ_DIR="$FIXTURES/large/eda"            ;;
    esac
    if [ -d "$PROJ_DIR" ]; then
      LATEST=$(ls -t "$PROJ_DIR"/*.cpuprofile 2>/dev/null | head -1)
      if [ -n "$LATEST" ]; then
        cp "$LATEST" "$METRICS_DIR/workspace-load-$size.cpuprofile"
        echo "  Copied $size → workspace-load-$size.cpuprofile"
      fi
    fi
  done
  node "$SCRIPT_DIR/collect-all-from-profiles.js" --metrics-dir "$METRICS_DIR"
fi

echo ""
echo "=============================================="
echo "Generating performance comparison report"
echo "=============================================="
node "$SCRIPT_DIR/generate-performance-comparison.js" \
  --metrics-dir "$METRICS_DIR" \
  --output "$METRICS_DIR/performance-comparison.json"

echo ""
echo "Done. Open: $METRICS_DIR/performance-comparison.html"
