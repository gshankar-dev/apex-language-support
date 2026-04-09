# Data Code Extension CLI Plugin: Startup Performance Test Results (Windows)

**CLI plugin under test:** @salesforce/plugin-data-code-extension v0.1.0
**Install command:** sf plugins:install @salesforce/plugin-data-code-extension
**Test project:** dreamhouse (Dreamhouse LWC sample app)
**Platform:** Windows 11 (VM) -- VS Code 1.106.2, AMD EPYC 7763 (4 cores), 16 GB RAM
**Context:** Plugin is being added to the AFV IDE image ahead of TDX; validating it does not negatively affect IDE performance. This is the Windows counterpart to the macOS test.

Note: This is a CLI plugin, not a VS Code extension. It will not appear in Developer: Startup Performance output directly. The test measures whether its presence in the CLI affects VS Code extension activation times.

**Important:** The "without" runs are reused from the UI Preview Windows test (Scenario A: Without UI Preview). During those runs, neither UI Preview nor the CLI plugin was installed. Ensure UI Preview remains uninstalled for the "with" runs so the only variable is the CLI plugin.

---

## Scenario A: Without CLI Plugin (reused from UI Preview test)

### Run 1

(Reused from ui-preview-perf-results-windows.md Scenario A Run 1)

| Extension                                           | Eager | Load Code | Call Activate | Finish Activate | Event                                              | By                                               |
| --------------------------------------------------- | ----- | --------- | ------------- | --------------- | -------------------------------------------------- | ------------------------------------------------ |
| vscode.git-base                                     | true  | 4         | 1             | 0               | *                                                  | vscode.git-base                                  |
| vscode.github                                       | true  | 55        | 1             | 6               | *                                                  | vscode.github                                    |
| vscode.npm                                          | true  | 26        | 0             | 6               | workspaceContains:package.json                     | vscode.npm                                       |
| vscode.configuration-editing                        | false | 16        | 1             | 0               | onLanguage:json                                    | vscode.configuration-editing                     |
| vscode.css-language-features                        | false | 419       | 8             | 2089            | onLanguage:css                                     | vscode.css-language-features                     |
| vscode.debug-auto-launch                            | false | 4         | 0             | 0               | onStartupFinished                                  | vscode.debug-auto-launch                         |
| vscode.emmet                                        | false | 18        | 14            | 0               | onLanguage                                         | vscode.emmet                                     |
| vscode.extension-editing                            | false | 21        | 1             | 0               | onLanguage:json                                    | vscode.extension-editing                         |
| vscode.git                                          | false | 71        | 8             | 802             | api                                                | vscode.github                                    |
| vscode.github-authentication                        | false | 26        | 3             | 3               | onAuthenticationRequest:github                     | vscode.github-authentication                     |
| vscode.html-language-features                       | false | 230       | 10            | 3708            | onLanguage:html                                    | vscode.html-language-features                    |
| vscode.json-language-features                       | false | 64        | 0             | 744             | onLanguage:json                                    | vscode.json-language-features                    |
| vscode.markdown-language-features                   | false | 190       | 33            | 2298            | onLanguage:markdown                                | vscode.markdown-language-features                |
| vscode.markdown-math                                | false | 13        | 0             | 0               | api                                                | vscode.markdown-language-features                |
| vscode.merge-conflict                               | false | 20        | 3             | 3               | onStartupFinished                                  | vscode.merge-conflict                            |
| vscode.terminal-suggest                             | false | 59        | 0             | 79              | onTerminalShellIntegration:*                       | vscode.terminal-suggest                          |
| vscode.typescript-language-features                 | false | 82        | 7             | 15              | onLanguage:jsonc                                   | vscode.typescript-language-features              |
| esbenp.prettier-vscode                              | false | 34        | 16            | 49              | onStartupFinished                                  | esbenp.prettier-vscode                           |
| MS-SarifVSCode.sarif-viewer                         | false | 66        | 8             | 5311            | workspaceContains:.git                             | MS-SarifVSCode.sarif-viewer                      |
| redhat.vscode-xml                                   | false | 147       | 0             | 3064            | api                                                | salesforce.salesforcedx-vscode-core              |
| Salesforce.agent-script-language-client             | false | 58        | 0             | 1073            | onStartupFinished                                  | Salesforce.agent-script-language-client          |
| salesforce.apex-language-server-extension           | false | 136       | 15            | 75              | onLanguage:apex                                    | salesforce.apex-language-server-extension        |
| salesforce.salesforce-metadata-visualizer-vscode    | false | 32        | 1             | 27              | onLanguage:xml                                     | salesforce.salesforce-metadata-visualizer-vscode |
| salesforce.salesforce-vscode-slds                   | false | 159       | 1             | 104             | onLanguage:typescript                              | salesforce.salesforce-vscode-slds                |
| salesforce.salesforcedx-einstein-gpt                | false | 1712      | 1             | 1129            | workspaceContains:sfdx-project.json                | salesforce.salesforcedx-einstein-gpt             |
| Salesforce.salesforcedx-vscode-agents               | false | 2129      | 5             | 351             | workspaceContains:sfdx-project.json                | Salesforce.salesforcedx-vscode-agents            |
| salesforce.salesforcedx-vscode-apex                 | false | 865       | 1             | 31688           | workspaceContains:sfdx-project.json                | Salesforce.salesforcedx-vscode-agents            |
| salesforce.salesforcedx-vscode-apex-log             | false | 232       | 23            | 30              | workspaceContains:sfdx-project.json                | Salesforce.salesforcedx-vscode-agents            |
| salesforce.salesforcedx-vscode-apex-oas             | false | 1240      | 1             | 10991           | workspaceContains:sfdx-project.json                | salesforce.salesforcedx-vscode-apex-oas          |
| salesforce.salesforcedx-vscode-apex-replay-debugger | false | 824       | 1             | 2943            | workspaceContains:sfdx-project.json                | Salesforce.salesforcedx-vscode-agents            |
| salesforce.salesforcedx-vscode-apex-testing         | false | 625       | 21            | 79              | workspaceContains:sfdx-project.json                | salesforce.salesforcedx-vscode-apex-testing      |
| salesforce.salesforcedx-vscode-core                 | false | 653       | 0             | 7732            | onStartupFinished                                  | Salesforce.agent-script-language-client          |
| salesforce.salesforcedx-vscode-lightning            | false | 2217      | 4             | 2321            | workspaceContains:**/aura/**,**/workspace-user.xml | salesforce.salesforcedx-vscode-lightning         |
| salesforce.salesforcedx-vscode-lwc                  | false | 2199      | 0             | 6036            | workspaceContains:**/lwc/**,**/workspace-user.xml  | salesforce.salesforcedx-vscode-lwc               |
| salesforce.salesforcedx-vscode-metadata             | false | 258       | 3             | 1528            | workspaceContains:sfdx-project.json                | salesforce.salesforcedx-vscode-metadata          |
| salesforce.salesforcedx-vscode-org                  | false | 997       | 8             | 1745            | workspaceContains:sfdx-project.json                | Salesforce.salesforcedx-vscode-agents            |
| salesforce.salesforcedx-vscode-services             | false | 721       | 3             | 198             | onStartupFinished                                  | Salesforce.agent-script-language-client          |
| salesforce.sfdx-code-analyzer-vscode                | false | 20        | 0             | 220             | workspaceContains:sfdx-project.json                | salesforce.sfdx-code-analyzer-vscode             |


