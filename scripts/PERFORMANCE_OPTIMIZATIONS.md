# Apex Language Server: Performance Optimizations

This document lists **concrete optimizations** suggested by the performance metrics (workspace load, event-loop blocking, high-priority request, deferred reference, queue priority) and by the codebase. Apply these in priority order for maximum impact.

---

## Summary of metrics (from your runs)

| Scenario                  | Small                        | Medium                       | Large                         | Issue                                                                                       |
| ------------------------- | ---------------------------- | ---------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------- |
| **Workspace load**        | ~19 s (profile)              | ~25 s                        | ~24 s                         | Profile duration 19–25 s; needs reduction and less blocking.                                |
| **Event-loop blocking**   | 2 long tasks, **max 17.2 s** | 4 long tasks, **max 22.2 s** | 11 long tasks, **max 15.7 s** | Single-thread blocking 15–22 s → UI freezes.                                                |
| **High-priority (hover)** | 0 or 30 success, 1–30 ms     | same                         | same                          | When positions invalid: empty; when valid: 30 success, ~27 ms (all projects in latest run). |
| **Deferred reference**    | 29 nodes                     | 50 nodes                     | 74 nodes                      | Deferred/retry work scales with project size.                                               |
| **Queue priority**        | Often **0–1 samples**        | same                         | **0–1 samples** (starved)     | Under load, `apex/queueState` times out or is starved; large most affected. See §4.         |

**Main takeaway:** Long synchronous work (15–22 s) is the primary cause of UI freezes. Under load, queue-state polling often gets 0–1 samples across all projects (especially large), so queue metrics are sparse when they would be most useful. Breaking up that work and making `apex/queueState` non-blocking will improve responsiveness and observability.

**Recent findings (data sources):** Event-loop and deferred metrics come from **CPU profiles** (e.g. `workspace-load-*.cpuprofile`). Workspace load duration and hover latencies also come from **automated** testbed runs. Queue metrics come from **queue-samples-\*.json** (testbed polls `apex/queueState` every 200 ms with a 2 s timeout). Numbers can differ between runs; use the same run (e.g. `--with-profiling` full suite) when comparing.

---

## 1. Reduce event-loop blocking (highest impact)

**Observed:** `maxBlockingMs` 15.7–22.2 s, `longTaskCount` 4–11.

**How we know there’s blocking:** The numbers come from **`collect-event-loop-blocking-metrics.js --parse-profile <file.cpuprofile>`**. That script reads the V8 CPU profile, sums self-time per profile node, and reports how many nodes had self-time &gt; 100 ms (`longTaskCount`) and the maximum self-time (`maxBlockingMs`). So the metrics tell us _that_ the main thread is blocked for 15–22 s in long chunks, but **not which functions** caused it.

**How we identified the code above:** Root causes were identified by (1) **inspecting the same CPU profile** to see which functions had the highest self-time: run **`node scripts/analyze-cpu-profiles.js performance-metrics/workspace-load-large.cpuprofile`** and open the generated HTML report — the “Top 30 Functions by Self Time” table and the “Time by Bottleneck Category” breakdown show where CPU time went (e.g. decompression, batch handling, symbol table work). (2) **Code review** of the workspace-load path: `apex/sendWorkspaceBatch` → `WorkspaceBatchHandler` → `unzipSync(compressedData)` and then symbol indexing; that path explains why decompression and `addSymbolTable` show up in the profile. So the _data_ (profile + analyzer) shows heavy self-time in long-running sync work; the _attribution_ to `WorkspaceBatchHandler.ts` / `unzipSync` and `ApexSymbolManager.addSymbolTable` comes from the profile’s function list plus tracing the code path.

**Root causes in code:**

