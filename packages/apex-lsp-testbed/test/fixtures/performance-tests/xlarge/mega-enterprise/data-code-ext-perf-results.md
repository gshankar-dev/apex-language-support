# Data Code Extension CLI Plugin: Startup Performance Test Results

**CLI plugin under test:** @salesforce/plugin-data-code-extension v0.1.0
**Install command:** sf plugins:install @salesforce/plugin-data-code-extension
**Test project:** mega-enterprise (~1,500 classes, ~89 triggers, namespace fsc, API v60.0)
**Platform:** macOS
**Context:** Plugin is being added to the AFV IDE image ahead of TDX; validating it does not negatively affect IDE performance.

Note: This is a CLI plugin, not a VS Code extension. It will not appear in Developer: Startup Performance output directly. The test measures whether its presence in the CLI affects VS Code extension activation times (since extensions like salesforcedx-vscode-core interact with the CLI during startup).

---

## Scenario A: Without CLI Plugin

Before each set of runs, confirm the plugin is not installed:
sf plugins:uninstall @salesforce/plugin-data-code-extension

### Run 1


| Extension                                           | Eager | Load Code | Call Activate | Finish Activate | Event                                             | By                                          |
| --------------------------------------------------- | ----- | --------- | ------------- | --------------- | ------------------------------------------------- | ------------------------------------------- |
| anysphere.cursor-agent-exec                         | true  | 132       | 3             | 16              | *                                                 | anysphere.cursor-agent-exec                 |
| anysphere.cursor-polyfills-remote                   | true  | 8         | 0             | 0               | *                                                 | anysphere.cursor-polyfills-remote           |
| vscode.git                                          | true  | 18        | 1             | 1417            | *                                                 | vscode.git                                  |
| vscode.git-base                                     | true  | 1         | 0             | 0               | *                                                 | vscode.git                                  |
| vscode.github                                       | true  | 8         | 0             | 2               | *                                                 | vscode.github                               |
| chuckjonas.apex-pmd                                 | true  | 2         | 1             | 0               | *                                                 | chuckjonas.apex-pmd                         |
| Salesforce.agent-script-language-client             | true  | 13        | 0             | 230             | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-einstein-gpt                | true  | 432       | 1             | 45              | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-einstein-gpt        |
| Salesforce.salesforcedx-vscode-agents               | true  | 322       | 1             | 4               | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex                 | true  | 194       | 0             | 1110            | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex-log             | true  | 68        | 8             | 16              | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex-oas             | true  | 298       | 0             | 385             | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-apex-oas     |
| salesforce.salesforcedx-vscode-apex-replay-debugger | true  | 211       | 1             | 28              | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex-testing         | true  | 170       | 8             | 39              | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-apex-testing |
| salesforce.salesforcedx-vscode-core                 | true  | 267       | 0             | 1142            | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-einstein-gpt        |
| salesforce.salesforcedx-vscode-lwc                  | true  | 219       | 0             | 647             | workspaceContains:**/lwc/**,**/workspace-user.xml | salesforce.salesforcedx-vscode-lwc          |
| salesforce.salesforcedx-vscode-metadata             | true  | 76        | 1             | 991             | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-metadata     |
| salesforce.salesforcedx-vscode-org                  | true  | 225       | 2             | 1973            | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-services             | true  | 317       | 1             | 68              | *                                                 | salesforce.salesforcedx-vscode-services     |
| salesforce.salesforcedx-vscode-ui-preview           | true  | 144       | 1             | 40              | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-ui-preview   |
| salesforce.salesforcedx-vscode-visualforce          | true  | 5         | 2             | 0               | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-visualforce  |
| salesforce.sfdx-code-analyzer-vscode                | true  | 7         | 0             | 31              | workspaceContains:sfdx-project.json               | salesforce.sfdx-code-analyzer-vscode        |
| anysphere.cursor-always-local                       | false | 126       | 7             | 0               | onStartupFinished                                 | anysphere.cursor-always-local               |
| cursor.cursor-browser-automation                    | false | 5         | 1             | 0               | onStartupFinished                                 | cursor.cursor-browser-automation            |
| anysphere.cursor-commits                            | false | 58        | 0             | 1               | onStartupFinished                                 | anysphere.cursor-commits                    |
| anysphere.cursor-deeplink                           | false | 24        | 0             | 0               | onStartupFinished                                 | anysphere.cursor-deeplink                   |
| anysphere.cursor-mcp                                | false | 52        | 0             | 30              | onStartupFinished                                 | anysphere.cursor-mcp                        |
| anysphere.cursor-resolver                           | false | 68        | 0             | 0               | onStartupFinished                                 | anysphere.cursor-resolver                   |
| anysphere.cursor-retrieval                          | false | 106       | 0             | 11              | onStartupFinished                                 | anysphere.cursor-retrieval                  |
| anysphere.cursor-shadow-workspace                   | false | 29        | 0             | 0               | onStartupFinished                                 | anysphere.cursor-shadow-workspace           |
| anysphere.cursor-socket                             | false | 1         | 0             | 0               | onStartupFinished                                 | anysphere.cursor-socket                     |
| vscode.debug-auto-launch                            | false | 1         | 0             | 0               | onStartupFinished                                 | vscode.debug-auto-launch                    |
| vscode.emmet                                        | false | 7         | 4             | 0               | onLanguage                                        | vscode.emmet                                |
| vscode.extension-editing                            | false | 6         | 0             | 0               | onLanguage:markdown                               | vscode.extension-editing                    |
| vscode.github-authentication                        | false | 7         | 0             | 2               | onStartupFinished                                 | GitHub.vscode-pull-request-github           |
| vscode.markdown-language-features                   | false | 30        | 3             | 164             | onLanguage:markdown                               | vscode.markdown-language-features           |
| vscode.markdown-math                                | false | 4         | 0             | 0               | api                                               | vscode.markdown-language-features           |
| vscode.merge-conflict                               | false | 6         | 1             | 2               | onStartupFinished                                 | vscode.merge-conflict                       |
| dbaeumer.vscode-eslint                              | false | 11        | 3             | 0               | onStartupFinished                                 | dbaeumer.vscode-eslint                      |
| esbenp.prettier-vscode                              | false | 122       | 0             | 23              | onStartupFinished                                 | esbenp.prettier-vscode                      |
| GitHub.vscode-pull-request-github                   | false | 40        | 0             | 73              | onStartupFinished                                 | GitHub.vscode-pull-request-github           |
| salesforce.apex-language-server-extension           | false | 128       | 2             | 5               | onLanguage:apex                                   | salesforce.apex-language-server-extension   |
| Salesforce.salesforce-internal-dx                   | false | 20        | 1             | 15213           | onStartupFinished                                 | Salesforce.salesforce-internal-dx           |


