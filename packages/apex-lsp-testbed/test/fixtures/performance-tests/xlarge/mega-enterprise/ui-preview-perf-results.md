# UI Preview Extension: Startup Performance Impact Analysis

**Extension under test:** `salesforcedx-vscode-ui-preview` v1.1.4
**Test project:** mega-enterprise (~1,500 classes, ~89 triggers, namespace `fsc`, API v60.0)
**Platform:** macOS
**Context:** Extension pack validation ahead of TDX; UI Preview is a new candidate for the pack.

## Installed Salesforce Extension Versions


| Extension                                  | Version |
| ------------------------------------------ | ------- |
| `salesforcedx-vscode` (pack)               | 66.3.2  |
| `salesforcedx-vscode-apex`                 | 66.3.2  |
| `salesforcedx-vscode-apex-debugger`        | 66.3.2  |
| `salesforcedx-vscode-apex-log`             | 66.3.2  |
| `salesforcedx-vscode-apex-oas`             | 66.3.2  |
| `salesforcedx-vscode-apex-replay-debugger` | 66.3.2  |
| `salesforcedx-vscode-apex-testing`         | 66.3.2  |
| `salesforcedx-vscode-core`                 | 66.3.2  |
| `salesforcedx-vscode-expanded`             | 66.3.2  |
| `salesforcedx-vscode-lightning`            | 66.3.2  |
| `salesforcedx-vscode-lwc`                  | 66.3.2  |
| `salesforcedx-vscode-metadata`             | 66.3.2  |
| `salesforcedx-vscode-org`                  | 66.3.2  |
| `salesforcedx-vscode-org-browser`          | 66.3.2  |
| `salesforcedx-vscode-services`             | 66.3.2  |
| `salesforcedx-vscode-soql`                 | 66.3.2  |
| `salesforcedx-vscode-visualforce`          | 66.3.2  |
| `salesforcedx-einstein-gpt`                | 3.24.0  |
| `salesforcedx-vscode-agents`               | 1.11.0  |
| `agent-script-language-client`             | 1.2.14  |
| `sfdx-code-analyzer-vscode`                | 1.15.0  |
| `apex-language-server-extension`           | 0.5.0   |
| `salesforce-metadata-visualizer-vscode`    | 1.0.0   |
| `salesforce-vscode-slds`                   | 2.0.12  |
| `salesforce-internal-dx`                   | 1.5.6   |


---

## Scenario A: Without UI Preview Extension

### Run 1