- **`WorkspaceBatchHandler.ts`** uses **`unzipSync(compressedData)`** for the whole batch. Decompression is CPU-heavy and fully synchronous; large batches block the event loop for seconds.
- **`ApexSymbolManager.addSymbolTable()`** yields every 100 symbols. For files with many symbols, 100 × `addSymbol()` before the first yield can still be a long stretch. `addSymbol` does graph updates and cache lookups.
- **Cache invalidation** after `addSymbolTable` (two loops over `symbolNamesAdded`, no yield) can be slow on large symbol sets.

**Optimizations:**

1. **Avoid synchronous decompression on the main thread**
   - **Option A:** Use a streaming or chunked decompression API (if available in `fflate` or another lib) and yield between chunks.
   - **Option B:** Move decompression to a **worker thread** (e.g. Node `worker_threads`) and post the decompressed result back; keep only queueing and result handling on the main thread.
   - **File:** `packages/apex-ls/src/server/WorkspaceBatchHandler.ts` (around the `unzipSync` call).

2. **Yield more often in `addSymbolTable`**
   - Reduce batch size from **100 to 25–50** so that `yield* yieldToEventLoop` runs more frequently.
   - Add a yield **before** `registerSymbolTable` if the table is large (e.g. symbol count &gt; 500), so registration doesn’t run in one big chunk.
   - **File:** `packages/apex-parser-ast/src/symbols/ApexSymbolManager.ts` (`addSymbolTable`, ~1719–1735).

3. **Yield in cache invalidation**
   - The loops over `symbolNamesAdded` (e.g. invalidate pattern per symbol) can be batched (e.g. 50 names) with `yield* yieldToEventLoop` between batches.
   - **File:** `packages/apex-parser-ast/src/symbols/ApexSymbolManager.ts` (~1747–1772).

4. **Cap or yield inside `processSameFileReferencesToGraphEffect`**
   - `initialReferenceBatchSize` controls how many references are processed before `yieldNow()`. If it’s large, reduce it (e.g. to 20–30) so reference processing doesn’t form one long task.
   - **File:** `packages/apex-parser-ast/src/symbols/ApexSymbolManager.ts` (`processSameFileReferencesToGraphEffect`, ~1814–1830).

---

## 2. Workspace load duration (19–25 s)

**Observed:** Total profile duration 19–25 s for the “workspace load + hovers” run.

**Optimizations:**

1. **Same as §1** – Reducing blocking directly shortens the time the main thread is busy and improves perceived load time. See §1 for files/lines (e.g. `WorkspaceBatchHandler.ts` ~290–308, `ApexSymbolManager.ts` ~1719–1735, ~1747–1772, ~1814–1830).
2. **Ensure references don’t wait on full workspace load** – Already the case: `ReferencesProcessingService` queues workspace load (Low priority) and proceeds with `findReferences` (partial results). Keep this; avoid adding any “wait until workspace loaded” before returning references.
   - **Files/lines:** `packages/lsp-compliant-services/src/services/ReferencesProcessingService.ts` — queue at Low: **128–140** (`queueWorkspaceLoadIfNeeded`, `offer(Priority.Low, queuedItem)`); proceed without waiting: **155–169**; `findReferences`: **217**.
3. **Smaller batches from the client** – If the client sends very large `apex/sendWorkspaceBatch` payloads, smaller batches (e.g. 50–100 files per batch) will spread decompression and processing over more scheduler turns and reduce long tasks.
   - **Files/lines:** Client batch size default: `packages/apex-lsp-shared/src/settings/ApexSettingsUtilities.ts` **62** (`batchSize: 100`); type: `packages/apex-lsp-shared/src/server/ApexLanguageServerSettings.ts` **161**. Client creating/sending batches: `packages/apex-lsp-vscode-extension/src/workspace-loader.ts` **172**, **196** (`batchSize`, `createFileBatches(validFiles, batchSize)`); send: **311–314** (`apex/sendWorkspaceBatch`). Server receive + decompress: `packages/apex-ls/src/server/WorkspaceBatchHandler.ts` **290–308** (decode + `unzipSync`); process: **379–383** (`processDocumentOpenBatch`). Handler registration: `packages/apex-ls/src/server/LCSAdapter.ts` **544–571** (`apex/sendWorkspaceBatch`).