### Run 2

(Reused from ui-preview-perf-results-windows.md Scenario A Run 2)

| Extension                                           | Eager | Load Code | Call Activate | Finish Activate | Event                                              | By                                               |
| --------------------------------------------------- | ----- | --------- | ------------- | --------------- | -------------------------------------------------- | ------------------------------------------------ |
| vscode.git                                          | true  | 57        | 15            | 2880            | *                                                  | vscode.git                                       |
| vscode.git-base                                     | true  | 34        | 1             | 0               | *                                                  | vscode.git                                       |
| vscode.github                                       | true  | 3577      | 1             | 8               | *                                                  | vscode.github                                    |
| vscode.npm                                          | true  | 56        | 1             | 6644            | workspaceContains:package.json                     | vscode.npm                                       |
| MS-SarifVSCode.sarif-viewer                         | true  | 59        | 11            | 607             | workspaceContains:.git                             | MS-SarifVSCode.sarif-viewer                      |
| Salesforce.agent-script-language-client             | true  | 30        | 0             | 641             | workspaceContains:sfdx-project.json                | Salesforce.salesforcedx-vscode-agents            |
| salesforce.salesforcedx-einstein-gpt                | true  | 1153      | 1             | 364             | workspaceContains:sfdx-project.json                | salesforce.salesforcedx-einstein-gpt             |
| Salesforce.salesforcedx-vscode-agents               | true  | 1183      | 5             | 124             | workspaceContains:sfdx-project.json                | Salesforce.salesforcedx-vscode-agents            |
| salesforce.salesforcedx-vscode-apex                 | true  | 504       | 0             | 18190           | workspaceContains:sfdx-project.json                | Salesforce.salesforcedx-vscode-agents            |
| salesforce.salesforcedx-vscode-apex-log             | true  | 172       | 28            | 36              | workspaceContains:sfdx-project.json                | Salesforce.salesforcedx-vscode-agents            |
| salesforce.salesforcedx-vscode-apex-oas             | true  | 817       | 0             | 6346            | workspaceContains:sfdx-project.json                | salesforce.salesforcedx-vscode-apex-oas          |
| salesforce.salesforcedx-vscode-apex-replay-debugger | true  | 566       | 1             | 2840            | workspaceContains:sfdx-project.json                | Salesforce.salesforcedx-vscode-agents            |
| salesforce.salesforcedx-vscode-apex-testing         | true  | 485       | 29            | 163             | workspaceContains:sfdx-project.json                | salesforce.salesforcedx-vscode-apex-testing      |
| salesforce.salesforcedx-vscode-core                 | true  | 711       | 1             | 7556            | workspaceContains:sfdx-project.json                | salesforce.salesforcedx-einstein-gpt             |
| salesforce.salesforcedx-vscode-lightning            | true  | 515       | 4             | 1923            | workspaceContains:**/aura/**,**/workspace-user.xml | salesforce.salesforcedx-vscode-lightning         |
| salesforce.salesforcedx-vscode-lwc                  | true  | 585       | 0             | 5458            | workspaceContains:**/lwc/**,**/workspace-user.xml  | salesforce.salesforcedx-vscode-lwc               |
| salesforce.salesforcedx-vscode-metadata             | true  | 207       | 4             | 3216            | workspaceContains:sfdx-project.json                | salesforce.salesforcedx-vscode-metadata          |
| salesforce.salesforcedx-vscode-org                  | true  | 563       | 6             | 3489            | workspaceContains:sfdx-project.json                | Salesforce.salesforcedx-vscode-agents            |
| salesforce.salesforcedx-vscode-services             | true  | 1191      | 6             | 221             | *                                                  | salesforce.salesforcedx-vscode-services          |
| salesforce.sfdx-code-analyzer-vscode                | true  | 17        | 1             | 319             | workspaceContains:sfdx-project.json                | salesforce.sfdx-code-analyzer-vscode             |
| vscode.configuration-editing                        | false | 11        | 0             | 0               | onLanguage:jsonc                                   | vscode.configuration-editing                     |
| vscode.css-language-features                        | false | 114       | 46            | 1186            | onLanguage:css                                     | vscode.css-language-features                     |
| vscode.debug-auto-launch                            | false | 3         | 0             | 0               | onStartupFinished                                  | vscode.debug-auto-launch                         |
| vscode.emmet                                        | false | 115       | 146           | 0               | onLanguage                                         | vscode.emmet                                     |
| vscode.extension-editing                            | false | 26        | 6             | 0               | onLanguage:markdown                                | vscode.extension-editing                         |
| vscode.github-authentication                        | false | 65        | 35            | 12              | onAuthenticationRequest:github                     | vscode.github-authentication                     |
| vscode.html-language-features                       | false | 131       | 12            | 1281            | onLanguage:html                                    | vscode.html-language-features                    |
| vscode.json-language-features                       | false | 72        | 0             | 1013            | onLanguage:jsonc                                   | vscode.json-language-features                    |
| vscode.markdown-language-features                   | false | 248       | 81            | 1621            | onLanguage:markdown                                | vscode.markdown-language-features                |
| vscode.markdown-math                                | false | 12        | 0             | 0               | api                                                | vscode.markdown-language-features                |
| vscode.merge-conflict                               | false | 19        | 4             | 4               | onStartupFinished                                  | vscode.merge-conflict                            |
| vscode.terminal-suggest                             | false | 224       | 38            | 6200            | onTerminalShellIntegration:*                       | vscode.terminal-suggest                          |
| vscode.typescript-language-features                 | false | 45        | 75            | 9               | onLanguage:jsonc                                   | vscode.typescript-language-features              |
| esbenp.prettier-vscode                              | false | 792       | 1             | 468             | onStartupFinished                                  | esbenp.prettier-vscode                           |
| redhat.vscode-xml                                   | false | 145       | 0             | 2886            | api                                                | salesforce.salesforcedx-vscode-core              |
| salesforce.apex-language-server-extension           | false | 32        | 8             | 1               | onLanguage:apex                                    | salesforce.apex-language-server-extension        |
| salesforce.salesforce-metadata-visualizer-vscode    | false | 17        | 2             | 21              | onLanguage:xml                                     | salesforce.salesforce-metadata-visualizer-vscode |
| salesforce.salesforce-vscode-slds                   | false | 150       | 1             | 23              | onLanguage:javascript                              | salesforce.salesforce-vscode-slds                |


