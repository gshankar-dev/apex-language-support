# UI Preview Extension: Startup Performance Test Results (Windows)

**Extension under test:** salesforcedx-vscode-ui-preview v1.1.4
**Test project:** dreamhouse (Dreamhouse LWC sample app)
**Platform:** Windows 11 (VM) -- VS Code 1.106.2, AMD EPYC 7763 (4 cores), 16 GB RAM
**Context:** Extension pack validation ahead of TDX; UI Preview is a new candidate for the pack. This is the Windows counterpart to the macOS test. Note: macOS used mega-enterprise; Windows uses dreamhouse, so absolute times are not directly comparable across platforms.

**Reminder:** Fully quit VS Code between each run (not just reload window). Expect higher absolute times and wider variance compared to macOS due to VM overhead.

---

## Scenario A: Without UI Preview Extension

Disable or uninstall salesforcedx-vscode-ui-preview before starting.

### Run 1


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

## Scenario B: With UI Preview Extension

Enable or install salesforcedx-vscode-ui-preview v1.1.4 before starting.

### Run 1

(paste Developer: Startup Performance table here)

### Run 2

(paste Developer: Startup Performance table here)

### Run 3

(paste Developer: Startup Performance table here)
