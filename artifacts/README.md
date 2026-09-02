# DeepSWE × DeepSeek V4 Pro 验证数据（verification evidence）

本目录归集**已完整跑完**的 DeepSWE 任务评测产物，用于在 GitHub 上验证 DeepSeek 模型（`deepseek-official/deepseek-v4-pro` 与 `deepseek-official/deepseek-v4-flash-vision-exp`）灰测模型的 DeepSWE 测试得分。所有文件均为原始产物镜像，未做任何内容修改（路径、ID、时间戳保留原样），可用 `MANIFEST.sha256` 逐文件校验。

> **评测窗口说明**：2026-08-21 的第一轮灰测窗口内完成 2 题有效评测（#13、#16，V4 Pro）；2026-08-31 灰测重启（双模型：flash-vision-exp 与 pro，需 PTC 模式触发），当日完成第 3 题有效评测（#83，flash-vision-exp）。通道有效性判定口径详见 `DEEPSWE_TEST_ARCHIVE.md`。

## 113 题任务总表

[`tasks.csv`](tasks.csv) 以**数据集里的每一题为一行**（共 113 行，编号与 `TASK_CATALOG.md` 一致），跟踪每题的评测状态：
状态、reward、运行次数、最近运行时间、Token 总量、峰时费用、测试通过数、备注、是否入证据包。

当前进度：

| 指标 | 值 |
|---|---|
| 数据集总题数 | 113（TypeScript 35 · Go 34 · Python 34 · JavaScript 5 · Rust 5） |
| 已完成评测 | 71 题（前 55 题 + #68 `obsidian-linter-link-format-conversion` + 15 个后续灰测/Pro 结果） |
| **通过（reward 1.0）** | **51 题** |
| 未通过（跑完判错） | 20 题 |
| 未运行 | 42 题 |