4. **Lazy or on-demand cross-file resolution** – The code already defers cross-file references to avoid queue pressure. Keep and extend: avoid doing heavy cross-file work during initial load when possible.
   - **Files/lines:** Skip cross-file during workspace load: `packages/lsp-compliant-services/src/services/DiagnosticProcessingService.ts` **231–233**, **307–309**. Add symbols without cross-file during load: `packages/lsp-compliant-services/src/services/DocumentProcessingService.ts` **321** (batch), **462** (single). Defer cross-file in symbol layer: `packages/apex-parser-ast/src/symbols/ApexSymbolManager.ts` **1677**, **1686**; `packages/apex-parser-ast/src/symbols/ApexSymbolGraph.ts` **1100**.

---

## 3. High-priority request (hover)

**Observed:** In some runs `successCount: 0` and latencies 0–1 ms (empty or fast failure); in the latest automated run with valid positions, all three projects show `successCount: 30`, avg ~27 ms. Behavior depends on test positions and timing.

**Possible causes when successCount is 0:**

- Test positions (e.g. “class” keyword) don’t have hover content.
- Hover handler returns empty for those positions.
- Hover runs before symbols are available (e.g. right after didOpen) so resolution returns nothing.

**Optimizations:**

1. **Validate testbed hover positions** – In `run-all-scenarios.ts`, ensure hover positions are on symbols that have hover content (e.g. type names, method names), not only on `class` keyword, so metrics reflect real user experience.
2. **Ensure hover uses high priority** – If hover is not already scheduled with **Immediate** or **High** priority in the queue, give it higher priority than workspace load / batch processing so hovers are answered quickly and aren’t starved by low-priority work.
3. **Optional: return “loading” hover** – When workspace is still loading, consider returning a short message (e.g. “Indexing…”) instead of empty, so the client sees a response and successCount reflects intent.

---

## 4. Queue priority management

**Collection:** Queue priority metrics are filled automatically when you run **`./scripts/run-all-scenarios.sh`**. The testbed passes **`initializationOptions: { apex: { environment: { serverMode: 'development' } } }`** (LSP shape) so the server registers **`apex/queueState`**. It polls **`apex/queueState`** every 200 ms during the references request (with a **2 s timeout** per poll so the client doesn’t block when the server is busy) and writes **`performance-metrics/queue-samples-<project>.json`** (always, even when empty, so all three projects appear in the report). The shell script runs **`collect-queue-priority-metrics.js --parse-queue-samples`** for each project → **`queue-priority-<project>.json`**. You can also parse server logs with **`--parse-log`** (see `scripts/PERFORMANCE_METRICS_REFERENCE.md`).

**Finding – 0–1 samples under load:** When the server is busy (references in flight, workspace load), **`apex/queueState`** either times out (2 s) or is starved because the scheduler is busy with low-priority work. Queue-priority metrics then show **sampleCount: 0** or **1** with no meaningful depth history; **large** is affected most often, but small and medium can also show 0–1 samples in a given run.

**Optimization – make queue state responsive under load:**

1. **Serve `apex/queueState` without blocking on the scheduler** – The handler currently calls `Effect.runPromise(metrics())`, which may wait on scheduler state. Consider maintaining a **lightweight, last-known snapshot** of queue sizes (e.g. updated on a timer or when the scheduler updates) so **`apex/queueState`** can return immediately from that snapshot instead of blocking on the busy scheduler. That way dashboards and automated metrics still get data when the queue is under heavy load.
2. **Higher priority for metrics/diagnostics** – If the scheduler supports it, run the work that answers **`apex/queueState`** (or the callback that updates the snapshot) at **High** or **Immediate** priority so it isn’t starved by low-priority workspace load.
3. **Keep the 2 s client timeout** – The testbed’s 2 s timeout for each poll avoids blocking; combined with (1)–(2), more samples for large may be possible.