| Extension                                           | Eager | Load Code | Call Activate | Finish Activate | Event                                             | By                                          |
| --------------------------------------------------- | ----- | --------- | ------------- | --------------- | ------------------------------------------------- | ------------------------------------------- |
| anysphere.cursor-agent-exec                         | true  | 130       | 3             | 17              | *                                                 | anysphere.cursor-agent-exec                 |
| anysphere.cursor-polyfills-remote                   | true  | 8         | 0             | 0               | *                                                 | anysphere.cursor-polyfills-remote           |
| vscode.git                                          | true  | 19        | 2             | 1558            | *                                                 | vscode.git                                  |
| vscode.git-base                                     | true  | 0         | 1             | 0               | *                                                 | vscode.git                                  |
| vscode.github                                       | true  | 8         | 1             | 1               | *                                                 | vscode.github                               |
| chuckjonas.apex-pmd                                 | true  | 2         | 0             | 0               | *                                                 | chuckjonas.apex-pmd                         |
| Salesforce.agent-script-language-client             | true  | 12        | 0             | 214             | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-einstein-gpt                | true  | 451       | 1             | 46              | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-einstein-gpt        |
| Salesforce.salesforcedx-vscode-agents               | true  | 340       | 1             | 4               | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex                 | true  | 198       | 0             | 1269            | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex-log             | true  | 63        | 9             | 15              | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex-oas             | true  | 283       | 0             | 389             | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-apex-oas     |
| salesforce.salesforcedx-vscode-apex-replay-debugger | true  | 216       | 1             | 22              | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex-testing         | true  | 169       | 11            | 41              | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-apex-testing |
| salesforce.salesforcedx-vscode-core                 | true  | 263       | 0             | 1260            | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-einstein-gpt        |
| salesforce.salesforcedx-vscode-lwc                  | true  | 232       | 0             | 743             | workspaceContains:**/lwc/**,**/workspace-user.xml | salesforce.salesforcedx-vscode-lwc          |
| salesforce.salesforcedx-vscode-metadata             | true  | 79        | 1             | 2036            | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-metadata     |
| salesforce.salesforcedx-vscode-org                  | true  | 221       | 2             | 1924            | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-services             | true  | 309       | 1             | 72              | *                                                 | salesforce.salesforcedx-vscode-services     |
| salesforce.sfdx-code-analyzer-vscode                | true  | 6         | 1             | 27              | workspaceContains:sfdx-project.json               | salesforce.sfdx-code-analyzer-vscode        |
| vscode.configuration-editing                        | false | 4         | 0             | 0               | onLanguage:jsonc                                  | vscode.configuration-editing                |
| anysphere.cursor-always-local                       | false | 125       | 7             | 0               | onStartupFinished                                 | anysphere.cursor-always-local               |
| cursor.cursor-browser-automation                    | false | 5         | 0             | 0               | onStartupFinished                                 | cursor.cursor-browser-automation            |
| anysphere.cursor-commits                            | false | 60        | 0             | 1               | onStartupFinished                                 | anysphere.cursor-commits                    |
| anysphere.cursor-deeplink                           | false | 25        | 0             | 0               | onStartupFinished                                 | anysphere.cursor-deeplink                   |
| anysphere.cursor-mcp                                | false | 58        | 0             | 31              | onStartupFinished                                 | anysphere.cursor-mcp                        |
| anysphere.cursor-resolver                           | false | 65        | 1             | 0               | onStartupFinished                                 | anysphere.cursor-resolver                   |
| anysphere.cursor-retrieval                          | false | 105       | 0             | 11              | onStartupFinished                                 | anysphere.cursor-retrieval                  |
| anysphere.cursor-shadow-workspace                   | false | 29        | 0             | 0               | onStartupFinished                                 | anysphere.cursor-shadow-workspace           |
| anysphere.cursor-socket                             | false | 1         | 0             | 0               | onStartupFinished                                 | anysphere.cursor-socket                     |
| vscode.debug-auto-launch                            | false | 0         | 0             | 0               | onStartupFinished                                 | vscode.debug-auto-launch                    |
| vscode.emmet                                        | false | 8         | 4             | 0               | onLanguage                                        | vscode.emmet                                |
| vscode.extension-editing                            | false | 6         | 1             | 0               | onLanguage:markdown                               | vscode.extension-editing                    |
| vscode.github-authentication                        | false | 7         | 1             | 1               | onStartupFinished                                 | GitHub.vscode-pull-request-github           |
| vscode.json-language-features                       | false | 19        | 0             | 129             | onLanguage:jsonc                                  | vscode.json-language-features               |
| vscode.markdown-language-features                   | false | 31        | 4             | 193             | onLanguage:markdown                               | vscode.markdown-language-features           |
| vscode.markdown-math                                | false | 4         | 0             | 0               | api                                               | vscode.markdown-language-features           |
| vscode.merge-conflict                               | false | 7         | 1             | 1               | onStartupFinished                                 | vscode.merge-conflict                       |
| vscode.typescript-language-features                 | false | 18        | 2             | 3               | onLanguage:jsonc                                  | vscode.typescript-language-features         |
| dbaeumer.vscode-eslint                              | false | 11        | 3             | 0               | onStartupFinished                                 | dbaeumer.vscode-eslint                      |
| esbenp.prettier-vscode                              | false | 137       | 0             | 18              | onStartupFinished                                 | esbenp.prettier-vscode                      |
| GitHub.vscode-pull-request-github                   | false | 42        | 1             | 74              | onStartupFinished                                 | GitHub.vscode-pull-request-github           |
| salesforce.apex-language-server-extension           | false | 121       | 2             | 5               | onLanguage:apex                                   | salesforce.apex-language-server-extension   |
| Salesforce.salesforce-internal-dx                   | false | 21        | 0             | 18119           | onStartupFinished                                 | Salesforce.salesforce-internal-dx           |


### Run 2