状态取值：`未运行` / `进行中` / `通过` / `未通过`（跑完但判错）。
**只记录跑完的评测轮**：中途退出、中断、环境/构建失败的尝试不计数、不记录。
每题得出正式结果后更新对应行；"跑完但被判错"的题也按规则收进 `tasks\` 并标记。

## 已完成任务一览

| # | 任务 | Trial | Reward | 回归/专项测试 | Runtime | Token 总量 | 峰时费用 |
|---|---|---|---|---|---|---|---|
| 1 | `bandit-structured-nosec-directives` | `bandit-structured-nosec-directiv__MXYnhjB` | **1.0** | 324/324 · 78/78 | 40m46s | 20,103,690 | ≈ $1.57 |
| 2 | `clack-async-autocomplete-options` | `clack-async-autocomplete-options__BLQCUNM` | 0.0 | 新测试 2/25 未过 | 42m58s | 13,475,510 | ≈ $1.24 |
| 3 | `python-statemachine-state-data-scoping` | `python-statemachine-state-data-s__ujE4Hhm` | **1.0** | 1407 基线零回归 · 72/72 新测试 | 91m29s | 8,538,168 | 待定（flash 定价未公布；谷时运行） |
| 4 | `vulture-persistent-analysis-cache` | `vulture-persistent-analysis-cach__iAVtBGi` | **1.0** | 298 基线零回归 · 24/24 新测试 | 61m（自然完成） | 2,761,774 | 待定（谷时运行，价目未确认） |
| 5 | `meriyah-explicit-resource-declarations` | `meriyah-explicit-resource-declar__mhZYBoq` | 0.0 | 基线 94,644 零回归 · 新测试 1/66 未过 | 85m（自然完成） | 6,720,018 | 待定（谷时运行，价目未确认） |
| 6 | `gql-incremental-graphql-delivery` | `gql-incremental-graphql-delivery__aQ6hCKT` | **1.0** | 870 基线零回归 · 18/18 新测试 | ~90m（超时收敛后判过） | 14,928,554 | 待定（谷时运行，价目未确认） |
| 7 | `oxvg-structural-selector-preservation` | `oxvg-structural-selector-preserv__bZSaear` | 0.0 | 新测试 8/10 | 90m（超时收敛） | 7,362,540* | 待定（谷时运行，价目未确认） |
| 8 | `sqlfmt-create-table-ddl-formatting` | `sqlfmt-create-table-ddl-formatti__7eoBuBu` | **1.0** | 基线零回归 · 79/79 新测试 | 90m（超时收敛后判过） | 6,767,281* | 待定（谷时运行，价目未确认） |
| 9 | `opa-rego-rule-profiling` | `opa-rego-rule-profiling__4veCq9G` | **1.0** | 基线零回归 · 新测试全过 | ~102m（自然完成） | 2,938,260 | 待定（谷时运行，价目未确认） |
| 10 | `testem-bail-on-test-failure` | `testem-bail-on-test-failure__fjx9c2F` | **1.0** | 基线零回归 · 新测试全过 | ~121m（自然完成） | 5,709,658 | 待定（谷时运行，价目未确认） |
| 11 | `pest-character-class-coalescing` | `pest-character-class-coalescing__dijXkUZ` | **1.0** | 基线零回归 · 104/104 新测试 | 120m（超时收敛后判过） | 4,028,541* | 待定（谷时运行，价目未确认） |
| 12 | `igel-persist-feature-schema` | `igel-persist-feature-schema__Z3cU4Fv` | 0.0 | 新测试 6/24 | 120m（超时收敛） | 3,821,675 | 待定（谷时运行，价目未确认） |
| 13 | `koota-pair-relation-tracking` | `koota-pair-relation-tracking__teyz2aj` | **1.0** | 基线零回归 · 38/38 新测试 | 120m（超时收敛后判过） | 7,444,481* | 待定（谷时运行，价目未确认） |
| 14 | `onedump-dump-encryption-pipeline` | `onedump-dump-encryption-pip__nssq5bj` | 0.0 | 新测试包编译失败 | 55m（自然收工） | 2,024,716 | 待定（谷时运行，价目未确认） |
| 15 | `eicrud-keyset-pagination-cursor` | `eicrud-keyset-pagination-cursor__kjszwkn` | 0.0 | 基线 234 零回归 · 新测试执行失败 | ~112m（自然收工） | 9,173,087 | 待定（谷时运行，价目未确认） |
| 16 | `textual-kitty-key-phases` | `textual-kitty-key-phases__…` | **1.0** | 基线零回归 · 23/23 新测试 | ~56m（自然收工） | 7,925,841 | 待定（谷时运行，价目未确认） |
| 17 | `helm-array-merge-strategies` | `helm-array-merge-strategies__pjqvm9m` | **1.0** | 全部测试通过 | ~78m（自然收工） | 8,790,449 | 待定（谷时运行，价目未确认） |
| 18 | `kombu-virtual-queue-dead-lettering` | `kombu-virtual-queue-dead-letteri__effkfnb` | **1.0** | 1453 基线零回归 · 78/78 新测试 | ~42m（自然完赛，重试） | 7,032,348 | 待定（谷时运行，价目未确认） |
| 19 | `aiomonitor-task-snapshots-diff` | `aiomonitor-task-snapshots-diff__wrpce47` | **1.0** | 全部测试通过 | 22m（快速自然完赛） | 9,188,941 | 待定（谷时运行，价目未确认） |
| 20 | `superjson-error-stack-serialization` | `superjson-error-stack-serializat__bfqpwzh` | 0.0 | 新测试 114/116 | ~32m（自然收工） | 2,538,638 | 待定（谷时运行，价目未确认） |
| 21 | `fastapi-deprecation-response-headers` | `fastapi-deprecation-response-hea__32zu6m4` | **1.0** | 3174 基线零回归 · 137/137 新测试 | ~40m（自然收工） | 3,288,727 | 待定（谷时运行，价目未确认） |
| 22 | `obsidian-linter-auto-table-of-contents` | `obsidian-linter-auto-table-of-co__6gqc24y` | 0.0 | 1202 基线零回归 · 37/41 新测试 | ~45m（自然收工，重试） | 4,247,163 | 待定（谷时运行，价目未确认） |
| 23 | `happy-dom-deterministic-intersectionobserver` | `happy-dom-deterministic-intersec__a4rmvw2` | 0.0 | 新测试 14/15 | ~48m（自然收工） | 3,671,732 | 待定（谷时运行，价目未确认） |
| 24 | `pwntools-tube-multiplexing` | `pwntools-tube-multiplexing__f536yjn` | **1.0** | 73/73 新测试 | ~80m（自然收工） | 5,434,621 | 待定（谷时运行，价目未确认） |
| 25 | `cliffy-config-file-parsing` | `cliffy-config-file-parsing__9khib2t` | **1.0** | 全部测试通过（459+37） | ~36m（自然收工） | 5,631,966 | 待定（谷时运行，价目未确认） |
| 26 | `termenv-preserve-ansi-resets` | `termenv-preserve-ansi-resets__…` | 0.0 | 新测试套件 FAIL | ~37m（自然收工） | 1,689,801 | 待定（谷时运行，价目未确认） |
| 27 | `koota-composite-trait-aspects` | `koota-composite-trait-aspects__…` | 0.0 | 新测试 49/51 | ~75m（自然收工） | 22,119,043 | 待定（谷时运行，价目未确认） |
| 28 | `expr-try-catch-errors` | `expr-try-catch-errors__mab7dem` | **1.0** | 全部测试通过 | ~65m（自然收工） | 14,429,790 | 待定（谷时运行，价目未确认） |
| 29 | `etree-xml-diff-patch` | `etree-xml-diff-patch__…` | **1.0** | 全部测试通过 | ~55m（自然收工） | 3,260,751 | 待定（谷时运行，价目未确认） |
| 30 | `bandit-interprocedural-taint-checks` | `bandit-interprocedural-taint__…` | **1.0** | 全套 322 过 · 新测试 85 过 | ~38m（自然收工） | 4,002,705 | 待定（谷时运行，价目未确认） |
| 31 | `dasel-html-document-format` | `dasel-html-document-format__…` | **1.0** | 全部测试通过 | ~42m（自然收工） | 2,366,071 | 待定（谷时运行，价目未确认） |
| 32 | `numba-stencil-boundary-modes` | `numba…` | **1.0** | 824 基线零回归 · 32/32 新测试 | 自然收工 | 6,335,877 | 待定（谷时运行，价目未确认） |
| 33 | `psd-tools-blend-range-api` | `psd-tools…` | **1.0** | 全部测试通过 | 自然收工 | 5,446,596 | 待定（谷时运行，价目未确认） |
| 34 | `arktype-json-schema-refs-dependencies` | `arktype…` | **1.0** | 全部测试通过 | 自然收工 | 8,886,077 | 待定（谷时运行，价目未确认） |
| 35 | `pebble-durability-wait-apis` | `pebble…` | **1.0** | 全部测试通过 | 自然收工 | 4,737,462 | 待定（谷时运行，价目未确认） |
| 36 | `task-task-graph-export` | `task-task…` | **1.0** | 基线与新测试全过 | 自然收工 | 5,121,907 | 待定（谷时运行，价目未确认） |
| 37 | `csstree-shorthand-expansion-compression` | `csstree…` | 0.0 | 基线零回归 · 新测试 exit 5（隐藏边角未覆盖，agent 本地 16897 全过） | 自然收工 | 4,027,289 | 待定（谷时运行，价目未确认） |
| 38 | `kea-atomic-signal-selectors` | `kea-atomic-signal-selectors__XqFX3Nt` | 0.0 | 新功能 14/14 过 · 基线回归挂 1（listeners·breakpoints，155/156） | 60m（自然收工） | 6,515,418 | 待定（谷时运行，价目未确认） |
| 39 | `dynamodb-toolbox-lazy-recursive-schemas` | `dynamodb-toolbox-lazy-recursive__2XhyBaj` | **1.0** | 基线 1334 零回归 · 37/37 新测试 | 72m（自然收工） | 18,757,252 | 待定（谷时运行，价目未确认） |
| 40 | `scc-bounded-memory-spilling` | `scc-bounded-memory-spilling__yDMhhso` | **1.0** | 基线与新测试双绿（exit 0/0） | 45m（自然收工） | 6,634,096 | 待定（谷时运行，价目未确认） |
| 41 | `tengo-destructuring-bindings` | `tengo-destructuring-bindings__gvhkshs` | **1.0** | 基线与新测试双绿（exit 0/0） | 45m（自然收工） | 8,265,190 | 待定（谷时运行，价目未确认） |
| 42 | `tengo-callable-instance-isolation` | `tengo-callable-instance-isolatio__M2Uebd7` | **1.0** | 基线与新测试双绿（exit 0/0） | 48m（自然收工） | 6,410,130 | 待定（谷时运行，价目未确认） |
| 43 | `httpx-multipart-response-parsing` | `httpx-multipart-response-parsing__U2aPqJk` | 0.0 | 基线 1348 零回归 · 新测试 121/122（header folding tab 归一化边角） | 29m（自然收工） | 3,192,061 | 待定（谷时运行，价目未确认） |
| 44 | `participle-grammar-conflict-analysis` | `participle-grammar-conflict-anal__xooCB8u` | **1.0** | 基线与新测试双绿（exit 0/0） | 37m（自然收工） | 2,966,156 | 待定（谷时运行，价目未确认） |
| 45 | `abs-module-cache-flags` | `abs-module-cache-flags__aZjWQts` | **1.0** | 基线与新测试双绿（exit 0/0） | 38m（自然收工） | 5,131,542 | 待定（谷时运行，价目未确认） |
| 46 | `valibot-recursive-schema-composition` | `valibot-recursive-schema-composi__Vi57Zxq` | **1.0** | 基线 208 零回归 · 新测试 9/9 | 95m（自然收工） | 16,614,710 | 待定（谷时运行，价目未确认） |
| 47 | `helm-unified-manifest-stream` | `helm-unified-manifest-stream__mnk7JA4` | **1.0** | 基线与新测试双绿（exit 0/0） | 53m（自然收工） | 7,059,876 | 待定（谷时运行，价目未确认） |
| 48 | `claude-code-by-agents-recursive-delegation` | `claude-code-by-agents-recursive__cBgvbhm` | 0.0 | 基线 44 全过 · 新测试 2/7（递归委派核心路径未生效） | 36m（自然收工） | 2,615,571 | 待定（谷时运行，价目未确认） |
| 49 | `koota-query-predicates` | `koota-query-predicates__Btkk2nL` | **1.0** | 基线 173 零回归 · 新测试 43/43 | 55m（自然收工） | 9,765,321 | 待定（谷时运行，价目未确认） |
| 50 | `textual-richlog-follow-state` | `textual-richlog-follow-state__oL4tAPp` | **1.0** | 基线 13 零回归 · 新测试 24/24 | 71m（自然收工） | 9,310,230 | 待定（谷时运行，价目未确认） |
| 51 | `bandit-incremental-cache-control` | `bandit-incremental-cache-control__tGHVneX` | **1.0** | 基线 341 零回归 · 新测试 89/89 | 39m（自然收工） | 17,084,675 | 待定（谷时运行，价目未确认） |
| 52 | `ts-pattern-match-each` | `ts-pattern-match-each__N9PiSKh` | **1.0** | 基线 6 零回归 · 新测试 85/85 | 23m（自然收工） | 4,671,786 | 待定（谷时运行，价目未确认） |
| 53 | `effect-sse-httpapi-streaming` | `effect-sse-httpapi-streaming__eVgagsp` | **1.0** | 基线 70 零回归 · 新测试 47/47 | 77m（自然收工，早退后重试） | 35,096,129 | 待定（谷时运行，价目未确认） |
| 54 | `updo-policy-alerting` | `updo-policy-alerting__e8xp7PX` | 0.0 | 基线零回归 · 新测试 notifications 构建失败 | 28m（自然收工） | 6,246,014 | 待定（谷时运行，价目未确认） |
| 55 | `awilix-async-container-initialization` | `awilix-async-container-initializ__q5sj4QH` | **1.0** | 基线 190 零回归 · 新测试 24/24 | 42m（自然收工） | 13,838,080 | 待定（谷时运行，价目未确认） |
| 56 | `obsidian-linter-link-format-conversion` | `obsidian-linter-link-format-conv__x6RaJQ5` | 0.0 | 基线 1186 零回归 · 新测试 59/60（link-style边角） | 27m（自然收工） | 9,086,735 | 待定（谷时运行，价目未确认） |
| 57 | `query-persist-restored-query-state` | `query-persist-restored-query-sta__Cx4rbq4` | **1.0** | 基线与新测试双绿 · 新测试全过 | 35m（自然收工） | 1,023,138 | 待定（Flash-Vision/high；谷时运行） |
| 58 | `ipython-session-bundle-replay` | `ipython-session-bundle-replay__RS5mqbD` | **1.0** | 基线 29 通过 · 新测试 17/17 | 41m（自然收工） | 135,920 | 待定（Flash-Vision/high；谷时运行） |
| 59 | `skrub-duration-encoding` | `skrub-duration-encoding__vgyXpAj` | **1.0** | 原始 baseline 2377/2474 通过（97 项为 pristine HEAD 已存在的环境兼容失败） · 新测试 130/130 | 50m（自然收工） | 1,134,105 | 待定（Flash-Vision/high；谷时运行） |
| 60 | `kgateway-consistent-hash-policy` | `kgateway-consistent-hash-policy__RLsQUf3` | **1.0** | 基线通过 · `TestConsistentHash` 专项测试通过 | 46m（自然收工） | 1,363,960* | 待定（Flash-Vision/high；谷时运行） |
| 61 | `ink-grid-box-layout` | `ink-grid-box-layout__NxGFR8m` | **1.0** | Pro/max 最终轮：基线与新测试双绿（exit 0/0） | 79.8m（90 次调用） | 7,608,675 | 待定（Pro/max 灰测；谷时运行） |
| 62 | `boa-hierarchical-evaluation-cancellation` | `boa-hierarchical-evaluation-canc__q9WRXau` | **1.0** | 修复 verifier 工具链后重放：基线 7/7 · 新测试 17/17 | — | 12,067,942 | 待定（Pro/max 灰测；谷时运行） |
| 63 | `go-critic-doc-link-checker` | `go-critic-doc-link-checker__sb9kTr8` | 0.0 | 基线通过 · 官方新测试 exit 1；与 Flash 结果同败 | — | 4,694,804 | 待定（Pro/max 灰测；谷时运行） |
| 64 | `goreleaser-retry-publish-auditing` | `goreleaser-retry-publish-auditin__zMfrrQp` | **1.0** | 基线与新测试双绿 | 53.8m（100 次调用） | 8,143,854 | 待定（Pro/max 灰测；谷时运行） |
| 65 | `httpx-streaming-json-iteration` | `httpx-streaming-json-iteration__oLdKwtA` | 0.0 | 基线通过 · 新测试 107/108；唯一失败与 Flash 重试相同 | 25.8m（48 次调用） | 2,052,335 | 待定（Pro/max 灰测；谷时运行） |
| 66 | `kysely-window-grouping-helpers` | `kysely-window-grouping-helpers__cqxf8R8` | 0.0 | 基线通过 · 新测试编译失败，6 处 TS2578（类型签名过宽） | — | 9,308,870 | 待定（Pro/max 灰测；谷时运行） |
| 67 | `narwhals-rolling-window-suite` | `narwhals-rolling-window-suite__rBEfYN7` | **1.0** | Pro/max 新测试全过；6 项 baseline 失败在 pristine HEAD 同样出现，按环境口径归一化 | — | 18,194,761 | 待定（Pro/max 灰测；谷时运行） |
| 68 | `optique-conditional-option-dependencies` | `optique-conditional-option-depen__feMkWrc` | **1.0** | 基线与新测试双绿 | 50.5m（113 次调用） | 12,598,706 | 待定（Pro/max 灰测；谷时运行） |
| 69 | `prometheus-typed-label-sorting` | `prometheus-typed-label-sorting__nPTD9mH` | **1.0** | 基线与新测试双绿 | 37.6m（44 次调用） | 1,940,038 | 待定（Pro/max 灰测；谷时运行） |
| 70 | `wasmi-trap-coredumps` | `wasmi-trap-coredumps__ixY4NfJ` | **1.0** | 基线与新测试双绿（含 host-error coredump 用例） | 54.6m（96 次调用） | 11,642,400 | 待定（Pro/max 灰测；谷时运行） |
| 71 | `fd-deterministic-multi-key-sorting` | — | **1.0** | 基线与专项新测试双绿；9 月 1 日报告快照回填，未重复运行 | — | — | 历史结果，灰测报告快照 |

### 第 3 条结果详情（2026-08-31，通过，PTC 模式）

- Trial：`python-statemachine-state-data-s__ujE4Hhm`；agent execution 21:20:56–22:52:25（91m29s，触及 5400s agent 超时后优雅收敛），verifier 40s
- 模型：`deepseek-official/deepseek-v4-flash-vision-exp`，reasoning effort `high`，**PTC 模式**（`tools_mode=code`，模型经 Code Mode 写程序执行）——本轮灰测的触发条件
- 传输通道：flash 灰测通道 `session-fed63608-…a473`（另一台电脑创建、同 API key）；运行中经思维链指纹确认灰测路由有效（`I'm`×31 @22.3K 字符）
- Token（去重，76 条 usage）：未缓存输入 221,472 · cache read 8,263,040 · cache write 0 · 输出 53,656（含 reasoning 15,361），合计 **8,538,168**
- 费用：运行于谷时窗口（21:20–22:52 UTC+8），flash-vision-exp 定价未公布，费用待定
- 结果：reward **1.0**——基线测试 1407 通过/143 跳过/44 xfailed（零回归），新增测试 72/72 全过
- 注：agent 超时由外部按评测协议强制（SIGTERM 优雅退出，session 完整导出），pier 记录 `NonZeroAgentExitCodeError`，不影响已完成的验证与 reward
- DSH 本地 Session：`session-17b88615-369d-4c08-9894-8c4fd31f983b`

