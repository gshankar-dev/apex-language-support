# UI Preview Extension: Startup Performance Impact Analysis

Extension under test: salesforcedx-vscode-ui-preview v1.1.4
Test project: mega-enterprise (~1,500 classes, ~89 triggers, namespace fsc, API v60.0)
Platform: macOS
Context: Extension pack validation ahead of TDX; UI Preview is a new candidate for the pack.

## Installed Salesforce Extension Versions

| Extension | Version |
|---|---|
| salesforcedx-vscode (pack) | 66.3.2 |
| salesforcedx-vscode-apex | 66.3.2 |
| salesforcedx-vscode-apex-debugger | 66.3.2 |
| salesforcedx-vscode-apex-log | 66.3.2 |
| salesforcedx-vscode-apex-oas | 66.3.2 |
| salesforcedx-vscode-apex-replay-debugger | 66.3.2 |
| salesforcedx-vscode-apex-testing | 66.3.2 |
| salesforcedx-vscode-core | 66.3.2 |
| salesforcedx-vscode-expanded | 66.3.2 |
| salesforcedx-vscode-lightning | 66.3.2 |
| salesforcedx-vscode-lwc | 66.3.2 |
| salesforcedx-vscode-metadata | 66.3.2 |
| salesforcedx-vscode-org | 66.3.2 |
| salesforcedx-vscode-org-browser | 66.3.2 |
| salesforcedx-vscode-services | 66.3.2 |
| salesforcedx-vscode-soql | 66.3.2 |
| salesforcedx-vscode-visualforce | 66.3.2 |
| salesforcedx-einstein-gpt | 3.24.0 |
| salesforcedx-vscode-agents | 1.11.0 |
| agent-script-language-client | 1.2.14 |
| sfdx-code-analyzer-vscode | 1.15.0 |
| apex-language-server-extension | 0.5.0 |
| salesforce-metadata-visualizer-vscode | 1.0.0 |
| salesforce-vscode-slds | 2.0.12 |
| salesforce-internal-dx | 1.5.6 |

## Notes

- salesforcedx-vscode-visualforce activated in all 3 "with" runs but not in the "without" runs. Its impact is negligible (5 ms load, 0 ms finish activate).
- salesforcedx-vscode-apex-log recorded a Call Activate outlier of 41 ms in With Run 3 (vs. 8-11 ms in all other runs).

## UI Preview Baseline (Own Activation Times)

| Metric | Run 1 | Run 2 | Run 3 | Average |
|---|---|---|---|---|
| Load Code (ms) | 136 | 132 | 134 | 134 |
| Call Activate (ms) | 1 | 1 | 1 | 1 |
| Finish Activate (ms) | 37 | 24 | 25 | 29 |

The UI Preview extension activates eagerly via workspaceContains:sfdx-project.json. It loads in ~134 ms and completes activation in ~29 ms.

## Load Code (ms)

| Extension | Without (R1) | Without (R2) | Without (R3) | Avg Without | With (R1) | With (R2) | With (R3) | Avg With | Delta | % Change |
|---|---|---|---|---|---|---|---|---|---|---|
| agent-script-language-client | 12 | 13 | 13 | 13 | 12 | 12 | 13 | 12 | 0 | -2.6% |
| salesforcedx-einstein-gpt | 451 | 436 | 456 | 448 | 417 | 443 | 444 | 435 | -13 | -2.9% |
| salesforcedx-vscode-agents | 340 | 289 | 275 | 301 | 284 | 159 | 167 | 203 | -98 | -32.5% |
| salesforcedx-vscode-apex | 198 | 196 | 203 | 199 | 190 | 190 | 190 | 190 | -9 | -4.5% |
| salesforcedx-vscode-apex-log | 63 | 64 | 65 | 64 | 63 | 67 | 67 | 66 | +2 | +2.6% |
| salesforcedx-vscode-apex-oas | 283 | 295 | 289 | 289 | 294 | 287 | 286 | 289 | 0 | 0.0% |
| salesforcedx-vscode-apex-replay-debugger | 216 | 208 | 206 | 210 | 204 | 206 | 205 | 205 | -5 | -2.4% |
| salesforcedx-vscode-apex-testing | 169 | 170 | 167 | 169 | 166 | 170 | 170 | 169 | 0 | 0.0% |
| salesforcedx-vscode-core | 263 | 250 | 246 | 253 | 253 | 251 | 253 | 252 | -1 | -0.3% |
| salesforcedx-vscode-lwc | 232 | 211 | 209 | 217 | 216 | 214 | 212 | 214 | -3 | -1.5% |
| salesforcedx-vscode-metadata | 79 | 86 | 82 | 82 | 83 | 76 | 83 | 81 | -2 | -2.0% |
| salesforcedx-vscode-org | 221 | 222 | 208 | 217 | 220 | 210 | 222 | 217 | 0 | +0.2% |
| salesforcedx-vscode-services | 309 | 315 | 303 | 309 | 312 | 305 | 319 | 312 | +3 | +1.0% |
| sfdx-code-analyzer-vscode | 6 | 6 | 7 | 6 | 6 | 6 | 11 | 8 | +1 | +21.1% |
| apex-language-server-extension | 121 | 125 | 128 | 125 | 131 | 134 | 128 | 131 | +6 | +5.1% |
| salesforce-internal-dx | 21 | 21 | 22 | 21 | 20 | 20 | 21 | 20 | -1 | -4.7% |
| Total (excl. internal-dx) | | | | 2,901 | | | | 2,784 | -117 | -4.0% |