### Run 3

(Reused from ui-preview-perf-results-windows.md Scenario A Run 3)

| Extension                                           | Eager | Load Code | Call Activate | Finish Activate | Event                                              | By                                               |
| --------------------------------------------------- | ----- | --------- | ------------- | --------------- | -------------------------------------------------- | ------------------------------------------------ |
| vscode.git                                          | true  | 55        | 8             | 2149            | *                                                  | vscode.git                                       |
| vscode.git-base                                     | true  | 16        | 0             | 0               | *                                                  | vscode.git                                       |
| vscode.github                                       | true  | 3417      | 2             | 9               | *                                                  | vscode.github                                    |
| vscode.npm                                          | true  | 33        | 2             | 6587            | workspaceContains:package.json                     | vscode.npm                                       |
| MS-SarifVSCode.sarif-viewer                         | true  | 66        | 8             | 615             | workspaceContains:.git                             | MS-SarifVSCode.sarif-viewer                      |
| Salesforce.agent-script-language-client             | true  | 30        | 0             | 745             | workspaceContains:sfdx-project.json                | Salesforce.salesforcedx-vscode-agents            |
| salesforce.salesforcedx-einstein-gpt                | true  | 1109      | 1             | 378             | workspaceContains:sfdx-project.json                | salesforce.salesforcedx-einstein-gpt             |
| Salesforce.salesforcedx-vscode-agents               | true  | 1139      | 4             | 141             | workspaceContains:sfdx-project.json                | Salesforce.salesforcedx-vscode-agents            |
| salesforce.salesforcedx-vscode-apex                 | true  | 505       | 0             | 12981           | workspaceContains:sfdx-project.json                | Salesforce.salesforcedx-vscode-agents            |
| salesforce.salesforcedx-vscode-apex-log             | true  | 168       | 30            | 38              | workspaceContains:sfdx-project.json                | Salesforce.salesforcedx-vscode-agents            |
| salesforce.salesforcedx-vscode-apex-oas             | true  | 752       | 0             | 7090            | workspaceContains:sfdx-project.json                | salesforce.salesforcedx-vscode-apex-oas          |
| salesforce.salesforcedx-vscode-apex-replay-debugger | true  | 507       | 1             | 3875            | workspaceContains:sfdx-project.json                | Salesforce.salesforcedx-vscode-agents            |
| salesforce.salesforcedx-vscode-apex-testing         | true  | 464       | 41            | 141             | workspaceContains:sfdx-project.json                | salesforce.salesforcedx-vscode-apex-testing      |
| salesforce.salesforcedx-vscode-core                 | true  | 720       | 1             | 6983            | workspaceContains:sfdx-project.json                | salesforce.salesforcedx-einstein-gpt             |
| salesforce.salesforcedx-vscode-lightning            | true  | 516       | 4             | 1777            | workspaceContains:**/aura/**,**/workspace-user.xml | salesforce.salesforcedx-vscode-lightning         |
| salesforce.salesforcedx-vscode-lwc                  | true  | 616       | 1             | 5106            | workspaceContains:**/lwc/**,**/workspace-user.xml  | salesforce.salesforcedx-vscode-lwc               |
| salesforce.salesforcedx-vscode-metadata             | true  | 225       | 3             | 3213            | workspaceContains:sfdx-project.json                | salesforce.salesforcedx-vscode-metadata          |
| salesforce.salesforcedx-vscode-org                  | true  | 497       | 4             | 3398            | workspaceContains:sfdx-project.json                | Salesforce.salesforcedx-vscode-agents            |
| salesforce.salesforcedx-vscode-services             | true  | 1032      | 4             | 318             | *                                                  | salesforce.salesforcedx-vscode-services          |
| salesforce.sfdx-code-analyzer-vscode                | true  | 17        | 0             | 299             | workspaceContains:sfdx-project.json                | salesforce.sfdx-code-analyzer-vscode             |
| vscode.configuration-editing                        | false | 10        | 1             | 0               | onLanguage:jsonc                                   | vscode.configuration-editing                     |
| vscode.css-language-features                        | false | 520       | 26            | 1058            | onLanguage:css                                     | vscode.css-language-features                     |
| vscode.debug-auto-launch                            | false | 3         | 1             | 0               | onStartupFinished                                  | vscode.debug-auto-launch                         |
| vscode.emmet                                        | false | 93        | 61            | 0               | onLanguage                                         | vscode.emmet                                     |
| vscode.extension-editing                            | false | 71        | 8             | 0               | onLanguage:markdown                                | vscode.extension-editing                         |
| vscode.github-authentication                        | false | 115       | 49            | 10              | onAuthenticationRequest:github                     | vscode.github-authentication                     |
| vscode.html-language-features                       | false | 56        | 10            | 1321            | onLanguage:html                                    | vscode.html-language-features                    |
| vscode.json-language-features                       | false | 64        | 1             | 887             | onLanguage:jsonc                                   | vscode.json-language-features                    |
| vscode.markdown-language-features                   | false | 358       | 22            | 1591            | onLanguage:markdown                                | vscode.markdown-language-features                |
| vscode.markdown-math                                | false | 9         | 0             | 0               | api                                                | vscode.markdown-language-features                |
| vscode.merge-conflict                               | false | 17        | 4             | 4               | onStartupFinished                                  | vscode.merge-conflict                            |
| vscode.terminal-suggest                             | false | 214       | 3             | 5666            | onTerminalShellIntegration:*                       | vscode.terminal-suggest                          |
| vscode.typescript-language-features                 | false | 47        | 8             | 10              | onLanguage:jsonc                                   | vscode.typescript-language-features              |
| esbenp.prettier-vscode                              | false | 418       | 1             | 309             | onStartupFinished                                  | esbenp.prettier-vscode                           |
| redhat.vscode-xml                                   | false | 141       | 1             | 2549            | api                                                | salesforce.salesforcedx-vscode-core              |
| salesforce.salesforce-metadata-visualizer-vscode    | false | 18        | 1             | 313             | onLanguage:xml                                     | salesforce.salesforce-metadata-visualizer-vscode |
| salesforce.salesforce-vscode-slds                   | false | 207       | 1             | 175             | onLanguage:javascript                              | salesforce.salesforce-vscode-slds                |