### 第 4 条结果详情（2026-08-31，通过，pro 灰测）

- Trial：`vulture-persistent-analysis-cach__iAVtBGi`；agent 61 分钟自然完成（未触超时），verifier 22:36 发车、23:37:45 收官
- 模型：`deepseek-official/deepseek-v4-pro`，reasoning effort `max`，**PTC 模式**（watchdog 确认实际模型与档位，全程无 mismatch）
- 传输通道：pro 灰测通道 `session-6166250c-…11bc`（其他电脑创建、同 API key）
- Token（去重，52 条 usage）：未缓存输入 118,735 · cache read 2,598,144 · cache write 0 · 输出 44,895（含 reasoning 18,746），合计 **2,761,774**
- 费用：谷时窗口运行，价目未确认，待定
- 结果：reward **1.0**——基线测试 298 通过（零回归），新增测试 24/24 全过

### 第 5 条结果详情（2026-08-31，跑完判错，pro 灰测）

- Trial：`meriyah-explicit-resource-declar__mhZYBoq`；agent 85 分钟自然完成（未触超时），23:42:48 收官
- 模型：`deepseek-official/deepseek-v4-pro`，reasoning effort `max`，**PTC 模式**（watchdog 全程无 mismatch）
- 传输通道：pro 灰测通道 `session-8fe028d0-…73e71`（其他电脑创建、同 API key）
- Token（去重，87 条 usage）：未缓存输入 319,391 · cache read 6,361,536 · cache write 0 · 输出 39,091，合计 **6,720,018**
- 费用：谷时窗口运行，价目未确认，待定
- 判错原因：基线 94,644 项全过（零回归），但新增测试 `test/parser/declarations/using.ts` 66 项中 1 项失败（explicit resource `using` 声明解析的边角场景）