### Run 2


| Extension                                           | Eager | Load Code | Call Activate | Finish Activate | Event                                             | By                                          |
| --------------------------------------------------- | ----- | --------- | ------------- | --------------- | ------------------------------------------------- | ------------------------------------------- |
| anysphere.cursor-agent-exec                         | true  | 136       | 3             | 16              | *                                                 | anysphere.cursor-agent-exec                 |
| anysphere.cursor-polyfills-remote                   | true  | 8         | 0             | 0               | *                                                 | anysphere.cursor-polyfills-remote           |
| vscode.git                                          | true  | 19        | 1             | 1586            | *                                                 | vscode.git                                  |
| vscode.git-base                                     | true  | 1         | 0             | 0               | *                                                 | vscode.git                                  |
| vscode.github                                       | true  | 8         | 0             | 1               | *                                                 | vscode.github                               |
| chuckjonas.apex-pmd                                 | true  | 1         | 1             | 0               | *                                                 | chuckjonas.apex-pmd                         |
| Salesforce.agent-script-language-client             | true  | 12        | 0             | 247             | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-einstein-gpt                | true  | 425       | 0             | 48              | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-einstein-gpt        |
| Salesforce.salesforcedx-vscode-agents               | true  | 158       | 1             | 3               | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex                 | true  | 184       | 0             | 1007            | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex-log             | true  | 63        | 8             | 18              | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex-oas             | true  | 280       | 0             | 194             | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-apex-oas     |
| salesforce.salesforcedx-vscode-apex-replay-debugger | true  | 203       | 0             | 17              | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex-testing         | true  | 176       | 8             | 45              | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-apex-testing |
| salesforce.salesforcedx-vscode-core                 | true  | 252       | 0             | 1087            | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-einstein-gpt        |
| salesforce.salesforcedx-vscode-lwc                  | true  | 228       | 0             | 580             | workspaceContains:**/lwc/**,**/workspace-user.xml | salesforce.salesforcedx-vscode-lwc          |
| salesforce.salesforcedx-vscode-metadata             | true  | 77        | 1             | 1765            | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-metadata     |
| salesforce.salesforcedx-vscode-org                  | true  | 215       | 2             | 915             | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-services             | true  | 308       | 1             | 67              | *                                                 | salesforce.salesforcedx-vscode-services     |
| salesforce.salesforcedx-vscode-ui-preview           | true  | 129       | 1             | 10              | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-ui-preview   |
| salesforce.salesforcedx-vscode-visualforce          | true  | 5         | 2             | 0               | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-visualforce  |
| salesforce.sfdx-code-analyzer-vscode                | true  | 6         | 0             | 14              | workspaceContains:sfdx-project.json               | salesforce.sfdx-code-analyzer-vscode        |
| anysphere.cursor-always-local                       | false | 131       | 9             | 0               | onStartupFinished                                 | anysphere.cursor-always-local               |
| cursor.cursor-browser-automation                    | false | 5         | 0             | 0               | onStartupFinished                                 | cursor.cursor-browser-automation            |
| anysphere.cursor-commits                            | false | 58        | 0             | 0               | onStartupFinished                                 | anysphere.cursor-commits                    |
| anysphere.cursor-deeplink                           | false | 23        | 1             | 0               | onStartupFinished                                 | anysphere.cursor-deeplink                   |
| anysphere.cursor-mcp                                | false | 56        | 0             | 25              | onStartupFinished                                 | anysphere.cursor-mcp                        |
| anysphere.cursor-resolver                           | false | 75        | 0             | 0               | onStartupFinished                                 | anysphere.cursor-resolver                   |
| anysphere.cursor-retrieval                          | false | 105       | 1             | 13              | onStartupFinished                                 | anysphere.cursor-retrieval                  |
| anysphere.cursor-shadow-workspace                   | false | 28        | 0             | 0               | onStartupFinished                                 | anysphere.cursor-shadow-workspace           |
| anysphere.cursor-socket                             | false | 0         | 0             | 0               | onStartupFinished                                 | anysphere.cursor-socket                     |
| vscode.debug-auto-launch                            | false | 0         | 0             | 0               | onStartupFinished                                 | vscode.debug-auto-launch                    |
| vscode.emmet                                        | false | 8         | 5             | 0               | onLanguage                                        | vscode.emmet                                |
| vscode.extension-editing                            | false | 5         | 1             | 0               | onLanguage:markdown                               | vscode.extension-editing                    |
| vscode.github-authentication                        | false | 7         | 0             | 2               | onStartupFinished                                 | GitHub.vscode-pull-request-github           |
| vscode.markdown-language-features                   | false | 30        | 4             | 192             | onLanguage:markdown                               | vscode.markdown-language-features           |
| vscode.markdown-math                                | false | 3         | 0             | 0               | api                                               | vscode.markdown-language-features           |
| vscode.merge-conflict                               | false | 6         | 1             | 1               | onStartupFinished                                 | vscode.merge-conflict                       |
| vscode.npm                                          | false | 10        | 0             | 20              | onTerminalQuickFixRequest:ms-vscode.npm-command   | vscode.npm                                  |
| dbaeumer.vscode-eslint                              | false | 10        | 3             | 0               | onStartupFinished                                 | dbaeumer.vscode-eslint                      |
| esbenp.prettier-vscode                              | false | 125       | 0             | 28              | onStartupFinished                                 | esbenp.prettier-vscode                      |
| GitHub.vscode-pull-request-github                   | false | 40        | 0             | 50              | onStartupFinished                                 | GitHub.vscode-pull-request-github           |
| salesforce.apex-language-server-extension           | false | 130       | 2             | 6               | onLanguage:apex                                   | salesforce.apex-language-server-extension   |
| Salesforce.salesforce-internal-dx                   | false | 20        | 0             | 15370           | onStartupFinished                                 | Salesforce.salesforce-internal-dx           |