---

## Scenario B: With CLI Plugin

Install before starting (ensure UI Preview is NOT installed to match baseline):
sf plugins:install @salesforce/plugin-data-code-extension

### Run 1


| Extension                                           | Eager | Load Code | Call Activate | Finish Activate | Event                                              | By                                               |
| --------------------------------------------------- | ----- | --------- | ------------- | --------------- | -------------------------------------------------- | ------------------------------------------------ |
| vscode.git                                          | true  | 71        | 9             | 2138            | *                                                  | vscode.git                                       |
| vscode.git-base                                     | true  | 36        | 1             | 0               | *                                                  | vscode.git                                       |
| vscode.github                                       | true  | 3507      | 2             | 9               | *                                                  | vscode.github                                    |
| vscode.npm                                          | true  | 49        | 0             | 6345            | workspaceContains:package.json                     | vscode.npm                                       |
| MS-SarifVSCode.sarif-viewer                         | true  | 47        | 8             | 728             | workspaceContains:.git                             | MS-SarifVSCode.sarif-viewer                      |
| Salesforce.agent-script-language-client             | true  | 29        | 0             | 912             | workspaceContains:sfdx-project.json                | Salesforce.salesforcedx-vscode-agents            |
| salesforce.salesforcedx-einstein-gpt                | true  | 1144      | 1             | 358             | workspaceContains:sfdx-project.json                | salesforce.salesforcedx-einstein-gpt             |
| Salesforce.salesforcedx-vscode-agents               | true  | 1124      | 3             | 128             | workspaceContains:sfdx-project.json                | Salesforce.salesforcedx-vscode-agents            |
| salesforce.salesforcedx-vscode-apex                 | true  | 511       | 0             | 13455           | workspaceContains:sfdx-project.json                | Salesforce.salesforcedx-vscode-agents            |
| salesforce.salesforcedx-vscode-apex-log             | true  | 193       | 30            | 36              | workspaceContains:sfdx-project.json                | Salesforce.salesforcedx-vscode-agents            |
| salesforce.salesforcedx-vscode-apex-oas             | true  | 752       | 0             | 9137            | workspaceContains:sfdx-project.json                | salesforce.salesforcedx-vscode-apex-oas          |
| salesforce.salesforcedx-vscode-apex-replay-debugger | true  | 604       | 1             | 3812            | workspaceContains:sfdx-project.json                | Salesforce.salesforcedx-vscode-agents            |
| salesforce.salesforcedx-vscode-apex-testing         | true  | 459       | 32            | 769             | workspaceContains:sfdx-project.json                | salesforce.salesforcedx-vscode-apex-testing      |
| salesforce.salesforcedx-vscode-core                 | true  | 699       | 0             | 7710            | workspaceContains:sfdx-project.json                | salesforce.salesforcedx-einstein-gpt             |
| salesforce.salesforcedx-vscode-lightning            | true  | 505       | 41            | 1494            | workspaceContains:**/aura/**,**/workspace-user.xml | salesforce.salesforcedx-vscode-lightning         |
| salesforce.salesforcedx-vscode-lwc                  | true  | 562       | 0             | 4876            | workspaceContains:**/lwc/**,**/workspace-user.xml  | salesforce.salesforcedx-vscode-lwc               |
| salesforce.salesforcedx-vscode-metadata             | true  | 207       | 4             | 3683            | workspaceContains:sfdx-project.json                | salesforce.salesforcedx-vscode-metadata          |
| salesforce.salesforcedx-vscode-org                  | true  | 500       | 6             | 3818            | workspaceContains:sfdx-project.json                | Salesforce.salesforcedx-vscode-agents            |
| salesforce.salesforcedx-vscode-services             | true  | 1194      | 3             | 227             | *                                                  | salesforce.salesforcedx-vscode-services          |
| salesforce.sfdx-code-analyzer-vscode                | true  | 29        | 1             | 265             | workspaceContains:sfdx-project.json                | salesforce.sfdx-code-analyzer-vscode             |
| vscode.configuration-editing                        | false | 10        | 1             | 0               | onLanguage:jsonc                                   | vscode.configuration-editing                     |
| vscode.css-language-features                        | false | 516       | 9             | 1161            | onLanguage:css                                     | vscode.css-language-features                     |
| vscode.debug-auto-launch                            | false | 4         | 0             | 0               | onStartupFinished                                  | vscode.debug-auto-launch                         |
| vscode.emmet                                        | false | 80        | 40            | 0               | onLanguage                                         | vscode.emmet                                     |
| vscode.extension-editing                            | false | 53        | 2             | 0               | onLanguage:markdown                                | vscode.extension-editing                         |
| vscode.github-authentication                        | false | 46        | 4             | 5               | onAuthenticationRequest:github                     | vscode.github-authentication                     |
| vscode.html-language-features                       | false | 63        | 10            | 1466            | onLanguage:html                                    | vscode.html-language-features                    |
| vscode.json-language-features                       | false | 56        | 1             | 927             | onLanguage:jsonc                                   | vscode.json-language-features                    |
| vscode.markdown-language-features                   | false | 262       | 40            | 1795            | onLanguage:markdown                                | vscode.markdown-language-features                |
| vscode.markdown-math                                | false | 8         | 0             | 0               | api                                                | vscode.markdown-language-features                |
| vscode.merge-conflict                               | false | 38        | 3             | 5               | onStartupFinished                                  | vscode.merge-conflict                            |
| vscode.terminal-suggest                             | false | 190       | 0             | 553             | onTerminalShellIntegration:*                       | vscode.terminal-suggest                          |
| vscode.typescript-language-features                 | false | 45        | 11            | 14              | onLanguage:jsonc                                   | vscode.typescript-language-features              |
| esbenp.prettier-vscode                              | false | 528       | 1             | 440             | onStartupFinished                                  | esbenp.prettier-vscode                           |
| redhat.vscode-xml                                   | false | 143       | 0             | 2789            | api                                                | salesforce.salesforcedx-vscode-core              |
| salesforce.apex-language-server-extension           | false | 48        | 19            | 4               | onLanguage:apex                                    | salesforce.apex-language-server-extension        |
| salesforce.salesforce-metadata-visualizer-vscode    | false | 20        | 29            | 598             | onLanguage:xml                                     | salesforce.salesforce-metadata-visualizer-vscode |
| salesforce.salesforce-vscode-slds                   | false | 295       | 1             | 200             | onLanguage:javascript                              | salesforce.salesforce-vscode-slds                |