### 第 6 条结果详情（2026-09-01，通过，pro 灰测）

- Trial：`gql-incremental-graphql-delivery__aQ6hCKT`；agent 22:34 发车、00:03:36 收官（~90 分钟，触超时收敛后验证判过）
- 模型：`deepseek-official/deepseek-v4-pro`，reasoning effort `max`，**PTC 模式**
- 传输通道：pro 灰测通道 `session-d058bf1a-…b144`（其他电脑创建、同 API key）
- Token（去重，134 条 usage）：未缓存输入 713,298 · cache read 14,138,624 · cache write 0 · 输出 76,632（含 reasoning 18,286），合计 **14,928,554**
- 费用：谷时窗口运行，价目未确认，待定
- 结果：reward **1.0**——基线 870 通过/30 跳过（零回归），新增测试 18/18 全过

### 第 7 条结果详情（2026-09-01，跑完判错，pro 灰测）

- Trial：`oxvg-structural-selector-preserv__bZSaear`；agent 22:41 发车、00:15:11 收官（90 分钟超时收敛）
- 模型：`deepseek-official/deepseek-v4-pro`，reasoning effort `max`，**PTC 模式**
- 传输通道：pro 灰测通道 `session-660f6500-…a489`
- Token：**7,362,540（守卫观测值）**——超时杀进程恰逢上游 524 卡死，容器 cleanup 未能导出 DSH session，无法做去重核算
- 费用：谷时窗口运行，价目未确认，待定
- 判错原因：新增测试 10 项中 2 项失败（`remove_empty_containers_preserves_empty_group_*` 空容器保留场景），8/10 通过