### Run 3


| Extension                                           | Eager | Load Code | Call Activate | Finish Activate | Event                                             | By                                          |
| --------------------------------------------------- | ----- | --------- | ------------- | --------------- | ------------------------------------------------- | ------------------------------------------- |
| anysphere.cursor-agent-exec                         | true  | 140       | 3             | 17              | *                                                 | anysphere.cursor-agent-exec                 |
| anysphere.cursor-polyfills-remote                   | true  | 8         | 0             | 0               | *                                                 | anysphere.cursor-polyfills-remote           |
| vscode.git                                          | true  | 19        | 1             | 1583            | *                                                 | vscode.git                                  |
| vscode.git-base                                     | true  | 1         | 0             | 0               | *                                                 | vscode.git                                  |
| vscode.github                                       | true  | 8         | 0             | 2               | *                                                 | vscode.github                               |
| chuckjonas.apex-pmd                                 | true  | 1         | 1             | 0               | *                                                 | chuckjonas.apex-pmd                         |
| Salesforce.agent-script-language-client             | true  | 12        | 0             | 197             | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-einstein-gpt                | true  | 419       | 1             | 28              | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-einstein-gpt        |
| Salesforce.salesforcedx-vscode-agents               | true  | 166       | 1             | 4               | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex                 | true  | 189       | 0             | 1170            | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex-log             | true  | 71        | 11            | 54              | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex-oas             | true  | 280       | 0             | 204             | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-apex-oas     |
| salesforce.salesforcedx-vscode-apex-replay-debugger | true  | 204       | 1             | 18              | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex-testing         | true  | 172       | 7             | 58              | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-apex-testing |
| salesforce.salesforcedx-vscode-core                 | true  | 244       | 1             | 1165            | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-einstein-gpt        |
| salesforce.salesforcedx-vscode-lwc                  | true  | 215       | 0             | 539             | workspaceContains:**/lwc/**,**/workspace-user.xml | salesforce.salesforcedx-vscode-lwc          |
| salesforce.salesforcedx-vscode-metadata             | true  | 84        | 1             | 1986            | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-metadata     |
| salesforce.salesforcedx-vscode-org                  | true  | 220       | 2             | 1122            | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-services             | true  | 310       | 1             | 77              | *                                                 | salesforce.salesforcedx-vscode-services     |
| salesforce.salesforcedx-vscode-ui-preview           | true  | 129       | 1             | 26              | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-ui-preview   |
| salesforce.salesforcedx-vscode-visualforce          | true  | 5         | 1             | 0               | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-visualforce  |
| salesforce.sfdx-code-analyzer-vscode                | true  | 10        | 1             | 12              | workspaceContains:sfdx-project.json               | salesforce.sfdx-code-analyzer-vscode        |
| anysphere.cursor-always-local                       | false | 129       | 6             | 0               | onStartupFinished                                 | anysphere.cursor-always-local               |
| cursor.cursor-browser-automation                    | false | 5         | 0             | 1               | onStartupFinished                                 | cursor.cursor-browser-automation            |
| anysphere.cursor-commits                            | false | 57        | 0             | 0               | onStartupFinished                                 | anysphere.cursor-commits                    |
| anysphere.cursor-deeplink                           | false | 24        | 0             | 0               | onStartupFinished                                 | anysphere.cursor-deeplink                   |
| anysphere.cursor-mcp                                | false | 52        | 0             | 25              | onStartupFinished                                 | anysphere.cursor-mcp                        |
| anysphere.cursor-resolver                           | false | 73        | 0             | 0               | onStartupFinished                                 | anysphere.cursor-resolver                   |
| anysphere.cursor-retrieval                          | false | 102       | 1             | 10              | onStartupFinished                                 | anysphere.cursor-retrieval                  |
| anysphere.cursor-shadow-workspace                   | false | 29        | 0             | 0               | onStartupFinished                                 | anysphere.cursor-shadow-workspace           |
| anysphere.cursor-socket                             | false | 1         | 0             | 0               | onStartupFinished                                 | anysphere.cursor-socket                     |
| vscode.debug-auto-launch                            | false | 0         | 0             | 1               | onStartupFinished                                 | vscode.debug-auto-launch                    |
| vscode.emmet                                        | false | 8         | 5             | 0               | onLanguage                                        | vscode.emmet                                |
| vscode.extension-editing                            | false | 4         | 0             | 0               | onLanguage:markdown                               | vscode.extension-editing                    |
| vscode.github-authentication                        | false | 7         | 1             | 1               | onStartupFinished                                 | GitHub.vscode-pull-request-github           |
| vscode.markdown-language-features                   | false | 29        | 4             | 150             | onLanguage:markdown                               | vscode.markdown-language-features           |
| vscode.markdown-math                                | false | 3         | 0             | 0               | api                                               | vscode.markdown-language-features           |
| vscode.merge-conflict                               | false | 7         | 0             | 2               | onStartupFinished                                 | vscode.merge-conflict                       |
| vscode.npm                                          | false | 10        | 0             | 28              | onTerminalQuickFixRequest:ms-vscode.npm-command   | vscode.npm                                  |
| dbaeumer.vscode-eslint                              | false | 14        | 3             | 0               | onStartupFinished                                 | dbaeumer.vscode-eslint                      |
| esbenp.prettier-vscode                              | false | 138       | 1             | 16              | onStartupFinished                                 | esbenp.prettier-vscode                      |
| GitHub.vscode-pull-request-github                   | false | 43        | 1             | 76              | onStartupFinished                                 | GitHub.vscode-pull-request-github           |
| salesforce.apex-language-server-extension           | false | 127       | 2             | 6               | onLanguage:apex                                   | salesforce.apex-language-server-extension   |
| Salesforce.salesforce-internal-dx                   | false | 20        | 0             | 15241           | onStartupFinished                                 | Salesforce.salesforce-internal-dx           |