### Run 2


| Extension                                           | Eager | Load Code | Call Activate | Finish Activate | Event                                              | By                                               |
| --------------------------------------------------- | ----- | --------- | ------------- | --------------- | -------------------------------------------------- | ------------------------------------------------ |
| vscode.git                                          | true  | 82        | 6             | 2079            | *                                                  | vscode.git                                       |
| vscode.git-base                                     | true  | 7         | 0             | 0               | *                                                  | vscode.git                                       |
| vscode.github                                       | true  | 3491      | 2             | 8               | *                                                  | vscode.github                                    |
| vscode.npm                                          | true  | 62        | 1             | 6780            | workspaceContains:package.json                     | vscode.npm                                       |
| MS-SarifVSCode.sarif-viewer                         | true  | 49        | 9             | 706             | workspaceContains:.git                             | MS-SarifVSCode.sarif-viewer                      |
| Salesforce.agent-script-language-client             | true  | 29        | 1             | 1072            | workspaceContains:sfdx-project.json                | Salesforce.salesforcedx-vscode-agents            |
| salesforce.salesforcedx-einstein-gpt                | true  | 1192      | 1             | 456             | workspaceContains:sfdx-project.json                | salesforce.salesforcedx-einstein-gpt             |
| Salesforce.salesforcedx-vscode-agents               | true  | 1206      | 5             | 120             | workspaceContains:sfdx-project.json                | Salesforce.salesforcedx-vscode-agents            |
| salesforce.salesforcedx-vscode-apex                 | true  | 524       | 1             | 15134           | workspaceContains:sfdx-project.json                | Salesforce.salesforcedx-vscode-agents            |
| salesforce.salesforcedx-vscode-apex-log             | true  | 172       | 32            | 45              | workspaceContains:sfdx-project.json                | Salesforce.salesforcedx-vscode-agents            |
| salesforce.salesforcedx-vscode-apex-oas             | true  | 743       | 0             | 5114            | workspaceContains:sfdx-project.json                | salesforce.salesforcedx-vscode-apex-oas          |
| salesforce.salesforcedx-vscode-apex-replay-debugger | true  | 511       | 1             | 996             | workspaceContains:sfdx-project.json                | Salesforce.salesforcedx-vscode-agents            |
| salesforce.salesforcedx-vscode-apex-testing         | true  | 415       | 26            | 764             | workspaceContains:sfdx-project.json                | salesforce.salesforcedx-vscode-apex-testing      |
| salesforce.salesforcedx-vscode-core                 | true  | 700       | 1             | 8354            | workspaceContains:sfdx-project.json                | salesforce.salesforcedx-einstein-gpt             |
| salesforce.salesforcedx-vscode-lightning            | true  | 513       | 9             | 2068            | workspaceContains:**/aura/**,**/workspace-user.xml | salesforce.salesforcedx-vscode-lightning         |
| salesforce.salesforcedx-vscode-lwc                  | true  | 563       | 0             | 5228            | workspaceContains:**/lwc/**,**/workspace-user.xml  | salesforce.salesforcedx-vscode-lwc               |
| salesforce.salesforcedx-vscode-metadata             | true  | 217       | 4             | 3934            | workspaceContains:sfdx-project.json                | salesforce.salesforcedx-vscode-metadata          |
| salesforce.salesforcedx-vscode-org                  | true  | 503       | 7             | 3226            | workspaceContains:sfdx-project.json                | Salesforce.salesforcedx-vscode-agents            |
| salesforce.salesforcedx-vscode-services             | true  | 1250      | 3             | 290             | *                                                  | salesforce.salesforcedx-vscode-services          |
| salesforce.sfdx-code-analyzer-vscode                | true  | 17        | 1             | 301             | workspaceContains:sfdx-project.json                | salesforce.sfdx-code-analyzer-vscode             |
| vscode.configuration-editing                        | false | 8         | 1             | 0               | onLanguage:jsonc                                   | vscode.configuration-editing                     |
| vscode.css-language-features                        | false | 54        | 9             | 1843            | onLanguage:css                                     | vscode.css-language-features                     |
| vscode.debug-auto-launch                            | false | 3         | 0             | 0               | onStartupFinished                                  | vscode.debug-auto-launch                         |
| vscode.emmet                                        | false | 152       | 60            | 0               | onLanguage                                         | vscode.emmet                                     |
| vscode.extension-editing                            | false | 54        | 1             | 0               | onLanguage:markdown                                | vscode.extension-editing                         |
| vscode.github-authentication                        | false | 60        | 10            | 10              | onAuthenticationRequest:github                     | vscode.github-authentication                     |
| vscode.html-language-features                       | false | 76        | 7             | 1306            | onLanguage:html                                    | vscode.html-language-features                    |
| vscode.json-language-features                       | false | 50        | 0             | 1066            | onLanguage:jsonc                                   | vscode.json-language-features                    |
| vscode.markdown-language-features                   | false | 343       | 14            | 1357            | onLanguage:markdown                                | vscode.markdown-language-features                |
| vscode.markdown-math                                | false | 8         | 0             | 0               | api                                                | vscode.markdown-language-features                |
| vscode.merge-conflict                               | false | 20        | 4             | 5               | onStartupFinished                                  | vscode.merge-conflict                            |
| vscode.terminal-suggest                             | false | 235       | 1             | 5978            | onTerminalShellIntegration:*                       | vscode.terminal-suggest                          |
| vscode.typescript-language-features                 | false | 45        | 36            | 10              | onLanguage:jsonc                                   | vscode.typescript-language-features              |
| esbenp.prettier-vscode                              | false | 760       | 1             | 389             | onStartupFinished                                  | esbenp.prettier-vscode                           |
| redhat.vscode-xml                                   | false | 126       | 1             | 2828            | api                                                | salesforce.salesforcedx-vscode-core              |
| salesforce.apex-language-server-extension           | false | 235       | 9             | 2               | onLanguage:apex                                    | salesforce.apex-language-server-extension        |
| salesforce.salesforce-metadata-visualizer-vscode    | false | 18        | 1             | 601             | onLanguage:xml                                     | salesforce.salesforce-metadata-visualizer-vscode |
| salesforce.salesforce-vscode-slds                   | false | 177       | 1             | 280             | onLanguage:javascript                              | salesforce.salesforce-vscode-slds                |