**Preemption (goal):** Hover and Go to Definition should preempt or run ahead of low-priority workspace/batch work.

**Checks:**

1. **Hover / definition requests** – Confirm they are enqueued with **Immediate** or **High** priority (and that the scheduler actually runs high priority before Low).
2. **Workspace load / batch** – Should remain **Low** (or Background) so they don’t delay user-facing requests.
3. **Preemption** – If the scheduler is strictly FIFO within priority, consider preemption: when a High/Immediate request arrives, pause or defer the current Low-priority task and run the high-priority one (then resume or re-queue the low-priority task).
4. **Use queue metrics** – After a run, open `performance-comparison.html` and check the Queue Priority Management section: high **avg queue depth** or **max depth** during load may indicate starvation or backlog; compare across small/medium/large. Expect 0–1 samples (especially for large) until the above optimizations are in place.

**Files:** `packages/apex-parser-ast` (scheduler, queue, priority), `packages/lsp-compliant-services` (QueueStateProcessingService, apex/queueState handler), `packages/apex-lsp-testbed/src/scripts/run-all-scenarios.ts` (queue state sampling, init options, 2 s timeout).

---

## 5. Deferred reference processing

**Observed:** `deferredRelatedNodes` 29 (small) → 74 (large); retry/deferred work scales with size.

**Optimizations:**

1. **Limit retries** – Cap the number of retries for deferred reference resolution so that failing items don’t keep getting retried and add load.
2. **Batch size** – `ApexSymbolGraph` uses `DEFERRED_BATCH_SIZE` for deferred work. Reduce batch size or yield between batches so deferred work doesn’t form long tasks.
3. **Backoff** – Add exponential backoff between retries to avoid bursts of CPU when many items are deferred.

**Files:** `packages/apex-parser-ast/src/symbols/ApexSymbolGraph.ts` (deferred batch size, processing), and any retry logic for deferred references.

---

## 6. Document open (batch)

**Observed:** `documentRelatedNodes` 7–10; batch processing uses `processDocumentOpenBatch` after decompression.

**Optimizations:**

1. **Smaller batches** – Process document-open in smaller chunks (e.g. 20–50 docs per chunk) with a yield between chunks so the event loop can serve other requests.
2. **Decompression** – Same as §1: move `unzipSync` off the main thread or use streaming/chunked decompression so that large batches don’t block.

---

## 7. Quick wins (config / constants)

- **`ApexSymbolManager`** – Reduce `addSymbolTable` batch size from 100 to **50** (or 25).
- **`ApexSymbolManager`** – Reduce `initialReferenceBatchSize` (e.g. to **20–30**) for same-file reference processing.
- **`WorkspaceBatchHandler`** – If client can send smaller batches, use **smaller batch sizes** (e.g. 50–100 files per batch) so each `unzipSync` is cheaper.
- **Scheduler** – Ensure **hover** and **definition** are **Immediate** or **High**; workspace load and batch remain **Low**.

---

## Verification

After changes:

1. Re-run **`./scripts/run-all-scenarios.sh --with-profiling`** for small, medium, and large.
2. Run **`node scripts/collect-all-from-profiles.js`** (when using profiling) and **`generate-performance-comparison.js`** (run by the shell script).
3. Check **event-loop-blocking** – `maxBlockingMs` should drop (target &lt; 100 ms for no visible freezes).
4. Check **workspace-load** – `totalTimeMs` may stay similar but UI should feel responsive (no 15–22 s freezes).
5. Check **high-priority-request** – `successCount` and latency when hover positions are on real symbols.
6. Check **queue-priority** – `performance-comparison.html` should show Queue Priority Management for all three projects. Under load, all projects can show 0–1 samples until `apex/queueState` is optimized to respond without blocking (see §4).

Reference: **`scripts/PERFORMANCE_METRICS_WORKFLOW.md`** and **`scripts/PERFORMANCE_METRICS_REFERENCE.md`**.