> **异常早退说明（2026-09-01 03:00 处理）**：obsidian（33 分钟）与 kombu（20 分钟）两次运行出现同一异常——agent 在宣布下一步计划时 dsh 干净退出（无 API 错误、非超时、最后话语为进行时意图，判定为 harness 侧运行截断而非模型收工）。两次尝试均改名为 `-aborted-early-exit` 弃权不计分、待重试。

### 第 8 条结果详情（2026-09-01，通过，pro 灰测）

- Trial：`sqlfmt-create-table-ddl-formatti__7eoBuBu`；agent 22:52 发车、00:23:01 收官（90 分钟超时收敛后判过）
- 模型：`deepseek-official/deepseek-v4-pro`，reasoning effort `max`，**PTC 模式**
- 传输通道：pro 灰测通道 `session-be68b190-…5730b`
- Token：**6,767,281（守卫观测值）**——超时杀进程导致 session 导出丢失（同 #75），无法去重核算
- 费用：谷时窗口运行，价目未确认，待定
- 结果：reward **1.0**——基线测试零回归，新增测试 79/79 全过

### 第 9 条结果详情（2026-09-01，通过，pro 灰测，180 分钟档）

- Trial：`opa-rego-rule-profiling__4veCq9G`；agent 23:54 发车、01:36:54 收官（~102 分钟自然完成，未触 180 分钟超时）
- 模型：`deepseek-official/deepseek-v4-pro`，reasoning effort `max`，**PTC 模式**（watchdog 全程无 mismatch）
- 传输通道：pro 灰测通道 `session-6166250c-…11bc`
- Token（去重，54 条 usage）：未缓存输入 292,822 · cache read 2,611,584 · cache write 0 · 输出 33,854，合计 **2,938,260**
- 费用：谷时窗口运行，价目未确认，待定
- 结果：reward **1.0**——基线零回归，新增测试全过；session 完整导出