| Extension                                           | Eager | Load Code | Call Activate | Finish Activate | Event                                             | By                                          |
| --------------------------------------------------- | ----- | --------- | ------------- | --------------- | ------------------------------------------------- | ------------------------------------------- |
| anysphere.cursor-agent-exec                         | true  | 130       | 3             | 14              | *                                                 | anysphere.cursor-agent-exec                 |
| anysphere.cursor-polyfills-remote                   | true  | 8         | 0             | 0               | *                                                 | anysphere.cursor-polyfills-remote           |
| vscode.git                                          | true  | 21        | 1             | 1362            | *                                                 | vscode.git                                  |
| vscode.git-base                                     | true  | 1         | 0             | 0               | *                                                 | vscode.git                                  |
| vscode.github                                       | true  | 8         | 0             | 2               | *                                                 | vscode.github                               |
| chuckjonas.apex-pmd                                 | true  | 2         | 1             | 0               | *                                                 | chuckjonas.apex-pmd                         |
| Salesforce.agent-script-language-client             | true  | 13        | 1             | 219             | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-einstein-gpt                | true  | 436       | 0             | 23              | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-einstein-gpt        |
| Salesforce.salesforcedx-vscode-agents               | true  | 289       | 1             | 3               | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex                 | true  | 196       | 0             | 1295            | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex-log             | true  | 64        | 11            | 40              | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex-oas             | true  | 295       | 0             | 331             | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-apex-oas     |
| salesforce.salesforcedx-vscode-apex-replay-debugger | true  | 208       | 1             | 21              | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex-testing         | true  | 170       | 8             | 44              | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-apex-testing |
| salesforce.salesforcedx-vscode-core                 | true  | 250       | 0             | 1031            | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-einstein-gpt        |
| salesforce.salesforcedx-vscode-lwc                  | true  | 211       | 0             | 544             | workspaceContains:**/lwc/**,**/workspace-user.xml | salesforce.salesforcedx-vscode-lwc          |
| salesforce.salesforcedx-vscode-metadata             | true  | 86        | 2             | 816             | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-metadata     |
| salesforce.salesforcedx-vscode-org                  | true  | 222       | 2             | 2095            | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-services             | true  | 315       | 1             | 72              | *                                                 | salesforce.salesforcedx-vscode-services     |
| salesforce.sfdx-code-analyzer-vscode                | true  | 6         | 0             | 13              | workspaceContains:sfdx-project.json               | salesforce.sfdx-code-analyzer-vscode        |
| anysphere.cursor-always-local                       | false | 123       | 6             | 1               | onStartupFinished                                 | anysphere.cursor-always-local               |
| cursor.cursor-browser-automation                    | false | 5         | 0             | 1               | onStartupFinished                                 | cursor.cursor-browser-automation            |
| anysphere.cursor-commits                            | false | 59        | 0             | 0               | onStartupFinished                                 | anysphere.cursor-commits                    |
| anysphere.cursor-deeplink                           | false | 24        | 0             | 0               | onStartupFinished                                 | anysphere.cursor-deeplink                   |
| anysphere.cursor-mcp                                | false | 52        | 0             | 28              | onStartupFinished                                 | anysphere.cursor-mcp                        |
| anysphere.cursor-resolver                           | false | 69        | 0             | 0               | onStartupFinished                                 | anysphere.cursor-resolver                   |
| anysphere.cursor-retrieval                          | false | 106       | 1             | 16              | onStartupFinished                                 | anysphere.cursor-retrieval                  |
| anysphere.cursor-shadow-workspace                   | false | 30        | 0             | 0               | onStartupFinished                                 | anysphere.cursor-shadow-workspace           |
| anysphere.cursor-socket                             | false | 1         | 0             | 0               | onStartupFinished                                 | anysphere.cursor-socket                     |
| vscode.debug-auto-launch                            | false | 0         | 0             | 0               | onStartupFinished                                 | vscode.debug-auto-launch                    |
| vscode.emmet                                        | false | 7         | 4             | 0               | onLanguage                                        | vscode.emmet                                |
| vscode.extension-editing                            | false | 5         | 1             | 0               | onLanguage:markdown                               | vscode.extension-editing                    |
| vscode.github-authentication                        | false | 8         | 1             | 1               | onStartupFinished                                 | GitHub.vscode-pull-request-github           |
| vscode.markdown-language-features                   | false | 28        | 3             | 289             | onLanguage:markdown                               | vscode.markdown-language-features           |
| vscode.markdown-math                                | false | 3         | 0             | 0               | api                                               | vscode.markdown-language-features           |
| vscode.merge-conflict                               | false | 7         | 0             | 2               | onStartupFinished                                 | vscode.merge-conflict                       |
| dbaeumer.vscode-eslint                              | false | 11        | 2             | 0               | onStartupFinished                                 | dbaeumer.vscode-eslint                      |
| esbenp.prettier-vscode                              | false | 120       | 0             | 27              | onStartupFinished                                 | esbenp.prettier-vscode                      |
| GitHub.vscode-pull-request-github                   | false | 44        | 1             | 72              | onStartupFinished                                 | GitHub.vscode-pull-request-github           |
| salesforce.apex-language-server-extension           | false | 125       | 2             | 5               | onLanguage:apex                                   | salesforce.apex-language-server-extension   |
| Salesforce.salesforce-internal-dx                   | false | 21        | 0             | 15557           | onStartupFinished                                 | Salesforce.salesforce-internal-dx           |


