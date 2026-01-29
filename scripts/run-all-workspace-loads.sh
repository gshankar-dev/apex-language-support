#!/usr/bin/env bash
#
# Run automated workspace load for all 3 projects (small, medium, large),
# then generate the performance comparison report.
#
# Prerequisites (from repo root):
#   npm run compile && npm run bundle
#
# Usage (from repo root):
#   ./scripts/run-all-workspace-loads.sh
#   ./scripts/run-all-workspace-loads.sh --project small   # run only small
#
# Writes metrics to performance-metrics/ and then runs generate-performance-comparison.js.
#

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TESTBED_SCRIPT="$REPO_ROOT/packages/apex-lsp-testbed/out/scripts/run-workspace-load.js"
METRICS_DIR="$REPO_ROOT/performance-metrics"

cd "$REPO_ROOT"

if [ ! -f "$TESTBED_SCRIPT" ]; then
  echo "Error: run-workspace-load.js not found. Run first: npm run compile"
  echo "  Expected: $TESTBED_SCRIPT"
  exit 1
fi

if [ ! -f "$REPO_ROOT/packages/apex-ls/dist/server.node.js" ] && [ ! -f "$REPO_ROOT/packages/apex-ls/out/node/server.node.js" ]; then
  echo "Error: Apex LS server not built. Run: npm run compile && npm run bundle"
  exit 1
fi

mkdir -p "$METRICS_DIR"

if [ "$1" = "--project" ] && [ -n "$2" ]; then
  PROJECTS="$2"
else
  PROJECTS="small medium large"
fi

echo "=============================================="
echo "Automated workspace load (Find All References)"
echo "=============================================="
for project in $PROJECTS; do
  echo ""
  echo "--- Project: $project ---"
  node "$TESTBED_SCRIPT" --project "$project" || true
done

echo ""
echo "=============================================="
echo "Generating performance comparison report"
echo "=============================================="
node "$SCRIPT_DIR/generate-performance-comparison.js" \
  --metrics-dir "$METRICS_DIR" \
  --output "$METRICS_DIR/performance-comparison.json"

echo ""
echo "Done. Open: $METRICS_DIR/performance-comparison.html"
