# Performance Metrics Workflow

**One command** runs Node scripts that drive the Apex LSP server (workspace load + hovers), collect **one `.cpuprofile` per project**, and extract metrics from each profile into the comparison report. No IDE, no manual steps.

---

## One command (recommended)

**Prerequisites (from repo root):** `npm run compile && npm run bundle`

```bash
./scripts/run-all-scenarios.sh --with-profiling
```

This:

1. For each project (small, medium, large): starts the Apex LSP server with Node `--cpu-prof`, sends **references** (workspace load), then **N hovers** (default 30), records metrics, stops the server → Node writes **one `.cpuprofile`** in that project dir.
2. Copies each `.cpuprofile` into `performance-metrics/` as `workspace-load-<small|medium|large>.cpuprofile`.
3. Writes **`queue-samples-<project>.json`** (server in development mode; polls `apex/queueState` during references). The shell script then runs **`collect-queue-priority-metrics.js --parse-queue-samples`** to fill **queue-priority** metrics.
4. Runs **`collect-all-from-profiles.js`** (when `--with-profiling`): from each profile, fills metrics for workspace-load, client-responsiveness, event-loop-blocking, document-open, deferred-reference (and keeps high-priority-request from the run).
5. Runs **`generate-performance-comparison.js`** and writes `performance-metrics/performance-comparison.html`.

**Result:** One `.cpuprofile` per project, all metrics derived from those profiles, one report. Open `performance-metrics/performance-comparison.html`.

**Without profiling** (timing only, no CPU breakdowns):

```bash
./scripts/run-all-scenarios.sh
```

**Single project:**

```bash
./scripts/run-all-scenarios.sh --with-profiling --project large
```

---

## One profile you already have

If you have **one** `.cpuprofile` (e.g. from the IDE) and want to fill all scenario metrics from it:

```bash
node scripts/collect-all-from-profiles.js --profile /path/to/profile.cpuprofile --project small
```

Then regenerate the report:

```bash
node scripts/generate-performance-comparison.js --metrics-dir performance-metrics --output performance-metrics/performance-comparison.json
```

---

## Project paths (test fixtures)

| Size   | Path                                                                              |
| ------ | --------------------------------------------------------------------------------- |
| Small  | `packages/apex-lsp-testbed/test/fixtures/performance-tests/small/trigger-actions` |
| Medium | `packages/apex-lsp-testbed/test/fixtures/performance-tests/medium/apex-recipes`   |
| Large  | `packages/apex-lsp-testbed/test/fixtures/performance-tests/large/eda`             |

---

## Metrics and scenarios

**7 bottleneck areas:** workspace load, client responsiveness, high-priority request, event-loop blocking, queue priority, document open, deferred reference.  
See **`scripts/PERFORMANCE_METRICS_REFERENCE.md`** for metrics, targets, and which are filled from the CPU profile vs from the run (e.g. high-priority hover latencies come from the run; queue-priority needs server logs).

**Client responsiveness** and **deferred reference** metrics in the report come from the **same `.cpuprofile`** as workspace-load:

- **Client responsiveness:** `collect-client-responsiveness-metrics.js --parse-profile` reads the profile and extracts: **profile duration** (`totalProfileTimeMs`) and **number of call-frame nodes** whose function name contains "send", "response", "notification", or "connection" (`blockingRelatedNodes`). The report charts those. Metrics like **UI freeze count** and **event loop lag** are left null unless you add instrumentation or a different data source.
- **Deferred reference:** `collect-deferred-reference-metrics.js --parse-profile` reads the profile and extracts: **profile duration** (`totalTimeMs`) and **number of nodes** whose function name contains "deferred", "retry", "reference", or "background" (`deferredRelatedNodes`). The report charts those. **Retry count** and **deferred task count** can be filled from server logs via `--parse-log` (see PERFORMANCE_METRICS_REFERENCE.md).

**Optional CPU analysis** (HTML per profile):

```bash
node scripts/analyze-cpu-profiles.js performance-metrics/workspace-load-small.cpuprofile --output performance-metrics/workspace-load-small-report.html
```