### Run 3


| Extension                                           | Eager | Load Code | Call Activate | Finish Activate | Event                                             | By                                          |
| --------------------------------------------------- | ----- | --------- | ------------- | --------------- | ------------------------------------------------- | ------------------------------------------- |
| anysphere.cursor-agent-exec                         | true  | 127       | 3             | 30              | *                                                 | anysphere.cursor-agent-exec                 |
| anysphere.cursor-polyfills-remote                   | true  | 9         | 0             | 0               | *                                                 | anysphere.cursor-polyfills-remote           |
| vscode.git                                          | true  | 19        | 2             | 1569            | *                                                 | vscode.git                                  |
| vscode.git-base                                     | true  | 1         | 0             | 0               | *                                                 | vscode.git                                  |
| vscode.github                                       | true  | 8         | 1             | 1               | *                                                 | vscode.github                               |
| chuckjonas.apex-pmd                                 | true  | 1         | 0             | 0               | *                                                 | chuckjonas.apex-pmd                         |
| Salesforce.agent-script-language-client             | true  | 13        | 0             | 196             | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-einstein-gpt                | true  | 456       | 0             | 29              | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-einstein-gpt        |
| Salesforce.salesforcedx-vscode-agents               | true  | 275       | 1             | 3               | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex                 | true  | 203       | 0             | 1290            | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex-log             | true  | 65        | 8             | 20              | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex-oas             | true  | 289       | 0             | 323             | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-apex-oas     |
| salesforce.salesforcedx-vscode-apex-replay-debugger | true  | 206       | 0             | 27              | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex-testing         | true  | 167       | 7             | 51              | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-apex-testing |
| salesforce.salesforcedx-vscode-core                 | true  | 246       | 0             | 1620            | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-einstein-gpt        |
| salesforce.salesforcedx-vscode-lwc                  | true  | 209       | 0             | 638             | workspaceContains:**/lwc/**,**/workspace-user.xml | salesforce.salesforcedx-vscode-lwc          |
| salesforce.salesforcedx-vscode-metadata             | true  | 82        | 1             | 1135            | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-metadata     |
| salesforce.salesforcedx-vscode-org                  | true  | 208       | 1             | 1065            | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-services             | true  | 303       | 1             | 68              | *                                                 | salesforce.salesforcedx-vscode-services     |
| salesforce.sfdx-code-analyzer-vscode                | true  | 7         | 0             | 12              | workspaceContains:sfdx-project.json               | salesforce.sfdx-code-analyzer-vscode        |
| anysphere.cursor-always-local                       | false | 121       | 7             | 1               | onStartupFinished                                 | anysphere.cursor-always-local               |
| cursor.cursor-browser-automation                    | false | 5         | 0             | 0               | onStartupFinished                                 | cursor.cursor-browser-automation            |
| anysphere.cursor-commits                            | false | 57        | 0             | 0               | onStartupFinished                                 | anysphere.cursor-commits                    |
| anysphere.cursor-deeplink                           | false | 23        | 0             | 0               | onStartupFinished                                 | anysphere.cursor-deeplink                   |
| anysphere.cursor-mcp                                | false | 54        | 0             | 30              | onStartupFinished                                 | anysphere.cursor-mcp                        |
| anysphere.cursor-resolver                           | false | 76        | 0             | 0               | onStartupFinished                                 | anysphere.cursor-resolver                   |
| anysphere.cursor-retrieval                          | false | 105       | 0             | 12              | onStartupFinished                                 | anysphere.cursor-retrieval                  |
| anysphere.cursor-shadow-workspace                   | false | 30        | 0             | 0               | onStartupFinished                                 | anysphere.cursor-shadow-workspace           |
| anysphere.cursor-socket                             | false | 0         | 0             | 0               | onStartupFinished                                 | anysphere.cursor-socket                     |
| vscode.debug-auto-launch                            | false | 1         | 0             | 0               | onStartupFinished                                 | vscode.debug-auto-launch                    |
| vscode.emmet                                        | false | 8         | 4             | 0               | onLanguage                                        | vscode.emmet                                |
| vscode.extension-editing                            | false | 4         | 1             | 0               | onLanguage:markdown                               | vscode.extension-editing                    |
| vscode.github-authentication                        | false | 7         | 1             | 1               | onStartupFinished                                 | GitHub.vscode-pull-request-github           |
| vscode.markdown-language-features                   | false | 29        | 4             | 198             | onLanguage:markdown                               | vscode.markdown-language-features           |
| vscode.markdown-math                                | false | 3         | 0             | 0               | api                                               | vscode.markdown-language-features           |
| vscode.merge-conflict                               | false | 7         | 1             | 1               | onStartupFinished                                 | vscode.merge-conflict                       |
| vscode.npm                                          | false | 13        | 0             | 18              | onTerminalQuickFixRequest:ms-vscode.npm-command   | vscode.npm                                  |
| dbaeumer.vscode-eslint                              | false | 11        | 3             | 0               | onStartupFinished                                 | dbaeumer.vscode-eslint                      |
| esbenp.prettier-vscode                              | false | 135       | 0             | 13              | onStartupFinished                                 | esbenp.prettier-vscode                      |
| GitHub.vscode-pull-request-github                   | false | 42        | 1             | 71              | onStartupFinished                                 | GitHub.vscode-pull-request-github           |
| salesforce.apex-language-server-extension           | false | 128       | 2             | 6               | onLanguage:apex                                   | salesforce.apex-language-server-extension   |
| Salesforce.salesforce-internal-dx                   | false | 22        | 0             | 15207           | onStartupFinished                                 | Salesforce.salesforce-internal-dx           |