---

## Scenario B: With CLI Plugin

Install before starting:
sf plugins:install @salesforce/plugin-data-code-extension
Installing plugin data-code-extension@latest... installed v0.1.0

### Run 1


| Extension                                           | Eager | Load Code | Call Activate | Finish Activate | Event                                             | By                                          |
| --------------------------------------------------- | ----- | --------- | ------------- | --------------- | ------------------------------------------------- | ------------------------------------------- |
| anysphere.cursor-agent-exec                         | true  | 125       | 3             | 25              | *                                                 | anysphere.cursor-agent-exec                 |
| anysphere.cursor-polyfills-remote                   | true  | 8         | 0             | 0               | *                                                 | anysphere.cursor-polyfills-remote           |
| vscode.git                                          | true  | 18        | 1             | 1293            | *                                                 | vscode.git                                  |
| vscode.git-base                                     | true  | 1         | 0             | 0               | *                                                 | vscode.git                                  |
| vscode.github                                       | true  | 8         | 0             | 1               | *                                                 | vscode.github                               |
| chuckjonas.apex-pmd                                 | true  | 1         | 1             | 0               | *                                                 | chuckjonas.apex-pmd                         |
| Salesforce.agent-script-language-client             | true  | 12        | 0             | 285             | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-einstein-gpt                | true  | 445       | 0             | 58              | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-einstein-gpt        |
| Salesforce.salesforcedx-vscode-agents               | true  | 169       | 1             | 3               | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex                 | true  | 190       | 0             | 1117            | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex-log             | true  | 65        | 7             | 17              | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex-oas             | true  | 290       | 0             | 227             | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-apex-oas     |
| salesforce.salesforcedx-vscode-apex-replay-debugger | true  | 199       | 0             | 32              | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex-testing         | true  | 161       | 7             | 41              | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-apex-testing |
| salesforce.salesforcedx-vscode-core                 | true  | 248       | 1             | 1339            | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-einstein-gpt        |
| salesforce.salesforcedx-vscode-lwc                  | true  | 205       | 0             | 564             | workspaceContains:**/lwc/**,**/workspace-user.xml | salesforce.salesforcedx-vscode-lwc          |
| salesforce.salesforcedx-vscode-metadata             | true  | 72        | 1             | 889             | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-metadata     |
| salesforce.salesforcedx-vscode-org                  | true  | 215       | 2             | 2138            | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-services             | true  | 306       | 1             | 68              | *                                                 | salesforce.salesforcedx-vscode-services     |
| salesforce.salesforcedx-vscode-ui-preview           | true  | 137       | 1             | 28              | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-ui-preview   |
| salesforce.salesforcedx-vscode-visualforce          | true  | 5         | 2             | 0               | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-visualforce  |
| salesforce.sfdx-code-analyzer-vscode                | true  | 5         | 0             | 54              | workspaceContains:sfdx-project.json               | salesforce.sfdx-code-analyzer-vscode        |
| anysphere.cursor-always-local                       | false | 121       | 6             | 0               | onStartupFinished                                 | anysphere.cursor-always-local               |
| cursor.cursor-browser-automation                    | false | 5         | 1             | 0               | onStartupFinished                                 | cursor.cursor-browser-automation            |
| anysphere.cursor-commits                            | false | 59        | 0             | 1               | onStartupFinished                                 | anysphere.cursor-commits                    |
| anysphere.cursor-deeplink                           | false | 24        | 0             | 0               | onStartupFinished                                 | anysphere.cursor-deeplink                   |
| anysphere.cursor-mcp                                | false | 54        | 0             | 29              | onStartupFinished                                 | anysphere.cursor-mcp                        |
| anysphere.cursor-resolver                           | false | 78        | 0             | 0               | onStartupFinished                                 | anysphere.cursor-resolver                   |
| anysphere.cursor-retrieval                          | false | 102       | 1             | 12              | onStartupFinished                                 | anysphere.cursor-retrieval                  |
| anysphere.cursor-shadow-workspace                   | false | 29        | 0             | 0               | onStartupFinished                                 | anysphere.cursor-shadow-workspace           |
| anysphere.cursor-socket                             | false | 1         | 0             | 0               | onStartupFinished                                 | anysphere.cursor-socket                     |
| vscode.debug-auto-launch                            | false | 1         | 0             | 0               | onStartupFinished                                 | vscode.debug-auto-launch                    |
| vscode.emmet                                        | false | 8         | 5             | 0               | onLanguage                                        | vscode.emmet                                |
| vscode.extension-editing                            | false | 5         | 0             | 0               | onLanguage:markdown                               | vscode.extension-editing                    |
| vscode.github-authentication                        | false | 7         | 1             | 1               | onStartupFinished                                 | GitHub.vscode-pull-request-github           |
| vscode.markdown-language-features                   | false | 32        | 3             | 112             | onLanguage:markdown                               | vscode.markdown-language-features           |
| vscode.markdown-math                                | false | 3         | 0             | 0               | api                                               | vscode.markdown-language-features           |
| vscode.merge-conflict                               | false | 6         | 1             | 1               | onStartupFinished                                 | vscode.merge-conflict                       |
| dbaeumer.vscode-eslint                              | false | 11        | 3             | 0               | onStartupFinished                                 | dbaeumer.vscode-eslint                      |
| esbenp.prettier-vscode                              | false | 136       | 0             | 26              | onStartupFinished                                 | esbenp.prettier-vscode                      |
| GitHub.vscode-pull-request-github                   | false | 44        | 0             | 75              | onStartupFinished                                 | GitHub.vscode-pull-request-github           |
| salesforce.apex-language-server-extension           | false | 128       | 2             | 6               | onLanguage:apex                                   | salesforce.apex-language-server-extension   |
| Salesforce.salesforce-internal-dx                   | false | 21        | 0             | 15222           | onStartupFinished                                 | Salesforce.salesforce-internal-dx           |