### 第 10 条结果详情（2026-09-01，通过，pro 灰测，180 分钟档）

- Trial：`testem-bail-on-test-failure__fjx9c2F`；agent 00:09 发车、02:10:05 收官（~121 分钟自然完成，未触 180 分钟超时）
- 模型：`deepseek-official/deepseek-v4-pro`，reasoning effort `max`，**PTC 模式**
- 传输通道：pro 灰测通道 `session-d058bf1a-…b144`
- Token（去重，66 条 usage）：未缓存输入 584,935 · cache read 5,078,016 · cache write 0 · 输出 46,707，合计 **5,709,658**
- 费用：谷时窗口运行，价目未确认，待定
- 结果：reward **1.0**——基线零回归，新增测试全过；session 完整导出

### 第 11 条结果详情（2026-09-01，通过，pro 灰测，120 分钟档）

- Trial：`pest-character-class-coalescing__dijXkUZ`；00:16 发车、02:20:11 收官（120 分钟超时收敛后判过）
- 模型：`deepseek-official/deepseek-v4-pro`，reasoning effort `max`，**PTC 模式**
- 传输通道：pro 灰测通道 `session-8fe028d0-…73e71`——**同通道复跑实验收官**：该通道先跑完 #62 meriyah 后再跑本题，灰测路由持续有效，跑分未收回资格
- Token：**4,028,541（守卫观测值）**——超时杀进程导致 session 导出丢失
- 备注：首跑 23:47–00:08 因连续 5 次 HTTP 524（上游网关超时）中断，按规则弃权不计数（`-aborted-api-524`），本行为完整重跑
- 结果：reward **1.0**——基线零回归，新增测试 104/104 全过