Load Code is flat or slightly lower with UI Preview present. The vscode-agents drop (-98 ms) is driven by high inherent variance in that extension (range: 159-340 ms across all runs), not a UI Preview effect.

## Call Activate (ms)

| Extension | Without (R1) | Without (R2) | Without (R3) | Avg Without | With (R1) | With (R2) | With (R3) | Avg With | Delta |
|---|---|---|---|---|---|---|---|---|---|
| agent-script-language-client | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| salesforcedx-einstein-gpt | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| salesforcedx-vscode-agents | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 0 |
| salesforcedx-vscode-apex | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| salesforcedx-vscode-apex-log | 9 | 11 | 8 | 9 | 11 | 8 | 41 | 20 | +11 |
| salesforcedx-vscode-apex-oas | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| salesforcedx-vscode-apex-replay-debugger | 1 | 1 | 0 | 1 | 1 | 0 | 0 | 0 | 0 |
| salesforcedx-vscode-apex-testing | 11 | 8 | 7 | 9 | 11 | 8 | 7 | 9 | 0 |
| salesforcedx-vscode-core | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| salesforcedx-vscode-lwc | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| salesforcedx-vscode-metadata | 1 | 2 | 1 | 1 | 1 | 2 | 1 | 1 | 0 |
| salesforcedx-vscode-org | 2 | 2 | 1 | 2 | 3 | 2 | 2 | 2 | +1 |
| salesforcedx-vscode-services | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 0 |
| sfdx-code-analyzer-vscode | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| apex-language-server-extension | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 0 |
| salesforce-internal-dx | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

All values 0-11 ms except a single outlier (vscode-apex-log at 41 ms in With R3). No meaningful difference between scenarios.

## Finish Activate (ms)

| Extension | Without (R1) | Without (R2) | Without (R3) | Avg Without | With (R1) | With (R2) | With (R3) | Avg With | Delta | % Change |
|---|---|---|---|---|---|---|---|---|---|---|
| agent-script-language-client | 214 | 219 | 196 | 210 | 145 | 232 | 137 | 171 | -38 | -18.3% |
| salesforcedx-einstein-gpt | 46 | 23 | 29 | 33 | 73 | 28 | 64 | 55 | +22 | +68.3% |
| salesforcedx-vscode-agents | 4 | 3 | 3 | 3 | 4 | 5 | 4 | 4 | +1 | +30.0% |
| salesforcedx-vscode-apex | 1269 | 1295 | 1290 | 1285 | 1090 | 1057 | 1110 | 1086 | -199 | -15.5% |
| salesforcedx-vscode-apex-log | 15 | 40 | 20 | 25 | 16 | 15 | 16 | 16 | -9 | -37.3% |
| salesforcedx-vscode-apex-oas | 389 | 331 | 323 | 348 | 345 | 196 | 204 | 248 | -99 | -28.6% |
| salesforcedx-vscode-apex-replay-debugger | 22 | 21 | 27 | 23 | 29 | 18 | 17 | 21 | -2 | -8.6% |
| salesforcedx-vscode-apex-testing | 41 | 44 | 51 | 45 | 42 | 58 | 58 | 53 | +7 | +16.2% |
| salesforcedx-vscode-core | 1260 | 1031 | 1620 | 1304 | 1079 | 1355 | 1098 | 1177 | -126 | -9.7% |
| salesforcedx-vscode-lwc | 743 | 544 | 638 | 642 | 605 | 615 | 588 | 603 | -39 | -6.1% |
| salesforcedx-vscode-metadata | 2036 | 816 | 1135 | 1329 | 1388 | 987 | 2391 | 1589 | +260 | +19.5% |
| salesforcedx-vscode-org | 1924 | 2095 | 1065 | 1695 | 1866 | 1062 | 997 | 1308 | -386 | -22.8% |
| salesforcedx-vscode-services | 72 | 72 | 68 | 71 | 76 | 64 | 69 | 70 | -1 | -1.4% |
| sfdx-code-analyzer-vscode | 27 | 13 | 12 | 17 | 71 | 16 | 48 | 45 | +28 | +159.7% |
| apex-language-server-extension | 5 | 5 | 6 | 5 | 5 | 7 | 6 | 6 | +1 | +12.5% |
| salesforce-internal-dx | 18119 | 15557 | 15207 | 16294 | 15333 | 15578 | 15203 | 15371 | -923 | -5.7% |
| Total (excl. internal-dx) | | | | 7033 | | | | 6452 | -581 | -8.3% |

Finish Activate shows high variance in both scenarios, particularly for vscode-metadata (816-2,391 ms), vscode-org (997-2,095 ms), and vscode-core (1,031-1,620 ms). Extensions with large percentage changes (einstein-gpt +68%, code-analyzer +160%) have small absolute baselines (17-33 ms), making them noise. No consistent directional trend across extensions.

## Conclusion

The UI Preview extension (salesforcedx-vscode-ui-preview v1.1.4) has no measurable negative impact on the startup performance of other Salesforce extensions.

| Metric | Aggregate Delta (excl. internal-dx) | Direction |
|---|---|---|
| Load Code | -117 ms (-4.0%) | Slightly lower with UI Preview |
| Call Activate | No change (0-11 ms range) | Flat |
| Finish Activate | -581 ms (-8.3%) | Slightly lower with UI Preview |

All observed differences are attributable to normal run-to-run variance. The UI Preview extension itself is lightweight: 134 ms load, 1 ms call activate, 29 ms finish activate. It activates eagerly on workspaceContains:sfdx-project.json but completes quickly with minimal resource consumption.