### Run 2


| Extension                                           | Eager | Load Code | Call Activate | Finish Activate | Event                                             | By                                          |
| --------------------------------------------------- | ----- | --------- | ------------- | --------------- | ------------------------------------------------- | ------------------------------------------- |
| anysphere.cursor-agent-exec                         | true  | 129       | 3             | 20              | *                                                 | anysphere.cursor-agent-exec                 |
| anysphere.cursor-polyfills-remote                   | true  | 8         | 0             | 0               | *                                                 | anysphere.cursor-polyfills-remote           |
| vscode.git                                          | true  | 18        | 2             | 1365            | *                                                 | vscode.git                                  |
| vscode.git-base                                     | true  | 1         | 0             | 0               | *                                                 | vscode.git                                  |
| vscode.github                                       | true  | 8         | 0             | 2               | *                                                 | vscode.github                               |
| chuckjonas.apex-pmd                                 | true  | 1         | 1             | 0               | *                                                 | chuckjonas.apex-pmd                         |
| Salesforce.agent-script-language-client             | true  | 13        | 0             | 237             | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-einstein-gpt                | true  | 417       | 0             | 28              | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-einstein-gpt        |
| Salesforce.salesforcedx-vscode-agents               | true  | 176       | 1             | 4               | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex                 | true  | 184       | 0             | 959             | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-apex         |
| salesforce.salesforcedx-vscode-apex-log             | true  | 60        | 8             | 15              | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex-oas             | true  | 279       | 0             | 210             | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-apex-oas     |
| salesforce.salesforcedx-vscode-apex-replay-debugger | true  | 204       | 1             | 16              | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex-testing         | true  | 174       | 8             | 58              | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-apex-testing |
| salesforce.salesforcedx-vscode-core                 | true  | 248       | 0             | 1478            | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-einstein-gpt        |
| salesforce.salesforcedx-vscode-lwc                  | true  | 223       | 0             | 634             | workspaceContains:**/lwc/**,**/workspace-user.xml | salesforce.salesforcedx-vscode-lwc          |
| salesforce.salesforcedx-vscode-metadata             | true  | 79        | 1             | 1294            | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-metadata     |
| salesforce.salesforcedx-vscode-org                  | true  | 211       | 2             | 2244            | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-services             | true  | 305       | 1             | 68              | *                                                 | salesforce.salesforcedx-vscode-services     |
| salesforce.salesforcedx-vscode-ui-preview           | true  | 130       | 1             | 18              | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-ui-preview   |
| salesforce.salesforcedx-vscode-visualforce          | true  | 5         | 2             | 0               | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-visualforce  |
| salesforce.sfdx-code-analyzer-vscode                | true  | 9         | 0             | 26              | workspaceContains:sfdx-project.json               | salesforce.sfdx-code-analyzer-vscode        |
| anysphere.cursor-always-local                       | false | 128       | 7             | 0               | onStartupFinished                                 | anysphere.cursor-always-local               |
| cursor.cursor-browser-automation                    | false | 6         | 1             | 0               | onStartupFinished                                 | cursor.cursor-browser-automation            |
| anysphere.cursor-commits                            | false | 55        | 0             | 0               | onStartupFinished                                 | anysphere.cursor-commits                    |
| anysphere.cursor-deeplink                           | false | 23        | 0             | 0               | onStartupFinished                                 | anysphere.cursor-deeplink                   |
| anysphere.cursor-mcp                                | false | 56        | 1             | 28              | onStartupFinished                                 | anysphere.cursor-mcp                        |
| anysphere.cursor-resolver                           | false | 74        | 0             | 0               | onStartupFinished                                 | anysphere.cursor-resolver                   |
| anysphere.cursor-retrieval                          | false | 101       | 1             | 12              | onStartupFinished                                 | anysphere.cursor-retrieval                  |
| anysphere.cursor-shadow-workspace                   | false | 29        | 0             | 0               | onStartupFinished                                 | anysphere.cursor-shadow-workspace           |
| anysphere.cursor-socket                             | false | 1         | 0             | 0               | onStartupFinished                                 | anysphere.cursor-socket                     |
| vscode.debug-auto-launch                            | false | 1         | 0             | 0               | onStartupFinished                                 | vscode.debug-auto-launch                    |
| vscode.emmet                                        | false | 8         | 5             | 0               | onLanguage                                        | vscode.emmet                                |
| vscode.extension-editing                            | false | 5         | 1             | 0               | onLanguage:markdown                               | vscode.extension-editing                    |
| vscode.github-authentication                        | false | 7         | 0             | 2               | onStartupFinished                                 | GitHub.vscode-pull-request-github           |
| vscode.markdown-language-features                   | false | 29        | 3             | 145             | onLanguage:markdown                               | vscode.markdown-language-features           |
| vscode.markdown-math                                | false | 3         | 0             | 0               | api                                               | vscode.markdown-language-features           |
| vscode.merge-conflict                               | false | 6         | 1             | 1               | onStartupFinished                                 | vscode.merge-conflict                       |
| dbaeumer.vscode-eslint                              | false | 11        | 3             | 0               | onStartupFinished                                 | dbaeumer.vscode-eslint                      |
| esbenp.prettier-vscode                              | false | 121       | 0             | 11              | onStartupFinished                                 | esbenp.prettier-vscode                      |
| GitHub.vscode-pull-request-github                   | false | 41        | 0             | 87              | onStartupFinished                                 | GitHub.vscode-pull-request-github           |
| salesforce.apex-language-server-extension           | false | 130       | 2             | 6               | onLanguage:apex                                   | salesforce.apex-language-server-extension   |
| Salesforce.salesforce-internal-dx                   | false | 20        | 0             | 15288           | onStartupFinished                                 | Salesforce.salesforce-internal-dx           |