---

## Scenario B: With UI Preview Extension

### Run 1


| Extension                                           | Eager | Load Code | Call Activate | Finish Activate | Event                                             | By                                          |
| --------------------------------------------------- | ----- | --------- | ------------- | --------------- | ------------------------------------------------- | ------------------------------------------- |
| anysphere.cursor-agent-exec                         | true  | 129       | 2             | 23              | *                                                 | anysphere.cursor-agent-exec                 |
| anysphere.cursor-polyfills-remote                   | true  | 8         | 0             | 0               | *                                                 | anysphere.cursor-polyfills-remote           |
| vscode.git                                          | true  | 20        | 1             | 1336            | *                                                 | vscode.git                                  |
| vscode.git-base                                     | true  | 1         | 0             | 0               | *                                                 | vscode.git                                  |
| vscode.github                                       | true  | 8         | 0             | 1               | *                                                 | vscode.github                               |
| chuckjonas.apex-pmd                                 | true  | 2         | 0             | 0               | *                                                 | chuckjonas.apex-pmd                         |
| Salesforce.agent-script-language-client             | true  | 12        | 0             | 145             | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-einstein-gpt                | true  | 417       | 0             | 73              | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-einstein-gpt        |
| Salesforce.salesforcedx-vscode-agents               | true  | 284       | 1             | 4               | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex                 | true  | 190       | 0             | 1090            | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex-log             | true  | 63        | 11            | 16              | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex-oas             | true  | 294       | 0             | 345             | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-apex-oas     |
| salesforce.salesforcedx-vscode-apex-replay-debugger | true  | 204       | 1             | 29              | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex-testing         | true  | 166       | 11            | 42              | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-apex-testing |
| salesforce.salesforcedx-vscode-core                 | true  | 253       | 0             | 1079            | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-einstein-gpt        |
| salesforce.salesforcedx-vscode-lwc                  | true  | 216       | 0             | 605             | workspaceContains:**/lwc/**,**/workspace-user.xml | salesforce.salesforcedx-vscode-lwc          |
| salesforce.salesforcedx-vscode-metadata             | true  | 83        | 1             | 1388            | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-metadata     |
| salesforce.salesforcedx-vscode-org                  | true  | 220       | 3             | 1866            | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-services             | true  | 312       | 1             | 76              | *                                                 | salesforce.salesforcedx-vscode-services     |
| salesforce.salesforcedx-vscode-ui-preview           | true  | 136       | 1             | 37              | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-ui-preview   |
| salesforce.salesforcedx-vscode-visualforce          | true  | 5         | 2             | 0               | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-visualforce  |
| salesforce.sfdx-code-analyzer-vscode                | true  | 6         | 0             | 71              | workspaceContains:sfdx-project.json               | salesforce.sfdx-code-analyzer-vscode        |
| anysphere.cursor-always-local                       | false | 124       | 7             | 0               | onStartupFinished                                 | anysphere.cursor-always-local               |
| cursor.cursor-browser-automation                    | false | 5         | 0             | 1               | onStartupFinished                                 | cursor.cursor-browser-automation            |
| anysphere.cursor-commits                            | false | 60        | 0             | 0               | onStartupFinished                                 | anysphere.cursor-commits                    |
| anysphere.cursor-deeplink                           | false | 23        | 0             | 0               | onStartupFinished                                 | anysphere.cursor-deeplink                   |
| anysphere.cursor-mcp                                | false | 52        | 0             | 28              | onStartupFinished                                 | anysphere.cursor-mcp                        |
| anysphere.cursor-resolver                           | false | 82        | 1             | 0               | onStartupFinished                                 | anysphere.cursor-resolver                   |
| anysphere.cursor-retrieval                          | false | 101       | 1             | 10              | onStartupFinished                                 | anysphere.cursor-retrieval                  |
| anysphere.cursor-shadow-workspace                   | false | 30        | 0             | 0               | onStartupFinished                                 | anysphere.cursor-shadow-workspace           |
| anysphere.cursor-socket                             | false | 1         | 0             | 0               | onStartupFinished                                 | anysphere.cursor-socket                     |
| vscode.debug-auto-launch                            | false | 0         | 0             | 0               | onStartupFinished                                 | vscode.debug-auto-launch                    |
| vscode.emmet                                        | false | 8         | 4             | 0               | onLanguage                                        | vscode.emmet                                |
| vscode.extension-editing                            | false | 5         | 1             | 0               | onLanguage:markdown                               | vscode.extension-editing                    |
| vscode.github-authentication                        | false | 7         | 0             | 2               | onStartupFinished                                 | GitHub.vscode-pull-request-github           |
| vscode.markdown-language-features                   | false | 29        | 4             | 151             | onLanguage:markdown                               | vscode.markdown-language-features           |
| vscode.markdown-math                                | false | 3         | 0             | 0               | api                                               | vscode.markdown-language-features           |
| vscode.merge-conflict                               | false | 7         | 1             | 1               | onStartupFinished                                 | vscode.merge-conflict                       |
| dbaeumer.vscode-eslint                              | false | 11        | 3             | 0               | onStartupFinished                                 | dbaeumer.vscode-eslint                      |
| esbenp.prettier-vscode                              | false | 136       | 0             | 31              | onStartupFinished                                 | esbenp.prettier-vscode                      |
| GitHub.vscode-pull-request-github                   | false | 44        | 1             | 83              | onStartupFinished                                 | GitHub.vscode-pull-request-github           |
| salesforce.apex-language-server-extension           | false | 131       | 2             | 5               | onLanguage:apex                                   | salesforce.apex-language-server-extension   |
| Salesforce.salesforce-internal-dx                   | false | 20        | 0             | 15333           | onStartupFinished                                 | Salesforce.salesforce-internal-dx           |


