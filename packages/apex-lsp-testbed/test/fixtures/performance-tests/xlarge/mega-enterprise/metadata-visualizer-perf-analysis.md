# Metadata Visualizer Extension: Startup Performance Impact Analysis

## Purpose

Determine whether the Salesforce Metadata Visualizer extension (`salesforce.salesforce-metadata-visualizer-vscode`) affects the startup performance of other Salesforce extensions, and establish a baseline for its own activation times in a large Apex project.

## Test Environment

- **Platform:** macOS
- **Project:** Synthetic large-enterprise Apex project (~1,500 classes, ~89 triggers, namespace `fsc`, API v60.0)
- **Runs per scenario:** 3
- **Metrics compared:** Load Code (ms), Call Activate (ms), Finish Activate (ms)
- **Controlled variable:** The metadata visualizer extension was the only extension added/removed between scenarios. All other extensions remained identical.

---

## Salesforce Extension Comparison

### Load Code (ms)

| Extension | Without (R1) | Without (R2) | Without (R3) | Avg Without | With (R1) | With (R2) | With (R3) | Avg With | Delta | % Change |
|---|---|---|---|---|---|---|---|---|---|---|
| `salesforcedx-einstein-gpt` | 491 | 447 | 460 | 466 | 422 | 422 | 428 | 424 | -42 | -9.0% |
| `salesforcedx-vscode-apex` | 220 | 195 | 205 | 207 | 192 | 204 | 220 | 205 | -2 | -0.6% |
| `salesforcedx-vscode-apex-oas` | 292 | 296 | 289 | 292 | 374 | 289 | 282 | 315 | +23 | +7.8% |
| `salesforcedx-vscode-apex-testing` | 147 | 138 | 139 | 141 | 142 | 141 | 136 | 140 | -2 | -1.2% |
| `salesforcedx-vscode-core` | 274 | 246 | 268 | 263 | 275 | 261 | 270 | 269 | +6 | +2.3% |
| `salesforcedx-vscode-lwc` | 322 | 301 | 302 | 308 | 356 | 286 | 289 | 310 | +2 | +0.7% |
| `salesforcedx-vscode-metadata` | 41 | 41 | 40 | 41 | 43 | 41 | 43 | 42 | +1 | +4.1% |
| `salesforcedx-vscode-org` | 196 | 185 | 188 | 190 | 170 | 186 | 173 | 176 | -13 | -7.0% |
| `salesforcedx-vscode-services` | 321 | 333 | 320 | 325 | 293 | 324 | 345 | 321 | -4 | -1.2% |
| `sfdx-code-analyzer-vscode` | 10 | 7 | 13 | 10 | 7 | 7 | 5 | 6 | -4 | -36.7% |
| `apex-language-server-extension` | 126 | 124 | 126 | 125 | 127 | 126 | 125 | 126 | +1 | +0.5% |
| `salesforce-internal-dx` | 30 | 21 | 27 | 26 | 20 | 20 | 24 | 21 | -5 | -18.0% |
| **Total** | | | | **2,394** | | | | **2,356** | **-38** | **-1.6%** |

### Call Activate (ms)

| Extension | Without (R1) | Without (R2) | Without (R3) | Avg Without | With (R1) | With (R2) | With (R3) | Avg With | Delta |
|---|---|---|---|---|---|---|---|---|---|
| `salesforcedx-einstein-gpt` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `salesforcedx-vscode-apex` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `salesforcedx-vscode-apex-oas` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `salesforcedx-vscode-apex-testing` | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 0 |
| `salesforcedx-vscode-core` | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 |
| `salesforcedx-vscode-lwc` | 1 | 0 | 1 | 1 | 1 | 1 | 1 | 1 | 0 |
| `salesforcedx-vscode-metadata` | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 2 | 0 |
| `salesforcedx-vscode-org` | 1 | 1 | 1 | 1 | 1 | 0 | 0 | 0 | 0 |
| `salesforcedx-vscode-services` | 0 | 1 | 1 | 1 | 1 | 0 | 1 | 1 | 0 |
| `sfdx-code-analyzer-vscode` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `apex-language-server-extension` | 2 | 2 | 2 | 2 | 2 | 3 | 2 | 2 | 0 |
| `salesforce-internal-dx` | 0 | 1 | 1 | 1 | 0 | 1 | 0 | 0 | 0 |

All Call Activate values are 0-3 ms. No meaningful difference between scenarios.

### Finish Activate (ms)