### 第 2 条结果详情（2026-08-21，跑完判错）

- Trial：`clack-async-autocomplete-options__BLQCUNM`；agent execution 17:14:36–17:52:17（37m41s），verifier 20s
- 模型：`deepseek-official/deepseek-v4-pro`，reasoning effort `max`（watchdog 确认实际模型与档位）
- 传输通道：主通道 `session-31c511bb-…373cd`（112 次请求全部 HTTP 200）
- Token（去重，110 条 usage）：未缓存输入 79,020 · cache read 13,256,960 · cache write 0 · 输出 139,530（含 reasoning 93,121）
- 费用：全程处于峰时窗口（17:14–17:52 UTC+8），按峰时价 ≈ **$1.24**
- 判错原因：verifier 新增测试 `test/async-autocomplete.test.ts` 25 项中 2 项失败
  （如 fallback 场景要求渲染 `unavailable` 提示，实现仅渲染 fallback 选项）；agent 自述实现完整、构建干净
- DSH 本地 Session：`session-86102519-552b-4e8c-8832-63207b0a78bc`（9,093 events）

### 第 1 条结果详情（2026-08-21）

- Pier job ID：`e26d6fd3-64e5-445a-aba7-885f5a086491`（1 completed，0 errors）
- 模型：`deepseek-official/deepseek-v4-pro`，reasoning effort `max`
- 固定模型传输 Session ID：`session-31c511bb-1da1-43de-83c9-33e78a4373cd`
- DSH 本地 Session ID：`session-5786115d-6a7e-4ea3-a260-e9f336e09146`
- Token 明细（去重）：未缓存输入 73,053 · cache read 19,880,192 · cache write 0 · 输出 150,445（含 reasoning 112,481）
- 峰时费用按官方定价（cache hit $0.044 / miss $1.32 / output $3.96 每 1M tokens）计 ≈ **$1.57**；该运行时段（16:05–16:46 UTC+8）本身即处于峰时窗口（14:00–18:00 UTC+8）
- 最终 patch：9 文件，+1,230 / −60，48,872 bytes
- 代理审计：151 次请求全部 HTTP 200，传输 Session ID 全部匹配