### Run 2


| Extension                                           | Eager | Load Code | Call Activate | Finish Activate | Event                                             | By                                          |
| --------------------------------------------------- | ----- | --------- | ------------- | --------------- | ------------------------------------------------- | ------------------------------------------- |
| anysphere.cursor-agent-exec                         | true  | 132       | 3             | 24              | *                                                 | anysphere.cursor-agent-exec                 |
| anysphere.cursor-polyfills-remote                   | true  | 8         | 0             | 0               | *                                                 | anysphere.cursor-polyfills-remote           |
| vscode.git                                          | true  | 17        | 1             | 1568            | *                                                 | vscode.git                                  |
| vscode.git-base                                     | true  | 1         | 0             | 0               | *                                                 | vscode.git                                  |
| vscode.github                                       | true  | 7         | 1             | 1               | *                                                 | vscode.github                               |
| chuckjonas.apex-pmd                                 | true  | 1         | 1             | 0               | *                                                 | chuckjonas.apex-pmd                         |
| Salesforce.agent-script-language-client             | true  | 12        | 0             | 232             | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-einstein-gpt                | true  | 443       | 0             | 28              | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-einstein-gpt        |
| Salesforce.salesforcedx-vscode-agents               | true  | 159       | 1             | 5               | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex                 | true  | 190       | 0             | 1057            | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex-log             | true  | 67        | 8             | 15              | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex-oas             | true  | 287       | 0             | 196             | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-apex-oas     |
| salesforce.salesforcedx-vscode-apex-replay-debugger | true  | 206       | 0             | 18              | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex-testing         | true  | 170       | 8             | 58              | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-apex-testing |
| salesforce.salesforcedx-vscode-core                 | true  | 251       | 0             | 1355            | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-einstein-gpt        |
| salesforce.salesforcedx-vscode-lwc                  | true  | 214       | 0             | 615             | workspaceContains:**/lwc/**,**/workspace-user.xml | salesforce.salesforcedx-vscode-lwc          |
| salesforce.salesforcedx-vscode-metadata             | true  | 76        | 2             | 987             | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-metadata     |
| salesforce.salesforcedx-vscode-org                  | true  | 210       | 2             | 1062            | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-services             | true  | 305       | 1             | 64              | *                                                 | salesforce.salesforcedx-vscode-services     |
| salesforce.salesforcedx-vscode-ui-preview           | true  | 132       | 1             | 24              | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-ui-preview   |
| salesforce.salesforcedx-vscode-visualforce          | true  | 5         | 2             | 0               | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-visualforce  |
| salesforce.sfdx-code-analyzer-vscode                | true  | 6         | 0             | 16              | workspaceContains:sfdx-project.json               | salesforce.sfdx-code-analyzer-vscode        |
| anysphere.cursor-always-local                       | false | 123       | 6             | 0               | onStartupFinished                                 | anysphere.cursor-always-local               |
| cursor.cursor-browser-automation                    | false | 5         | 0             | 0               | onStartupFinished                                 | cursor.cursor-browser-automation            |
| anysphere.cursor-commits                            | false | 57        | 0             | 0               | onStartupFinished                                 | anysphere.cursor-commits                    |
| anysphere.cursor-deeplink                           | false | 23        | 0             | 0               | onStartupFinished                                 | anysphere.cursor-deeplink                   |
| anysphere.cursor-mcp                                | false | 53        | 0             | 27              | onStartupFinished                                 | anysphere.cursor-mcp                        |
| anysphere.cursor-resolver                           | false | 68        | 1             | 0               | onStartupFinished                                 | anysphere.cursor-resolver                   |
| anysphere.cursor-retrieval                          | false | 102       | 1             | 11              | onStartupFinished                                 | anysphere.cursor-retrieval                  |
| anysphere.cursor-shadow-workspace                   | false | 30        | 0             | 0               | onStartupFinished                                 | anysphere.cursor-shadow-workspace           |
| anysphere.cursor-socket                             | false | 1         | 0             | 0               | onStartupFinished                                 | anysphere.cursor-socket                     |
| vscode.debug-auto-launch                            | false | 1         | 0             | 0               | onStartupFinished                                 | vscode.debug-auto-launch                    |
| vscode.emmet                                        | false | 9         | 4             | 0               | onLanguage                                        | vscode.emmet                                |
| vscode.extension-editing                            | false | 5         | 1             | 0               | onLanguage:markdown                               | vscode.extension-editing                    |
| vscode.github-authentication                        | false | 7         | 1             | 1               | onStartupFinished                                 | GitHub.vscode-pull-request-github           |
| vscode.markdown-language-features                   | false | 33        | 4             | 156             | onLanguage:markdown                               | vscode.markdown-language-features           |
| vscode.markdown-math                                | false | 3         | 0             | 0               | api                                               | vscode.markdown-language-features           |
| vscode.merge-conflict                               | false | 6         | 1             | 1               | onStartupFinished                                 | vscode.merge-conflict                       |
| dbaeumer.vscode-eslint                              | false | 11        | 3             | 0               | onStartupFinished                                 | dbaeumer.vscode-eslint                      |
| esbenp.prettier-vscode                              | false | 126       | 0             | 14              | onStartupFinished                                 | esbenp.prettier-vscode                      |
| GitHub.vscode-pull-request-github                   | false | 43        | 0             | 72              | onStartupFinished                                 | GitHub.vscode-pull-request-github           |
| salesforce.apex-language-server-extension           | false | 134       | 2             | 7               | onLanguage:apex                                   | salesforce.apex-language-server-extension   |
| Salesforce.salesforce-internal-dx                   | false | 20        | 0             | 15578           | onStartupFinished                                 | Salesforce.salesforce-internal-dx           |


