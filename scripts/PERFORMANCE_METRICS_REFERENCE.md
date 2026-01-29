# Performance Metrics Reference: 7 Bottleneck Areas

For each bottleneck, this document lists the **metrics to collect**, the **collect script**, and how they appear in the comparison report.

---

## 🔴 1. Workspace Loading Performance

**Problem:** Transitioning from lazy to full awareness freezes the client.

| Metric           | Description                                                                                                                                               | Target (MVP) |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| `totalTimeMs`    | When from **--parse-profile**: full **profile duration** (start→stop). Only comparable if you start profiling right before and stop right after the load. | < 60 s       |
| `filesProcessed` | Number of Apex files processed                                                                                                                            | —            |
| `filesPerSecond` | Throughput (filesProcessed / totalTimeMs × 1000)                                                                                                          | —            |
| `queueDepthMax`  | Max total queue depth during load (from logs)                                                                                                             | —            |
| `success`        | Whether the request completed successfully                                                                                                                | true         |

**Collect:** Automated — `./scripts/run-all-workspace-loads.sh`  
**Or manual:** `node scripts/collect-workspace-load-metrics.js [--project small]` then `--parse-profile` / `--parse-log`  
**Output files:** `performance-metrics/workspace-load-{small,medium,large}.json`

**Why small can show higher totalTimeMs than medium/large:** When using `--parse-profile`, `totalTimeMs` is the **entire profile duration** (how long the profile was recording), not “workspace load only.” So: (1) If you left the profile running longer for small (started earlier or stopped later), small will show a higher number. (2) If small was run first (cold start), the real load can be slower; medium/large run after the process is warm. For comparable numbers, start profiling immediately before triggering Find All References and stop as soon as the load completes.

---

## 🔴 2. Client Responsiveness

**Problem:** UI locks during heavy processing (back pressure).

| Metric                | Description                                       | Target (MVP) |
| --------------------- | ------------------------------------------------- | ------------ |
| `uiFreezeCount`       | Number of noticeable UI freezes during load       | 0            |
| `maxFreezeDurationMs` | Longest freeze duration (ms)                      | < 100        |
| `eventLoopLagMaxMs`   | Max event loop lag observed                       | < 10         |
| `backPressureEvents`  | Count of back-pressure / buffer-full events       | —            |
| `totalProfileTimeMs`  | Total CPU profile duration (from --parse-profile) | —            |

**Collect:** `node scripts/collect-client-responsiveness-metrics.js [--project small]` then `--parse-profile <file.cpuprofile>` or fill manually.  
**Output files:** `performance-metrics/client-responsiveness-{project}.json`

---

## 🟠 3. High-Priority Request Processing

**Problem:** Hover and Go-to-Definition are not preempting lower-priority tasks efficiently.

| Metric         | Description                        | Target (MVP)                      |
| -------------- | ---------------------------------- | --------------------------------- |
| `requestCount` | Number of hover/go-to-def requests | —                                 |
| `successCount` | Number of successful responses     | —                                 |
| `avgLatencyMs` | Average response latency (ms)      | < 100 baseline, < 500 during load |
| `minLatencyMs` | Minimum latency                    | —                                 |
| `maxLatencyMs` | Maximum latency                    | —                                 |
| `p95LatencyMs` | 95th percentile latency            | < 200                             |

**Collect:** In project dir run `node run-hover-test.js` (or `hover-test.js` with LSP), then  
`node scripts/collect-high-priority-request-metrics.js --parse-results path/to/hover-test-results.json [--project small]`  
**Output files:** `performance-metrics/high-priority-request-{project}.json`

---

## 🟠 4. Event Loop Blocking

**Problem:** Compute-bound tasks block the single thread for >100ms.

| Metric               | Description                       | Target (MVP) |
| -------------------- | --------------------------------- | ------------ |
| `longTaskCount`      | Number of tasks/samples >100ms    | —            |
| `maxBlockingMs`      | Longest single blocking span (ms) | < 100        |
| `eventLoopLagMaxMs`  | Max event loop lag                | < 10         |
| `totalProfileTimeMs` | From --parse-profile              | —            |

**Collect:** `node scripts/collect-event-loop-blocking-metrics.js [--project small]` then `--parse-profile <file.cpuprofile>` or fill manually.  
**Output files:** `performance-metrics/event-loop-blocking-{project}.json`

---

## 🟡 5. Queue Priority Management

**Problem:** The 6-queue priority system is suffering from starvation.

| Metric                    | Description                                  | Target (MVP) |
| ------------------------- | -------------------------------------------- | ------------ |
| `queueDepthMaxByPriority` | `{ 1: n, 2: n, ... }` max depth per priority | —            |
| `avgQueueDepth`           | Average total queue depth over samples       | —            |
| `sampleCount`             | Number of [QueueState] samples parsed        | —            |
| `starvationCount`         | Optional: count of “waited too long” events  | —            |

**Collect:** With `serverMode: "development"`, copy Output panel log during/after workspace load, then  
`node scripts/collect-queue-priority-metrics.js --parse-log <log.txt> [--project small]`  
**Output files:** `performance-metrics/queue-priority-{project}.json`

---

## 🟡 6. Document Open Processing

**Problem:** Bursts of file opens (500+) clog the pipeline.

| Metric               | Description                              | Target (MVP) |
| -------------------- | ---------------------------------------- | ------------ |
| `documentOpenCount`  | Number of didOpen events in the run      | —            |
| `totalTimeMs`        | Time to process the burst                | —            |
| `documentsPerSecond` | documentOpenCount / (totalTimeMs/1000)   | —            |
| `maxQueueDepth`      | Max queue depth during burst (from logs) | —            |

**Collect:** `node scripts/collect-document-open-metrics.js [--project small]` then `--parse-profile` / `--parse-log` or fill manually.  
**Output files:** `performance-metrics/document-open-{project}.json`

---

## 🟢 7. Deferred Reference Processing

**Problem:** Retry mechanisms cause an “explosion” of background work.

| Metric                 | Description                                      | Target (MVP) |
| ---------------------- | ------------------------------------------------ | ------------ |
| `retryCount`           | Number of retries (from logs or instrumentation) | —            |
| `deferredTaskCount`    | Number of deferred tasks executed                | —            |
| `timeSpentMs`          | Time spent on deferred/retry work                | —            |
| `totalTimeMs`          | From --parse-profile                             | —            |
| `deferredRelatedNodes` | From --parse-profile (node count)                | —            |

**Collect:** `node scripts/collect-deferred-reference-metrics.js [--project small]` then `--parse-profile` / `--parse-log` or fill manually.  
**Output files:** `performance-metrics/deferred-reference-{project}.json`

---

## Report and scripts

- **One-command workflow (all scenarios + one .cpuprofile per project):**  
  `./scripts/run-all-scenarios.sh --with-profiling` — see **scripts/PERFORMANCE_METRICS_WORKFLOW.md**.

- **Comparison report (after collecting metrics):**  
  `node scripts/generate-performance-comparison.js --metrics-dir performance-metrics --output performance-metrics/performance-comparison.json`  
  Then open `performance-metrics/performance-comparison.html`.

- **Automated workspace load only (no hovers):**  
  `./scripts/run-all-workspace-loads.sh`