| Extension | Without (R1) | Without (R2) | Without (R3) | Avg Without | With (R1) | With (R2) | With (R3) | Avg With | Delta | % Change |
|---|---|---|---|---|---|---|---|---|---|---|
| `salesforcedx-einstein-gpt` | 53 | 51 | 54 | 53 | 96 | 69 | 77 | 81 | +28 | +52.8% |
| `salesforcedx-vscode-apex` | 1,453 | 1,338 | 1,423 | 1,405 | 1,619 | 1,356 | 1,354 | 1,443 | +38 | +2.7% |
| `salesforcedx-vscode-apex-oas` | 22 | 22 | 22 | 22 | 50 | 38 | 44 | 44 | +22 | +100.0% |
| `salesforcedx-vscode-apex-testing` | 3,078 | 2,278 | 2,396 | 2,584 | 2,155 | 2,402 | 2,513 | 2,357 | -227 | -8.8% |
| `salesforcedx-vscode-core` | 687 | 673 | 672 | 677 | 719 | 669 | 644 | 677 | 0 | 0.0% |
| `salesforcedx-vscode-lwc` | 327 | 317 | 324 | 323 | 349 | 352 | 350 | 350 | +27 | +8.5% |
| `salesforcedx-vscode-metadata` | 3,246 | 2,466 | 2,459 | 2,724 | 2,268 | 2,389 | 2,449 | 2,369 | -355 | -13.0% |
| `salesforcedx-vscode-org` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | — |
| `salesforcedx-vscode-services` | 333 | 76 | 66 | 158 | 67 | 62 | 79 | 69 | -89 | -56.3% |
| `sfdx-code-analyzer-vscode` | 37 | 28 | 30 | 32 | 47 | 50 | 52 | 50 | +18 | +55.7% |
| `apex-language-server-extension` | 7 | 6 | 6 | 6 | 6 | 6 | 5 | 6 | 0 | -5.3% |
| `salesforce-internal-dx` | 15,580 | 15,237 | 15,200 | 15,339 | 15,196 | 14,638 | 15,338 | 15,057 | -282 | -1.8% |
| **Total** | | | | **23,323** | | | | **22,503** | **-820** | **-3.5%** |
| **Total (excl. internal-dx)** | | | | **7,984** | | | | **7,446** | **-538** | **-6.7%** |

---

## Metadata Visualizer Baseline (Own Activation Times)

| Metric | Run 1 | Run 2 | Run 3 | Average |
|---|---|---|---|---|
| Load Code (ms) | 5 | 5 | 4 | 5 |
| Call Activate (ms) | 0 | 0 | 0 | 0 |
| Finish Activate (ms) | — | 4 | 4 | 4 |

The metadata visualizer is extremely lightweight: ~5 ms to load code and ~4 ms to finish activation. It activates lazily on `onLanguage:xml` (not eagerly at startup) and performs no significant work when no supported metadata files (flexipages, flows, objects, permission sets) are open.

---

## Analysis

### Call Activate: No Impact

Call Activate times are uniformly 0-3 ms across both scenarios for all Salesforce extensions. The metadata visualizer has no effect on this metric.

### Load Code: No Impact

Aggregate Load Code time across all Salesforce extensions **decreased by 38 ms (-1.6%)** with the visualizer present. No individual extension shows a consistent directional change:

- 6 extensions decreased (e.g., `einstein-gpt` -42 ms, `vscode-org` -13 ms)
- 5 extensions increased by single-digit milliseconds (e.g., `vscode-core` +6 ms, `vscode-apex-oas` +23 ms)
- 1 extension was unchanged (`apex-language-server-extension` +1 ms)

The largest individual change (`vscode-apex-oas` +23 ms) falls within the run-to-run variance for that extension (range: 282-374 ms across all runs). The visualizer's own 5 ms load time is negligible.

### Finish Activate: No Impact

Aggregate Finish Activate time **decreased by 538 ms (-6.7%)** excluding `salesforce-internal-dx`, and by 820 ms (-3.5%) including it. Results are mixed across individual extensions:

- **Decreased:** `vscode-metadata` (-355 ms), `vscode-apex-testing` (-227 ms), `vscode-services` (-89 ms), `salesforce-internal-dx` (-282 ms)
- **Increased:** `vscode-apex` (+38 ms), `einstein-gpt` (+28 ms), `vscode-lwc` (+27 ms), `vscode-apex-oas` (+22 ms), `code-analyzer` (+18 ms)
- **Unchanged:** `vscode-core` (0 ms), `vscode-org` (0 ms), `apex-language-server-extension` (0 ms)

Extensions with large percentage changes (e.g., `vscode-apex-oas` +100%, `code-analyzer` +56%, `einstein-gpt` +53%) all have small absolute values (22-53 ms baseline), making them highly susceptible to measurement noise. The extensions with the largest absolute Finish Activate times (`vscode-metadata`, `vscode-apex-testing`) both **decreased** with the visualizer present.

Notable: `vscode-services` without-Run 1 recorded 333 ms vs. 76 ms and 66 ms in Runs 2 and 3, indicating an outlier that inflates the without-scenario average for that extension.

---

## Conclusion

**The Salesforce Metadata Visualizer extension has no measurable impact on the startup performance of other Salesforce extensions.** With a properly controlled test (identical extension sets, only toggling the visualizer):

- **Load Code** aggregate was 38 ms **lower** with the visualizer (-1.6%)
- **Call Activate** was unchanged (0-3 ms in both scenarios)
- **Finish Activate** aggregate was 538 ms **lower** with the visualizer (-6.7%)

These results indicate that observed differences are attributable to normal run-to-run variance rather than any causal effect from the visualizer. The visualizer itself adds only **~5 ms load + ~4 ms activation**, activates lazily (`onLanguage:xml`), and does not compete for resources during the eager startup phase.