### Run 3


| Extension                                           | Eager | Load Code | Call Activate | Finish Activate | Event                                             | By                                          |
| --------------------------------------------------- | ----- | --------- | ------------- | --------------- | ------------------------------------------------- | ------------------------------------------- |
| anysphere.cursor-agent-exec                         | true  | 130       | 3             | 16              | *                                                 | anysphere.cursor-agent-exec                 |
| anysphere.cursor-polyfills-remote                   | true  | 8         | 0             | 0               | *                                                 | anysphere.cursor-polyfills-remote           |
| vscode.git                                          | true  | 19        | 1             | 1596            | *                                                 | vscode.git                                  |
| vscode.git-base                                     | true  | 1         | 0             | 0               | *                                                 | vscode.git                                  |
| vscode.github                                       | true  | 8         | 0             | 2               | *                                                 | vscode.github                               |
| chuckjonas.apex-pmd                                 | true  | 1         | 1             | 0               | *                                                 | chuckjonas.apex-pmd                         |
| Salesforce.agent-script-language-client             | true  | 13        | 0             | 137             | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-einstein-gpt                | true  | 444       | 0             | 64              | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-einstein-gpt        |
| Salesforce.salesforcedx-vscode-agents               | true  | 167       | 1             | 4               | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex                 | true  | 190       | 0             | 1110            | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex-log             | true  | 67        | 41            | 16              | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex-oas             | true  | 286       | 0             | 204             | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-apex-oas     |
| salesforce.salesforcedx-vscode-apex-replay-debugger | true  | 205       | 0             | 17              | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex-testing         | true  | 170       | 7             | 58              | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-apex-testing |
| salesforce.salesforcedx-vscode-core                 | true  | 253       | 0             | 1098            | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-einstein-gpt        |
| salesforce.salesforcedx-vscode-lwc                  | true  | 212       | 0             | 588             | workspaceContains:**/lwc/**,**/workspace-user.xml | salesforce.salesforcedx-vscode-lwc          |
| salesforce.salesforcedx-vscode-metadata             | true  | 83        | 1             | 2391            | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-metadata     |
| salesforce.salesforcedx-vscode-org                  | true  | 222       | 2             | 997             | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-services             | true  | 319       | 1             | 69              | *                                                 | salesforce.salesforcedx-vscode-services     |
| salesforce.salesforcedx-vscode-ui-preview           | true  | 134       | 1             | 25              | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-ui-preview   |
| salesforce.salesforcedx-vscode-visualforce          | true  | 5         | 1             | 0               | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-visualforce  |
| salesforce.sfdx-code-analyzer-vscode                | true  | 11        | 0             | 48              | workspaceContains:sfdx-project.json               | salesforce.sfdx-code-analyzer-vscode        |
| anysphere.cursor-always-local                       | false | 136       | 6             | 0               | onStartupFinished                                 | anysphere.cursor-always-local               |
| cursor.cursor-browser-automation                    | false | 5         | 0             | 0               | onStartupFinished                                 | cursor.cursor-browser-automation            |
| anysphere.cursor-commits                            | false | 61        | 0             | 0               | onStartupFinished                                 | anysphere.cursor-commits                    |
| anysphere.cursor-deeplink                           | false | 23        | 0             | 0               | onStartupFinished                                 | anysphere.cursor-deeplink                   |
| anysphere.cursor-mcp                                | false | 55        | 0             | 29              | onStartupFinished                                 | anysphere.cursor-mcp                        |
| anysphere.cursor-resolver                           | false | 66        | 1             | 0               | onStartupFinished                                 | anysphere.cursor-resolver                   |
| anysphere.cursor-retrieval                          | false | 110       | 0             | 60              | onStartupFinished                                 | anysphere.cursor-retrieval                  |
| anysphere.cursor-shadow-workspace                   | false | 30        | 0             | 0               | onStartupFinished                                 | anysphere.cursor-shadow-workspace           |
| anysphere.cursor-socket                             | false | 1         | 0             | 0               | onStartupFinished                                 | anysphere.cursor-socket                     |
| vscode.debug-auto-launch                            | false | 0         | 0             | 0               | onStartupFinished                                 | vscode.debug-auto-launch                    |
| vscode.emmet                                        | false | 8         | 4             | 0               | onLanguage                                        | vscode.emmet                                |
| vscode.extension-editing                            | false | 4         | 0             | 0               | onLanguage:markdown                               | vscode.extension-editing                    |
| vscode.github-authentication                        | false | 7         | 1             | 1               | onStartupFinished                                 | GitHub.vscode-pull-request-github           |
| vscode.markdown-language-features                   | false | 29        | 4             | 151             | onLanguage:markdown                               | vscode.markdown-language-features           |
| vscode.markdown-math                                | false | 3         | 0             | 0               | api                                               | vscode.markdown-language-features           |
| vscode.merge-conflict                               | false | 7         | 1             | 2               | onStartupFinished                                 | vscode.merge-conflict                       |
| dbaeumer.vscode-eslint                              | false | 11        | 4             | 0               | onStartupFinished                                 | dbaeumer.vscode-eslint                      |
| esbenp.prettier-vscode                              | false | 129       | 0             | 26              | onStartupFinished                                 | esbenp.prettier-vscode                      |
| GitHub.vscode-pull-request-github                   | false | 44        | 0             | 84              | onStartupFinished                                 | GitHub.vscode-pull-request-github           |
| salesforce.apex-language-server-extension           | false | 128       | 2             | 6               | onLanguage:apex                                   | salesforce.apex-language-server-extension   |
| Salesforce.salesforce-internal-dx                   | false | 21        | 0             | 15203           | onStartupFinished                                 | Salesforce.salesforce-internal-dx           |