### Run 3


| Extension                                           | Eager | Load Code | Call Activate | Finish Activate | Event                                              | By                                               |
| --------------------------------------------------- | ----- | --------- | ------------- | --------------- | -------------------------------------------------- | ------------------------------------------------ |
| vscode.git                                          | true  | 58        | 6             | 2171            | *                                                  | vscode.git                                       |
| vscode.git-base                                     | true  | 5         | 0             | 0               | *                                                  | vscode.git                                       |
| vscode.github                                       | true  | 3294      | 2             | 10              | *                                                  | vscode.github                                    |
| vscode.npm                                          | true  | 26        | 0             | 5431            | workspaceContains:package.json                     | vscode.npm                                       |
| MS-SarifVSCode.sarif-viewer                         | true  | 58        | 10            | 95              | workspaceContains:.git                             | MS-SarifVSCode.sarif-viewer                      |
| Salesforce.agent-script-language-client             | true  | 33        | 1             | 775             | workspaceContains:sfdx-project.json                | Salesforce.salesforcedx-vscode-agents            |
| salesforce.salesforcedx-einstein-gpt                | true  | 1165      | 1             | 227             | workspaceContains:sfdx-project.json                | salesforce.salesforcedx-einstein-gpt             |
| Salesforce.salesforcedx-vscode-agents               | true  | 1605      | 6             | 406             | workspaceContains:sfdx-project.json                | Salesforce.salesforcedx-vscode-agents            |
| salesforce.salesforcedx-vscode-apex                 | true  | 539       | 0             | 18018           | workspaceContains:sfdx-project.json                | Salesforce.salesforcedx-vscode-agents            |
| salesforce.salesforcedx-vscode-apex-log             | true  | 178       | 43            | 34              | workspaceContains:sfdx-project.json                | Salesforce.salesforcedx-vscode-agents            |
| salesforce.salesforcedx-vscode-apex-oas             | true  | 771       | 0             | 6012            | workspaceContains:sfdx-project.json                | salesforce.salesforcedx-vscode-apex-oas          |
| salesforce.salesforcedx-vscode-apex-replay-debugger | true  | 597       | 11            | 1458            | workspaceContains:sfdx-project.json                | Salesforce.salesforcedx-vscode-agents            |
| salesforce.salesforcedx-vscode-apex-testing         | true  | 444       | 24            | 730             | workspaceContains:sfdx-project.json                | salesforce.salesforcedx-vscode-apex-testing      |
| salesforce.salesforcedx-vscode-core                 | true  | 752       | 1             | 5695            | workspaceContains:sfdx-project.json                | salesforce.salesforcedx-einstein-gpt             |
| salesforce.salesforcedx-vscode-lightning            | true  | 539       | 3             | 2421            | workspaceContains:**/aura/**,**/workspace-user.xml | salesforce.salesforcedx-vscode-lightning         |
| salesforce.salesforcedx-vscode-lwc                  | true  | 613       | 0             | 4006            | workspaceContains:**/lwc/**,**/workspace-user.xml  | salesforce.salesforcedx-vscode-lwc               |
| salesforce.salesforcedx-vscode-metadata             | true  | 238       | 3             | 2907            | workspaceContains:sfdx-project.json                | salesforce.salesforcedx-vscode-metadata          |
| salesforce.salesforcedx-vscode-org                  | true  | 493       | 6             | 3061            | workspaceContains:sfdx-project.json                | Salesforce.salesforcedx-vscode-agents            |
| salesforce.salesforcedx-vscode-services             | true  | 1489      | 3             | 185             | *                                                  | salesforce.salesforcedx-vscode-services          |
| salesforce.sfdx-code-analyzer-vscode                | true  | 19        | 1             | 140             | workspaceContains:sfdx-project.json                | salesforce.sfdx-code-analyzer-vscode             |
| vscode.configuration-editing                        | false | 10        | 1             | 0               | onLanguage:jsonc                                   | vscode.configuration-editing                     |
| vscode.css-language-features                        | false | 217       | 45            | 7517            | onLanguage:css                                     | vscode.css-language-features                     |
| vscode.debug-auto-launch                            | false | 3         | 1             | 0               | onStartupFinished                                  | vscode.debug-auto-launch                         |
| vscode.emmet                                        | false | 38        | 82            | 0               | onLanguage                                         | vscode.emmet                                     |
| vscode.extension-editing                            | false | 21        | 1             | 0               | onLanguage:json                                    | vscode.extension-editing                         |
| vscode.github-authentication                        | false | 93        | 27            | 5               | onAuthenticationRequest:github                     | vscode.github-authentication                     |
| vscode.html-language-features                       | false | 49        | 8             | 2692            | onLanguage:html                                    | vscode.html-language-features                    |
| vscode.json-language-features                       | false | 53        | 1             | 428             | onLanguage:jsonc                                   | vscode.json-language-features                    |
| vscode.markdown-language-features                   | false | 117       | 10            | 911             | onLanguage:markdown                                | vscode.markdown-language-features                |
| vscode.markdown-math                                | false | 7         | 0             | 0               | api                                                | vscode.markdown-language-features                |
| vscode.merge-conflict                               | false | 17        | 4             | 5               | onStartupFinished                                  | vscode.merge-conflict                            |
| vscode.terminal-suggest                             | false | 164       | 22            | 95              | onTerminalShellIntegration:*                       | vscode.terminal-suggest                          |
| vscode.typescript-language-features                 | false | 49        | 8             | 11              | onLanguage:jsonc                                   | vscode.typescript-language-features              |
| esbenp.prettier-vscode                              | false | 457       | 1             | 1285            | onStartupFinished                                  | esbenp.prettier-vscode                           |
| redhat.vscode-xml                                   | false | 124       | 0             | 2349            | api                                                | salesforce.salesforcedx-vscode-core              |
| salesforce.apex-language-server-extension           | false | 50        | 7             | 0               | onLanguage:apex                                    | salesforce.apex-language-server-extension        |
| salesforce.salesforce-metadata-visualizer-vscode    | false | 23        | 23            | 419             | onLanguage:xml                                     | salesforce.salesforce-metadata-visualizer-vscode |
| salesforce.salesforce-vscode-slds                   | false | 273       | 1             | 263             | onLanguage:javascript                              | salesforce.salesforce-vscode-slds                |