## 目录结构

```
artifacts/
├── README.md                  ← 本文件（索引与验证说明）
├── DEEPSWE_TEST_ARCHIVE.md    ← 测试存档文档快照（含全部 ID、Token 总计、公平性说明）
├── MANIFEST.sha256            ← 全部文件的 SHA-256 校验和
└── tasks/
    └── deepswe-bandit-structured-nosec-directives/     ← durable Pier job 目录完整镜像
        ├── result.json / config.json / lock.json / job.log          （job 级）
        └── bandit-structured-nosec-directiv__MXYnhjB/               （trial 级）
            ├── result.json                                          （含 verifier reward）
            ├── trial.log / config.json
            ├── verifier/reward.txt                                  （值 = 1）
            ├── verifier/test-stdout.txt                             （324 回归测试完整输出）
            ├── agent/model.patch                                    （模型产出的最终代码补丁）
            ├── agent/dsh-output.txt                                 （agent 最终自述摘要）
            ├── agent/proxy-audit.jsonl                              （151 条模型请求审计）
            ├── agent/token-watchdog.json                            （模型/推理档/usage 监控快照）
            ├── agent/worktree-status.txt
            ├── agent/dsh-home/sessions/.../session.jsonl.zstd        （完整 DSH 会话，10,793 events）
            ├── agent-build-context/Dockerfile
            ├── egress-proxy/Dockerfile、start-squid.sh               （容器网络隔离定义）
            └── docker-compose-*.json                                 （mounts / egress-proxy 编排）
```

## 如何验证

1. **完整性**：在本目录执行 `sha256sum -c MANIFEST.sha256`，全部文件应为 OK。
2. **得分**：查看 `tasks/deepswe-bandit-structured-nosec-directives/result.json` →
   `stats.evals["dsh-headless__deepseek-v4-pro__dataset"].reward_stats` 中 `"1.0"` 对应本次 trial；
   `verifier/reward.txt` 内容为 `1`。
3. **测试通过**：`verifier/test-stdout.txt` 为任务容器内 pytest 完整输出（324 passed），
   加上 verifier 阶段的任务专项组（78/78，见 job.log 与 DEEPSWE_TEST_ARCHIVE.md）。
4. **补丁真实性**：`agent/model.patch` / `artifacts/model.patch` 为模型在容器工作树内产出并被
   verifier 应用的原始 patch。
5. **请求与模型一致性**：`agent/proxy-audit.jsonl` 每条含时间戳、HTTP 200、覆盖后的
   `overrideSessionId`；`agent/token-watchdog.json` 记录实际模型 `deepseek-v4-pro` 与
   reasoning effort `max`。
6. **复现环境**：数据集固定版本 ref `sha256:aaa82ceb8404dccc17689c9383f93dbcbc8f029a7601d2e3856a416f2cb89269`
   （113 题）；Pier `0.3.0.post3`；容器与代理定义见各 `Dockerfile` / `docker-compose-*.json`。

## 说明与注意

- **密钥安全**：全部文件经扫描，仅含 `${DEEPSEEK_API_KEY}` 占位符；DSH 会话日志（zstd）二进制扫描
  未发现 `sk-` 形式密钥或 `Authorization`/`DEEPSEEK_API_KEY` 字面量。API key 只通过进程环境变量供给，从未落盘。
- **敏感性**：`agent/dsh-home` 含完整提示词、模型响应、工具活动与源码片段，已确认无密钥后按决定一并公开。
- **结果口径**：Pier `result.json` 中 `n_input_tokens` 等字段为 `null` 是 adapter 已知行为，不表示未消耗；
  Token 权威数据来自 DSH 会话 usage 记录，汇总见 `DEEPSWE_TEST_ARCHIVE.md`。
- **追加规则**：后续任务只要**完整跑完**（无论 reward 1.0 还是跑完被判错），均按
  `tasks/<pier-job-name>/` 同样镜像归集，并重新生成 `MANIFEST.sha256`、更新本 README 的任务一览表。