### Run 3


| Extension                                           | Eager | Load Code | Call Activate | Finish Activate | Event                                             | By                                          |
| --------------------------------------------------- | ----- | --------- | ------------- | --------------- | ------------------------------------------------- | ------------------------------------------- |
| anysphere.cursor-agent-exec                         | true  | 132       | 2             | 27              | *                                                 | anysphere.cursor-agent-exec                 |
| anysphere.cursor-polyfills-remote                   | true  | 8         | 0             | 0               | *                                                 | anysphere.cursor-polyfills-remote           |
| vscode.git                                          | true  | 18        | 1             | 1565            | *                                                 | vscode.git                                  |
| vscode.git-base                                     | true  | 1         | 0             | 0               | *                                                 | vscode.git                                  |
| vscode.github                                       | true  | 9         | 0             | 1               | *                                                 | vscode.github                               |
| chuckjonas.apex-pmd                                 | true  | 1         | 0             | 0               | *                                                 | chuckjonas.apex-pmd                         |
| Salesforce.agent-script-language-client             | true  | 12        | 0             | 212             | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-einstein-gpt                | true  | 433       | 0             | 29              | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-einstein-gpt        |
| Salesforce.salesforcedx-vscode-agents               | true  | 167       | 1             | 3               | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex                 | true  | 198       | 0             | 1138            | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex-log             | true  | 67        | 42            | 16              | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex-oas             | true  | 282       | 0             | 202             | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-apex-oas     |
| salesforce.salesforcedx-vscode-apex-replay-debugger | true  | 201       | 0             | 17              | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-apex-testing         | true  | 170       | 8             | 54              | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-apex-testing |
| salesforce.salesforcedx-vscode-core                 | true  | 247       | 0             | 1185            | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-einstein-gpt        |
| salesforce.salesforcedx-vscode-lwc                  | true  | 219       | 0             | 610             | workspaceContains:**/lwc/**,**/workspace-user.xml | salesforce.salesforcedx-vscode-lwc          |
| salesforce.salesforcedx-vscode-metadata             | true  | 78        | 5             | 2153            | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-metadata     |
| salesforce.salesforcedx-vscode-org                  | true  | 217       | 2             | 1017            | workspaceContains:sfdx-project.json               | Salesforce.salesforcedx-vscode-agents       |
| salesforce.salesforcedx-vscode-services             | true  | 321       | 1             | 67              | *                                                 | salesforce.salesforcedx-vscode-services     |
| salesforce.salesforcedx-vscode-ui-preview           | true  | 136       | 1             | 26              | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-ui-preview   |
| salesforce.salesforcedx-vscode-visualforce          | true  | 5         | 2             | 0               | workspaceContains:sfdx-project.json               | salesforce.salesforcedx-vscode-visualforce  |
| salesforce.sfdx-code-analyzer-vscode                | true  | 6         | 0             | 14              | workspaceContains:sfdx-project.json               | salesforce.sfdx-code-analyzer-vscode        |
| anysphere.cursor-always-local                       | false | 125       | 7             | 0               | onStartupFinished                                 | anysphere.cursor-always-local               |
| cursor.cursor-browser-automation                    | false | 5         | 0             | 1               | onStartupFinished                                 | cursor.cursor-browser-automation            |
| anysphere.cursor-commits                            | false | 56        | 0             | 1               | onStartupFinished                                 | anysphere.cursor-commits                    |
| anysphere.cursor-deeplink                           | false | 23        | 0             | 0               | onStartupFinished                                 | anysphere.cursor-deeplink                   |
| anysphere.cursor-mcp                                | false | 51        | 0             | 25              | onStartupFinished                                 | anysphere.cursor-mcp                        |
| anysphere.cursor-resolver                           | false | 71        | 1             | 0               | onStartupFinished                                 | anysphere.cursor-resolver                   |
| anysphere.cursor-retrieval                          | false | 108       | 1             | 10              | onStartupFinished                                 | anysphere.cursor-retrieval                  |
| anysphere.cursor-shadow-workspace                   | false | 28        | 0             | 0               | onStartupFinished                                 | anysphere.cursor-shadow-workspace           |
| anysphere.cursor-socket                             | false | 1         | 0             | 0               | onStartupFinished                                 | anysphere.cursor-socket                     |
| vscode.debug-auto-launch                            | false | 1         | 0             | 0               | onStartupFinished                                 | vscode.debug-auto-launch                    |
| vscode.emmet                                        | false | 8         | 4             | 0               | onLanguage                                        | vscode.emmet                                |
| vscode.extension-editing                            | false | 5         | 0             | 0               | onLanguage:markdown                               | vscode.extension-editing                    |
| vscode.github-authentication                        | false | 7         | 1             | 1               | onStartupFinished                                 | GitHub.vscode-pull-request-github           |
| vscode.markdown-language-features                   | false | 29        | 11            | 159             | onLanguage:markdown                               | vscode.markdown-language-features           |
| vscode.markdown-math                                | false | 2         | 0             | 0               | api                                               | vscode.markdown-language-features           |
| vscode.merge-conflict                               | false | 6         | 1             | 1               | onStartupFinished                                 | vscode.merge-conflict                       |
| dbaeumer.vscode-eslint                              | false | 11        | 3             | 0               | onStartupFinished                                 | dbaeumer.vscode-eslint                      |
| esbenp.prettier-vscode                              | false | 133       | 0             | 15              | onStartupFinished                                 | esbenp.prettier-vscode                      |
| GitHub.vscode-pull-request-github                   | false | 42        | 1             | 55              | onStartupFinished                                 | GitHub.vscode-pull-request-github           |
| salesforce.apex-language-server-extension           | false | 127       | 2             | 5               | onLanguage:apex                                   | salesforce.apex-language-server-extension   |
| Salesforce.salesforce-internal-dx                   | false | 20        | 0             | 15224           | onStartupFinished                                 | Salesforce.salesforce-internal-dx           |

