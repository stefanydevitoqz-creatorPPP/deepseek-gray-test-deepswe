# DSH DeepSWE 本地测试存档

## 固定灰测路由 Session ID

后续指定测试使用以下灰测传输 Session ID：

```text
session-31c511bb-1da1-43de-83c9-33e78a4373cd
```

2026-08-21 追加第二条传输通道（同账号、同灰测后端绑定，已核实其 DSH 请求配置使用路由别名 `deepseek-official/deepseek-v4-pro` + `reasoningEffort: max`）：

```text
session-98099082-1653-4e15-abc1-95a7892d58a6
```

- 线格式：实测（代理审计 151 次 + DSH 原生请求头）`x-deepseek-harness-session-id` 的值为纯 `session-<uuid>`；用户界面展示的 `dsh-session-` 前缀为标注，不进请求头。
- 用途：并行跑两题时各用一条通道，避免同一传输 ID 跨题复用；或作为主通道异常时的备用。使用前需验证该通道确实命中灰测模型（watchdog 首次快照会记录响应模型标签，但标签本身不能单独证明后端身份）。
- 对应本地 DSH 会话：`session-98099082-…`（"三体游戏HTML模拟"），该会话本体与测试无关，仅借用其 ID 做模型端路由。

### 2026-08-21 主通道失效判定（已确认：灰测结束）

第 37 题 `gql-incremental-graphql-delivery` 尝试期间，用户判定主通道 `session-31c511bb-…` 后端已不再是目标模型并终止运行。佐证：同通道下，第 13/16 题完整会话思维链含 I'm 14/9 次、I'll 148/135 次、多次 "Hmm" 自我怀疑语气；而本轮（`gql-incremental-graphql-delivery__WULhHQy`，session-20b19426）思维链全部缩写为 0，呈纯命令式 "Let me…" 风格——风格签名明显不同。该轮已按中断处理（`…-interrupted-wrong-model`），不计入成绩；watchdog 报告的模型名仍为 `deepseek-v4-pro`，说明模型 ID 标签不可作为凭据，以思维链特征为准。

**原因已确认**：用户与他人印证，该模型的**灰度测试（灰测）已结束**，通道后端由灰测模型切回常规模型。两条件输通道（`31c511bb`、`98099082`）均为灰测入口，灰测结束后预计同样失效；在新的灰测窗口开启前无法继续测试目标模型。本次 DeepSWE 评测就此定格：**灰测窗口内共完成 2 题评测（#13 通过 reward 1.0、#16 未通过 reward 0.0），成绩以证据包为准**。第 37 题未在有效窗口内完成，不计入。

### 2026-08-31 灰测重启（双路由别名）

灰测重新开启，且需要 **PTC 模式**（`DSH_TOOLS_MODE=code`）才路由到灰测模型——裸 API 请求（无 DSH 工具面）对任何通道都只返回常规模型（已实测三通道对照）。第 83 题实测确认 PTC + 通道 ID 组合有效。

**flash-vision-exp 请求路由**（请求别名 `deepseek-v4-flash-vision-exp`，灰测指纹：英文 reasoning + 高密 I'm，探索期话少、设计期爆发，判定需 reasoning >5K 字符）：

```text
session-fed63608-114a-4f59-8dbd-d4e1b77ea473   ← 第 83 题使用中（其他电脑，同 API key）
session-4c5003b7-86c0-421c-847e-ea417f88f2cd   ← 夜鹭（本机，已验证灰测，备用）
session-559454b5-d50a-49d9-8de7-f2fa362760fe   ← 三体（本机，已验证灰测，备用）
```

**v4-pro 请求路由**（请求别名由用户于 2026-08-31 21:32 发现，其他电脑同 API key；灰测指纹应同旧窗口：英文 + Let me/Hmm/I'll 密集、I'm 稀疏，与 flash 路由下的灰测输出相反，注意区分）：

```text
session-8fe028d0-31b1-46b5-920c-591e78a73e71
session-6166250c-d03b-4cda-9c51-99c9b40b11bc
session-be68b190-2c99-4435-8b0e-0459ebc5730b
session-d058bf1a-3788-4571-b76e-9af16b33b144
session-660f6500-8781-426f-afb0-153fc3e8a489
```

测试计划（用户定）：同一灰测通道连续运行两题，观察跑分后灰测资格是否被收回。配置口径：`tools_mode: code`（PTC 为本轮灰测触发条件）+ `flash-vision-exp` 请求别名用 `expected_reasoning_effort: high` / `pro` 请求别名用 `max` + 1.5M/600s guard（仅限**开跑后前 10 分钟**窗口，由容器内 watchdog 独占执行；宿主机监控只观测不杀——口径 2026-08-31 经用户确认修正）。这里的 `flash-vision-exp`、`pro`、Flash-Vision/high 与 Pro/max 都是进入灰测后端时使用的路由别名/档位；实际被测对象统一记为 **DeepSeek 灰测模型**，不等同于目前公开的两个同名模型。

### 2026-08-31 评测记录

| # | 任务 | 灰测请求路由/通道 | 档位 | 结果 | Token（去重） | 备注 |
|---|---|---|---|---|---|---|
| 83 | python-statemachine-state-data-scoping | flash-vision-exp / fed63608 | high（PTC） | **通过 reward 1.0** | 8,538,168 | 基线 1407 零回归 + 新测试 72/72；91m29s 触及 5400s 超时优雅收敛（SIGTERM，session 完整导出）；运行中指纹确认灰测（I'm×31 @22.3K 字符）；谷时运行、flash 定价未公布费用待定；Trial `python-statemachine-state-data-s__ujE4Hhm`，DSH session `session-17b88615` |
| 108 | vulture-persistent-analysis-cache | pro / 6166250c | max（PTC） | **通过 reward 1.0** | 2,761,774 | 基线 298 零回归 + 新测试 24/24；agent 61 分钟自然完成未触超时；谷时运行费用待定；Trial `vulture-persistent-analysis-cach__iAVtBGi` |
| 62 | meriyah-explicit-resource-declarations | pro / 8fe028d0 | max（PTC） | 未通过 reward 0.0 | 6,720,018 | 基线 94,644 零回归；新测试 using.ts 66 项中 1 项失败；agent 85 分钟自然完成；Trial `meriyah-explicit-resource-declar__mhZYBoq` |
| 37 | gql-incremental-graphql-delivery | pro / d058bf1a | max（PTC） | **通过 reward 1.0** | 14,928,554 | 基线 870 零回归 + 新测试 18/18；~90 分钟触超时收敛后判过；Trial `gql-incremental-graphql-delivery__aQ6hCKT` |
| 75 | oxvg-structural-selector-preservation | pro / 660f6500 | max（PTC） | 未通过 reward 0.0 | 7,362,540（观测值） | 新测试 8/10（差 2 个空容器保留场景）；90 分钟超时收敛；超时杀进程恰逢 524 卡死，session 导出丢失（token 为守卫观测值）；Trial `oxvg-structural-selector-preserv__bZSaear` |
| 91 | sqlfmt-create-table-ddl-formatting | pro / be68b190 | max（PTC） | **通过 reward 1.0** | 6,767,281（观测值） | 基线零回归 + 新测试 79/79；90 分钟超时收敛后判过；session 导出同样丢失（token 为守卫观测值）；Trial `sqlfmt-create-table-ddl-formatti__7eoBuBu` |
| 72 | opa-rego-rule-profiling | pro / 6166250c | max（PTC） | **通过 reward 1.0** | 2,938,260 | 基线零回归 + 新测试全过；agent ~102 分钟自然完成（180 分钟档），session 完整导出；Trial `opa-rego-rule-profiling__4veCq9G` |
| 98 | testem-bail-on-test-failure | pro / d058bf1a | max（PTC） | **通过 reward 1.0** | 5,709,658 | 基线零回归 + 新测试全过；agent ~121 分钟自然完成（180 分钟档），session 完整导出；Trial `testem-bail-on-test-failure__fjx9c2F` |
| 78 | pest-character-class-coalescing | pro / 8fe028d0 | max（PTC） | **通过 reward 1.0** | 4,028,541（观测值） | 基线零回归 + 新测试 104/104；120 分钟超时收敛后判过，session 导出丢失；首跑因连续 5 次 HTTP 524 中断已弃权（-aborted-api-524）；同通道复跑实验完整收官——8fe028d0 连跑两题（#62 后 #78）灰测路由均有效；Trial `pest-character-class-coalescing__dijXkUZ` |
| 45 | igel-persist-feature-schema | pro / 660f6500 | max（PTC） | 未通过 reward 0.0 | 3,821,675 | 新测试 6/24（compress 参数校验等 18 项未实现）；120 分钟超时收敛，session 完整导出；Trial `igel-persist-feature-schema__Z3cU4Fv` |
| 57 | koota-pair-relation-tracking | pro / be68b190 | max（PTC） | **通过 reward 1.0** | 7,444,481（观测值） | 基线零回归 + 新测试 38/38；120 分钟超时收敛后判过，session 导出丢失；Trial `koota-pair-relation-tracking__teyz2aj` |

归档中的 `retryN` 是任务编排序号，不是模型版本，也不是额外计分轮次。重试仅用于替代因 DSH/agent 进程崩溃、异常早退，或启动命令行/参数转发错误而无效的尝试；这些前序尝试全部弃权，不计为模型失败、不进入 `tasks.csv`。其中 `ink-grid-box-layout` 的 Flash 阶段六次 retry 已确认是题目指令以前导 `- ` 开始，原适配器命令缺少第二个 `--`，导致 DSH 严格参数解析将题目文本当作命令行选项并使进程崩溃；修复参数终止符后才产生可计分运行。

异常早退（2026-09-01 02:35–02:52）：obsidian（33 分钟，d058bf1a）与 kombu（20 分钟，be68b190）出现同一异常——agent 在宣布下一步计划时 dsh 干净退出（无 API 错误、非超时），判定为 harness 侧运行截断而非模型收工。两次尝试改名 `-aborted-early-exit` 弃权不计分、留队重试（各含 2 次 524 但均已恢复，非直接死因）。
| 71 | onedump-dump-encryption-pipeline | pro / 660f6500 | max（PTC） | 未通过 reward 0.0 | 2,024,716 | 新测试包 encryption 编译失败；agent 55 分钟自然收工（带完整实现/测试/文档总结，非早退）；Trial `onedump-dump-encryption-pip__nssq5bj` |
| 26 | eicrud-keyset-pagination-cursor | pro / 6166250c | max（PTC） | 未通过 reward 0.0 | 9,173,087 | 基线 234 零回归；新测试执行失败（Node 报错）；agent ~112 分钟自然收工（180 分钟档）；Trial `eicrud-keyset-pagination-cursor__kjszwkn` |
| kysely | kysely-window-grouping-helpers | pro / 660f6500 | max（PTC） | 异常弃权（早退） | —（36 请求全 200） | agent 8 分钟即非零崩溃（Command failed，无 API 错误）——第 3 起早退类异常；改名 `-aborted-early-exit` 不计分，已挪到该通道队尾待重试 |
| kysely-2 | kysely-window-grouping-helpers | pro / 8fe028d0 | max（PTC） | 异常弃权（第二次早退，停止重试） | —（37 请求均 200） | 11 分钟时 agent exit 143；最后仍为读取关键文件，model.patch 为空。改名 `-aborted-early-exit-2-no-retry`，不计分、不入 CSV，并从队列永久移除 |
| 100 | textual-kitty-key-phases | pro / d058bf1a | max（PTC） | **通过 reward 1.0** | 7,925,841 | 基线零回归 + 新测试 23/23；~56 分钟自然收工；Trial `textual-kitty-key-phases__` |
| 40 | helm-array-merge-strategies | pro / 8fe028d0 | max（PTC） | **通过 reward 1.0** | 8,790,449 | 全部测试通过；~78 分钟自然收工；Trial `helm-array-merge-strategies__pjqvm9m` |
| 11 | kombu-virtual-queue-dead-lettering | pro / be68b190 | max（PTC） | **通过 reward 1.0** | 7,032,348 | 基线 1453 零回归 + 新测试 78/78；~42 分钟自然完赛——重试成功，证实首跑 20 分钟死亡为异常截断；Trial `kombu-virtual-queue-dead-letteri__effkfnb` |
| 5 | aiomonitor-task-snapshots-diff | pro / 660f6500 | max（PTC） | **通过 reward 1.0** | 9,188,941 | 全部测试通过；22 分钟快速自然完赛（难度榜首题，区分度 100）；Trial `aiomonitor-task-snapshots-diff__wrpce47` |
| 93 | superjson-error-stack-serialization | pro / be68b190 | max（PTC） | 未通过 reward 0.0 | 2,538,638 | 新测试 114/116（差 2 个 classFilter 边角）；~32 分钟自然收工（带完整总结）；Trial `superjson-error-stack-serializat__bfqpwzh` |
| 29 | fastapi-deprecation-response-headers | pro / 8fe028d0 | max（PTC） | **通过 reward 1.0** | 3,288,727 | 基线 3174 零回归 + 新测试 137/137；~40 分钟自然收工；Trial `fastapi-deprecation-response-hea__32zu6m4` |
| 67 | obsidian-linter-auto-table-of-contents | pro / d058bf1a | max（PTC） | 未通过 reward 0.0 | 4,247,163 | 基线 1202 零回归；新测试 37/41（4 个未过）；~45 分钟自然收工——重试后为正常判错（首跑异常截断已弃权，重试完成 90% 实现）；Trial `obsidian-linter-auto-table-of-co__6gqc24y` |
| 39 | happy-dom-deterministic-intersectionobserver | pro / 660f6500 | max（PTC） | 未通过 reward 0.0 | 3,671,732 | 新测试 14/15（差 1 个）；~48 分钟自然收工（带完整测试报告）；Trial `happy-dom-deterministic-intersec__a4rmvw2` |
| 82 | pwntools-tube-multiplexing | pro / 6166250c | max（PTC） | **通过 reward 1.0** | 5,434,621 | 新测试 73/73；~80 分钟自然收工；Trial `pwntools-tube-multiplexing__f536yjn` |
| 18 | cliffy-config-file-parsing | pro / 8fe028d0 | max（PTC） | **通过 reward 1.0** | 5,631,966 | 全部测试通过（459+37）；~36 分钟自然收工；Trial `cliffy-config-file-parsing__9khib2t` |
| 97 | termenv-preserve-ansi-resets | pro / 6166250c | max（PTC） | 未通过 reward 0.0 | 1,689,801 | 新测试套件 FAIL；~37 分钟自然收工（带完整总结）；Trial `termenv-preserve-ansi-resets__` |
| 54 | koota-composite-trait-aspects | pro / be68b190 | max（PTC） | 未通过 reward 0.0 | 22,119,043 | 新测试 49/51（差 2 个）；~75 分钟自然收工；今晚单题 token 之最；Trial `koota-composite-trait-aspects__` |
| 31 | expr-try-catch-errors | pro / d058bf1a | max（PTC） | **通过 reward 1.0** | 14,429,790 | 全部测试通过；~65 分钟自然收工；Trial `expr-try-catch-errors__mab7dem` |
| 20 | etree-xml-diff-patch | pro / 660f6500 | max（PTC） | **通过 reward 1.0** | 3,260,751 | 全部测试通过；~55 分钟自然收工；Trial `etree-xml-diff-patch__` |
| 12 | bandit-interprocedural-taint-checks | pro / 8fe028d0 | max（PTC） | **通过 reward 1.0** | 4,002,705 | 全套 322 过 + 新测试 85 过；~38 分钟自然收工（零误报、开销 6%）；Trial `bandit-interprocedural-taint__` |
| 20 | dasel-html-document-format | pro / be68b190 | max（PTC） | **通过 reward 1.0** | 2,366,071 | 全部测试通过；~42 分钟自然收工；Trial `dasel-html-document-format__` |
| 66 | numba-stencil-boundary-modes | pro / 6166250c | max（PTC） | **通过 reward 1.0** | 6,335,877 | 基线 824 零回归 + 新测试 32/32；自然收工 |
| 81 | psd-tools-blend-range-api | pro / 660f6500 | max（PTC） | **通过 reward 1.0** | 5,446,596 | 全部测试通过；自然收工 |
| 9 | arktype-json-schema-refs-dependencies | pro / d058bf1a | max（PTC） | **通过 reward 1.0** | 8,886,077 | 全部测试通过（含 onFail/morphs 边角）；自然收工 |
| 77 | pebble-durability-wait-apis | pro / 8fe028d0 | max（PTC） | **通过 reward 1.0** | 4,737,462 | 全部测试通过；自然收工 |
| 94 | task-task-graph-export | pro / be68b190 | max（PTC） | **通过 reward 1.0** | 5,121,907 | 基线与新测试全过；自然收工 |
| wasmi | wasmi-trap-coredumps | pro / 8fe028d0 | max（PTC） | 异常弃权（早退） | —（33 请求全 200） | agent 15 分钟非零崩溃——第 5 起早退类异常；改名 `-aborted-early-exit` 不计分，挪队尾待重试 |
| wasmi-2 | wasmi-trap-coredumps | pro / be68b190 | max（PTC） | 异常弃权（第二次早退，停止重试） | —（28 请求均 200） | 10 分钟时 agent exit 143；最后内容仍是开始探索，工作未进入实现；虽 verifier 对空改动写 reward 0，但不视为有效作答。改名 `-aborted-early-exit-2-no-retry`，不计分、不入 CSV，并从队列永久移除 |
| 19 | csstree-shorthand-expansion-compression | pro / 660f6500 | max（PTC） | 未通过 reward 0.0 | 4,027,289 | 基线零回归；新测试 exit 5（隐藏边角未覆盖，agent 本地 16897 全过）；自然收工 |
| 50 | kea-atomic-signal-selectors | pro / 6166250c | max（PTC） | 未通过 reward 0.0 | 6,515,418 | 新功能测试 14/14 全过；基线回归挂 1（listeners·breakpoints，155/156）；60 分钟自然收工——近失败 |
| 24 | dynamodb-toolbox-lazy-recursive-schemas | pro / d058bf1a | max（PTC） | **通过 reward 1.0** | 18,757,252 | 基线 130 文件/1334 测试零回归；新测试 2 文件/37 全过；72 分钟自然收工 |
| 87 | scc-bounded-memory-spilling | pro / 8fe028d0 | max（PTC） | **通过 reward 1.0** | 6,634,096 | 基线与新测试双绿（exit 0/0）；45 分钟自然收工 |
| 96 | tengo-destructuring-bindings | pro / be68b190 | max（PTC） | **通过 reward 1.0** | 8,265,190 | 基线与新测试双绿（exit 0/0）；45 分钟自然收工 |
| 95 | tengo-callable-instance-isolation | pro / 660f6500 | max（PTC） | **通过 reward 1.0** | 6,410,130 | 基线与新测试双绿（exit 0/0）；48 分钟自然收工 |
| 43 | httpx-multipart-response-parsing | pro / d058bf1a | max（PTC） | 未通过 reward 0.0 | 3,192,061 | 基线 1348 通过零回归；新测试 121/122，仅 header folding 制表符归一化边角失败；29 分钟自然收工——近失败 |
| 76 | participle-grammar-conflict-analysis | pro / 8fe028d0 | max（PTC） | **通过 reward 1.0** | 2,966,156 | 基线与新测试双绿（exit 0/0）；37 分钟自然收工 |
| 1 | abs-module-cache-flags | pro / be68b190 | max（PTC） | **通过 reward 1.0** | 5,131,542 | 基线与新测试双绿（exit 0/0）；38 分钟自然收工 |
| scriggo-guard | scriggo-method-declarations | pro / 8fe028d0 | max（PTC） | watchdog 弃权（会话退役） | 1,566,956（前 210 秒） | 容器内 watchdog 因前10分钟 token 达到 1.5M 阈值主动终止；模型/档位匹配。按用户规则判定 8fe028d0 已失去灰测资格，结果不计分、不入 CSV；该会话永久停用，队列迁移至 5bbb6944 后重跑 |
| scriggo-guard-2 | scriggo-method-declarations | pro / 5bbb6944 | max（PTC） | watchdog 弃权（会话退役） | 1,540,236（前 234 秒） | 替换会话同样在前10分钟触发 1.5M watchdog；结果不计分、不入 CSV。按用户规则永久停用 5bbb6944，队列迁移至最后备用 f3e46bd4 后重跑 |
| scriggo-guard-3 | scriggo-method-declarations | pro / f3e46bd4 | max（PTC） | watchdog 弃权（会话退役） | 1,527,025（前 160 秒） | 最后备用会话也触发前10分钟 1.5M watchdog；结果不计分、不入 CSV。8fe028d0、5bbb6944、f3e46bd4 全部永久停用，后续降为四通道；scriggo 无可用灰测 ID，不再排队 |
| 25 | effect-sse-httpapi-streaming | pro / 6166250c | max（PTC） | **通过 reward 1.0** | 35,096,129 | 基线 70 测试零回归；新测试 47/47；77 分钟自然收工（早退后重试） |
| boa-verifier | boa-hierarchical-evaluation-cancellation | pro / 660f6500 | max（PTC） | 验证环境异常弃权 | 42,585,171 | agent 自然完成，但 baseline 与新测试均因 static.crates.io 下载 criterion 失败(exit 101)，无法形成有效 reward；改名 -aborted-verifier-download，不计分，挪队尾重试 |
| prometheus-guard | prometheus-transactional-reload-status | pro / 6166250c | max（PTC） | watchdog 弃权（会话退役） | 1,533,578（前 338 秒） | 前10分钟触发1.5M watchdog；结果不计分、不入CSV。6166250c永久停用且无备用，后续降为三通道；prometheus从队列移除 |
| 105 | updo-policy-alerting | pro / be68b190 | max（PTC） | 未通过 reward 0.0 | 6,246,014 | 基线零回归；新测试 notifications 构建失败；28分钟自然收工 |
| 10 | awilix-async-container-initialization | pro / d058bf1a | max（PTC） | **通过 reward 1.0** | 13,838,080 | 基线190测试零回归；新测试24/24；42分钟自然收工 |
| 68 | obsidian-linter-link-format-conversion | pro / 660f6500 | max（PTC） | 未通过 reward 0.0 | 9,086,735 | 基线1186测试零回归；新测试59/60，仅差1个link-style边角；27分钟自然收工——近失败 |
| 11 | bandit-incremental-cache-control | pro / d058bf1a | max（PTC） | **通过 reward 1.0** | 17,084,675 | 基线 341 测试零回归；新测试 89/89；39 分钟自然收工 |
| 104 | ts-pattern-match-each | pro / be68b190 | max（PTC） | **通过 reward 1.0** | 4,671,786 | 基线 6 测试零回归；新测试 85/85；23 分钟自然收工 |
| 106 | valibot-recursive-schema-composition | pro / 6166250c | max（PTC） | **通过 reward 1.0** | 16,614,710 | 基线 208 测试零回归；新测试 9/9；95 分钟自然收工 |
| 41 | helm-unified-manifest-stream | pro / 660f6500 | max（PTC） | **通过 reward 1.0** | 7,059,876 | 基线与新测试双绿（exit 0/0）；53 分钟自然收工 |
| 17 | claude-code-by-agents-recursive-delegation | pro / be68b190 | max（PTC） | 未通过 reward 0.0 | 2,615,571 | 基线 44 测试全过；新测试 2/7，递归委派核心路径未生效；36 分钟自然收工 |
| 58 | koota-query-predicates | pro / 8fe028d0 | max（PTC） | **通过 reward 1.0** | 9,765,321 | 基线 173 测试零回归；新测试 43/43；55 分钟自然收工 |
| 101 | textual-richlog-follow-state | pro / d058bf1a | max（PTC） | **通过 reward 1.0** | 9,310,230 | 基线 13 测试零回归；新测试 24/24；71 分钟自然收工 |
| 89 | skrub-duration-encoding | Flash-Vision/high / a29d1a42 | **通过（归一化 reward 1.0）** | 原始 baseline 2377/2474 通过（97 项与 pristine HEAD 完全相同，为既有 Polars/sklearn dataframe-interchange 环境兼容失败）；专项新测试 130/130 | 1,134,105（观测值） | 原始 verifier reward 0.0，按修正口径计通过 |
| 84 | query-persist-restored-query-state | 灰测模型（Flash-Vision/high 路由）/ 11aeab50 | **通过 reward 1.0** | 基线与专项新测试双绿 | 1,023,138 | retry4：编排序号；前序无效轮次不计分 |
| 47 | ipython-session-bundle-replay | 灰测模型（Flash-Vision/high 路由）/ 5f2538b6 | **通过 reward 1.0** | 基线 29 通过；专项新测试 17/17 | 135,920 | retry4：编排序号；前序无效轮次不计分 |
| 51 | kgateway-consistent-hash-policy | 灰测模型（Flash-Vision/high 路由）/ 5f2538b6 | **通过 reward 1.0** | 基线通过；`TestConsistentHash` 专项测试通过 | 1,363,960（watchdog观测值） | retry10：编排序号；监控窗口结束后自然完成 |
| 46 | ink-grid-box-layout | **灰测模型（Pro/max 路由）/ 882494eb** | **通过 reward 1.0** | Pro/max 路由最终完整运行基线与专项新测试双绿；Flash 路由前六次均因命令行参数解析崩溃而作废 | 7,608,675 | 修复适配器第二个 `--` 后完整运行；79.8 分钟、90 次调用 |

### 灰测模型追加结果（2026-09-01，Flash-Vision/high 路由，PTC 模式，retry4）

以下三题的被测对象均为当时实际命中的 **DeepSeek 灰测模型**。请求使用 `deepseek-official/deepseek-v4-flash-vision-exp` 路由别名、reasoning effort `high` 和 `tools_mode=code`；该字符串只用于灰测路由追溯，不表示被测对象就是目前公开的同名模型。`retry4` 仅是编排序号，前序因进程崩溃/异常退出或启动命令问题而无效的轮次不计分；以下有效轮次均无路由/推理档位 mismatch。

- `query-persist-restored-query-state`：Trial `query-persist-restored-query-sta__Cx4rbq4`，传输通道 `session-11aeab50-…9a3d`，runtime 约35分钟；去重 Token **1,023,138**；baseline 与专项测试均通过，reward **1.0**。原始证据：`tasks/deepswe-flashvision-retry4-query-persist-restored-query-state/`。
- `ipython-session-bundle-replay`：Trial `ipython-session-bundle-replay__RS5mqbD`，传输通道 `session-5f2538b6-…2fa9`，runtime 约41分钟；去重 Token **135,920**；baseline 29项通过，专项测试17/17通过，reward **1.0**。原始证据：`tasks/deepswe-flashvision-retry4-ipython-session-bundle-replay/`。
- `skrub-duration-encoding`：Trial `skrub-duration-encoding__vgyXpAj`，传输通道 `session-a29d1a42-…c769`，runtime 约50分钟；去重 Token **1,134,105**；baseline 2377通过、97失败，专项测试130/130通过。原始 verifier reward 为 0.0，但 97 项 baseline 失败与 pristine HEAD 完全相同，确认是既有 Polars/sklearn dataframe-interchange 环境兼容问题，因此正式台账按修正口径归一化为 reward **1.0**。原始证据：`tasks/deepswe-flashvision-retry4-skrub-duration-encoding/`。

此前三题均已镜像到 `artifacts/tasks/`，并通过 API key 扫描；配置和日志只保留 `${DEEPSEEK_API_KEY}` 占位符。新增的 `kgateway` 与 `ink-grid` 证据也已镜像并完成同样的扫描。

### 灰测模型追加结果（2026-09-02，Flash-Vision/high 路由，PTC 模式，retry6/retry10）

`retry6`/`retry10` 仍只是编排序号，不是模型名称或模型版本。`ink-grid-box-layout` 的前六次均因命令行参数传递错误导致 DSH 解析崩溃而作废；`kgateway` 的编号同样只保留任务历史追溯，只有下列完整 verifier 轮次计分。

- `kgateway-consistent-hash-policy`：Trial `kgateway-consistent-hash-policy__RLsQUf3`，传输通道 `session-5f2538b6-…2fa9`，runtime 约46分钟；watchdog 在前10分钟观察到 **1,363,960** tokens，监控窗口结束后任务自然完成；baseline 通过，`TestConsistentHash` 专项测试通过，原始 reward **1.0**。原始证据：`tasks/deepswe-flashvision-retry10-kgateway-consistent-hash-policy/`。
- `ink-grid-box-layout`：Flash-Vision/high 路由下保留的 Trial `ink-grid-box-layout__4QYsJoi` 可追溯到 `retry6` 编排阶段，但该阶段前序运行的根因是命令行参数传递错误：题目指令以前导 `- ` 开始，被 DSH 严格参数解析误认为选项并导致进程崩溃。原适配器补上第二个 `--` 后才消除执行问题，因此前六次全部作废，不把其 21/24 输出认定为正式模型失败。正式计分采用之后通过 Pro/max 请求别名进入灰测后端并完整完成 verifier 的 Trial `ink-grid-box-layout__NxGFR8m`，基线与专项测试双绿，reward **1.0**。

### 2026-09-02 新增正式结果（PTC 模式，Pro/max 灰测通道）

以下 11 项均已完整完成 verifier，并写入 `tasks.csv`；其中 `ink-grid-box-layout` 的正式状态采用修复命令行参数传递后、通过 Pro/max 请求别名进入灰测后端的完整运行。早期 `retry6` 只保留编排和故障追溯，不作为 Flash 模型失败，也不构成当前两个公开模型之间的对比。

- `boa-hierarchical-evaluation-cancellation`：Trial `boa-hierarchical-evaluation-canc__q9WRXau`，Pro/max；原始 verifier 因 cargo 工具链/依赖下载环境失败而无效，修复 Dockerfile（工具链迁移到 `/opt/cargo`、设置 `RUSTUP_HOME`、预热依赖）后用同一 model patch 重放，基线 7/7、新测试 17/17，按环境修正口径归一化为 reward **1.0**；台账 token 12,067,942。
- `go-critic-doc-link-checker`：Trial `go-critic-doc-link-checker__sb9kTr8`；基线通过，官方新测试 exit 1；Flash 与 Pro/max 两通道同败，判为真实实现失败，reward **0.0**；token 4,694,804。
- `goreleaser-retry-publish-auditing`：Trial `goreleaser-retry-publish-auditin__zMfrrQp`；基线与新测试双绿，reward **1.0**；53.8 分钟、100 次调用、token 8,143,854。
- `httpx-streaming-json-iteration`：Trial `httpx-streaming-json-iteration__oLdKwtA`；基线通过，新测试 107/108；唯一失败与 Flash 重试相同，判为真实实现缺口，reward **0.0**；25.8 分钟、48 次调用、token 2,052,335。
- `ink-grid-box-layout`：正式 Trial `ink-grid-box-layout__NxGFR8m`，命令行参数终止符修复后通过 Pro/max 请求别名进入灰测后端，完整运行 79.8 分钟、90 次调用，基线与新测试双绿，reward **1.0**，token 7,608,675。Flash 路由阶段的六次 retry 因题目指令以前导 `- ` 开始、被 DSH 严格参数解析误认为选项而崩溃，全部作废且不计为模型失败。
- `kgateway-consistent-hash-policy`：Trial `kgateway-consistent-hash-policy__RLsQUf3`，通过 Flash-Vision/high 请求别名进入灰测后端；`retry10` 仅为编排序号。前 10 分钟 watchdog 观察 1,363,960 tokens，监控窗口结束后自然完成，基线与 `TestConsistentHash` 双绿，reward **1.0**。
- `kysely-window-grouping-helpers`：Trial `kysely-window-grouping-helpers__cqxf8R8`；基线通过，新测试编译失败，6 处 TS2578 表明类型签名过宽，判为真实模型失败，reward **0.0**；token 9,308,870。
- `narwhals-rolling-window-suite`：Trial `narwhals-rolling-window-suite__rBEfYN7`，Pro/max；模型专项新测试全绿，但 6 项 baseline 失败在 pristine HEAD 同样出现，且 Flash 与 Pro 失败集合一致，按环境污染口径归一化为 reward **1.0**；token 18,194,761。
- `optique-conditional-option-dependencies`：Trial `optique-conditional-option-depen__feMkWrc`；基线与新测试双绿，50.5 分钟、113 次调用，reward **1.0**；token 12,598,706。
- `prometheus-typed-label-sorting`：Trial `prometheus-typed-label-sorting__nPTD9mH`；基线与新测试双绿，37.6 分钟、44 次调用，reward **1.0**；token 1,940,038。
- `wasmi-trap-coredumps`：Trial `wasmi-trap-coredumps__ixY4NfJ`；基线与新测试双绿（含 host-error coredump 用例），54.6 分钟、96 次调用，reward **1.0**；token 11,642,400。

截至当前 2026-09-02 快照，固定 113 题中已完成 **87** 题，其中 **64** 题按正式口径通过、**23** 题为真实模型失败，另有 **26** 题未运行。`skrub-duration-encoding`、`narwhals-rolling-window-suite` 和 `boa-hierarchical-evaluation-cancellation` 的原始 verifier 异常均已与模型实现失败分离，并在有对照或修复重放证据时归一化计分。

### 2026-09-02 当前证据镜像补充

本日新增的 26 个唯一 Pro/max 灰测任务已从外部 Pier 作业目录按任务级白名单脱敏镜像到 `artifacts/tasks-2026-09-02/`，另补入 Flash-Vision/high 的 `kgateway-consistent-hash-policy` 证据；历史任务级证据镜像现包含 62 个任务，其中补入了 `fd-deterministic-multi-key-sorting`，统一位于 `artifacts/tasks-historical/`。镜像内容包括任务级 `result.json`、verifier reward/输出、model patch、watchdog/worktree 摘要和元数据；完整 DSH session、完整模型交互、实时 proxy 日志、Docker/Pier 运行目录、API key 和本机绝对路径均不进入公开证据包。来源和目标文件均已按真实 key 模式扫描。

当前新版分析见 `DEEPSEEK_GRAY_MODEL_DEEPSWE_EVALUATION_REPORT_2026-09-02.md`；此前 57 题和 71 题段落保留为历史进展记录，不应作为当前总计。

代理必须覆盖发往模型端点的请求头：

```http
x-deepseek-harness-session-id: session-31c511bb-1da1-43de-83c9-33e78a4373cd
```

该值是模型端的传输元数据，不等同于 DSH 本地持久化会话 ID，也不能单独恢复 DSH 对话或 DeepSWE 工作区。

## 已选测试方法

采用本地环回代理，只让专用 DeepSWE headless 进程经过代理：

```text
DeepSWE/Pier task
  -> DSH headless
  -> 127.0.0.1 上的专用代理
  -> 覆盖 x-deepseek-harness-session-id
  -> 真实模型端点
```

隔离要求：

- 代理只监听 `127.0.0.1`。
- 测试使用独立 `DSH_HOME`。
- 代理地址只通过本次命令的 `--patch` 或进程级环境变量传入。
- 不修改 Web GUI 的模型设置。
- 不修改全局 `$DSH_HOME/cordis.patch.yml`。
- 不使用 `setx` 写入用户或系统级 `DEEPSEEK_BASE_URL`。
- 代理 upstream 使用独立配置，不能再次读取指向代理自身的 base URL，以免形成转发循环。
- 测试完成后停止代理；普通 DSH 会话不会经过它。

### Pier/Docker 网络边界

Pier 默认在 Docker 任务环境中运行 CLI agent。容器内的 `127.0.0.1` 指向容器自身，并不能访问仅绑定在 Windows 宿主机 loopback 上的 DSH Web 插件。因此正式 Pier 集成不能让容器直接使用 `http://127.0.0.1:<宿主端口>`。

采用以下安全方案：

- Web 插件作为配置控制面，保存固定 Session ID 和测试设置；
- 实际转发代理与 DSH headless 一起运行在任务容器内，监听容器自己的 `127.0.0.1`；
- Pier adapter 在 agent setup 阶段把已确认的配置安全地下发到该容器；
- DSH headless 只把自己的 `llm-deepseek.baseURL` 指向同容器代理；
- 不把 DSH Web 服务绑定到 `0.0.0.0`，也不通过未经认证的宿主端口暴露控制面。

手工在 Windows 宿主机直接运行 DSH headless 时，仍可使用宿主机 loopback 代理。两种模式必须使用不同的 patch/base URL，不能混用。

## 测试会话保留策略

DeepSWE 测试会话可以保留，但需要分别保留以下三层：

1. **DSH 会话日志**：headless 会创建并刷新持久化 Session。保留该次运行的 `DSH_HOME`，尤其是其中的 `sessions` 数据；不要把它当作一次性临时目录删除。
2. **任务工作区**：保留 DeepSWE/Pier 的题目仓库、容器卷或 trial 工作目录。DSH 会话日志不会自动重建已删除的仓库或容器文件系统。
3. **评测产物**：保留 Pier/Harbor trajectory、模型 stdout/stderr、退出码、最终 patch、verifier 日志和评分结果。

要真正继续同一次未完成测试，必须同时满足：

- 使用原来的 DSH 本地 Session ID，而不只是固定的模型传输 ID；
- 使用原来的 `DSH_HOME`；
- 原任务工作区仍存在，并保持相同或可解析的 cwd；
- runner 通过 `ctx.agents.resume({ resumeSessionId })` 恢复会话。

当前随附的 `dsh --profile headless` 每次都会创建新会话，只有“持久化并退出”能力，没有 `--resume` 参数。因此：

- **留档审计**：当前 headless 已支持；保留 `DSH_HOME` 和任务目录即可。
- **恢复后继续对话**：需要专用 headless runner 增加 `--session-id` / `--resume`，或通过支持恢复的 DSH API/Web 入口完成。

## 公平性与污染风险

固定模型传输 Session ID 会在指定测试中按原值使用。若模型服务端只把它用于日志关联或路由亲和，重复使用通常不会改变模型语义；若服务端按该 ID 保存对话状态、KV cache、请求缓存或其他可变状态，则多个独立 DeepSWE 题目复用它会产生跨题污染，结果不能视为标准隔离评测。

在正式批量评分前必须确认模型端对该字段的语义：

- **无状态关联字段**：可以按约定复用该固定值。
- **有状态会话或缓存键**：每个 DeepSWE instance 必须使用独立 ID，或者在每题前由服务端明确清空该 ID 的状态。

中断后恢复同一题时，应继续使用原来的模型传输 ID；开始独立新题时，是否允许复用，取决于上述服务端状态语义和评测规则。

## 当前实现状态（2026-08-21）

已完成：

- 已下载并校验固定版本的 113 个 DeepSWE 任务。
- 已实现容器内 loopback 代理 `deepswe-env/proxy/session_id_proxy.mjs`，强制覆盖上述固定传输 Session ID。
- 代理已通过 mock 测试：Authorization 转发、SSE 转发、上游中途断开、HTTP 429/500/502/503/504 有限重试，以及审计日志不含 API key。
- 已实现 Pier adapter `deepswe_agent.py`，DSH、代理、Token watchdog 和任务代码全部在同一个 trial 容器数据面内运行。
- DSH patch 只作用于 benchmark headless 进程，不修改正常 Web/DSH 配置。
- 实际模型由 `agent-default-model` 固定为 `deepseek-official/deepseek-v4-pro`；实际推理等级通过 `llm-deepseek.config.reasoningEffort: max` 设置。`agent-default-model` 的 config schema 不接受推理等级，不能在该条目下配置。
- Token watchdog 记录实际模型、推理等级和 usage；正式规则是在启动后 600 秒内累计达到 1,000,000 tokens 时终止，推理等级 mismatch 仅记录而不终止。
- Pier 执行日志对 `DEEPSEEK_API_KEY` 等敏感环境值写入 `<redacted>`。
- 已通过无模型 Docker/adapter/egress smoke；本地 Pier jobs 目录仅用于运行时保存，不属于公开发布层。
- `deepswe-env/scripts/run_pier.py` 仅在本次 Pier 进程中修复 0.3.0.post3 生成 Squid shell 脚本时使用 CRLF 的问题；不修改全局 Pier 安装。

## 第 13 题正式结果

任务：`bandit-structured-nosec-directives`

- Trial：`bandit-structured-nosec-directiv__MXYnhjB`
- Pier job ID：`e26d6fd3-64e5-445a-aba7-885f5a086491`
- DSH 本地 Session ID：`session-5786115d-6a7e-4ea3-a260-e9f336e09146`
- 固定模型传输 Session ID：`session-31c511bb-1da1-43de-83c9-33e78a4373cd`
- Provider/model：`deepseek-official/deepseek-v4-pro`
- 实际 reasoning effort：`max`
- 总 runtime：40 分 46 秒；agent execution 约 40 分钟。
- 10 分钟 guard 快照：526,011 tokens，未触发终止。
- Pier：1 completed，0 errors，reward 1.0。
- Verifier 回归组：324/324 passed；任务专项组：78/78 passed。
- 最终 patch：9 个文件，1,230 insertions，60 deletions，48,872 bytes。
- 完整 DSH session：10,793 events，2,499,698 bytes。
- 非重复 Token 总计：20,103,690；其中未缓存输入 73,053、cache read 19,880,192、cache write 0、输出 150,445、reasoning 112,481（reasoning 已包含在输出中）。
- 代理审计：151 条，全部 HTTP 200；固定传输 Session ID 全部匹配；记录到 12 次中途断流，DSH 均恢复并最终完成。

完整产物保存在本地 Pier jobs 目录中，公开仓库不包含该目录。

此前被 10 分钟 1M guard 截断、实际 reasoning effort 为 `high` 的异常轮已单独保留在 `deepswe-bandit-structured-nosec-directives-high-guard`，不得与本次正式 reward 1.0 结果混淆。

## 第 16 题正式结果

任务：`clack-async-autocomplete-options`

- Trial：`clack-async-autocomplete-options__BLQCUNM`
- Pier job ID：`87e4ba6e-88b0-462d-a328-77233233b12b`
- DSH 本地 Session ID：`session-86102519-552b-4e8c-8832-63207b0a78bc`
- 固定模型传输 Session ID：`session-31c511bb-1da1-43de-83c9-33e78a4373cd`
- Provider/model：`deepseek-official/deepseek-v4-pro`
- 实际 reasoning effort：`max`
- 总 runtime：42 分 57 秒；其中 environment setup 约 4 分 50 秒，agent execution 约 37 分 41 秒。
- 10 分钟 guard 快照：903,083 tokens，未触发终止。
- Pier：1 completed，0 errors，reward 0.0。
- Baseline：prompts 548/548、core 132/132，共 680/680 passed。
- 任务专项：core 58/59、prompts 23/25，共 81/84 passed；Pier 要求全部通过，因此得 0 分。
- 三个专项失败：重试等待期间 `loadError` 过早设为 `"fail"`；autocomplete wrapper 未渲染最终异步错误文本；fallbackOptions wrapper 显示 fallback 选项但未同时渲染最终错误文本。
- 最终 patch：6 个文件，1,823 insertions，47 deletions，63,117 bytes。
- 完整 DSH session：9,093 events，2,242,884 bytes。
- 非重复 Token 总计：13,475,510；其中未缓存输入 79,020、cache read 13,256,960、cache write 0、输出 139,530、reasoning 93,121（reasoning 已包含在输出中）。
- 代理审计：112 条，全部 HTTP 200；固定传输 Session ID 全部匹配；记录到 2 次中途断流。

完整产物保存在本地 Pier jobs 目录中，公开仓库不包含该目录。

该题基础镜像自带 Node 24。首次预模型尝试因旧 adapter 强制 `nvm install 22.23.2` 而在 Docker build 阶段失败，未产生模型 Token；失败记录仅保留在本地运行目录。Adapter 现改为优先使用主版本不低于 22 的镜像 Node，仅在缺少兼容 Node 时安装 22，并动态解析全局 npm 中的 DSH session persistence 模块。

仍未实现：

- Web GUI 配置控制面插件。
- 真正的同一 DSH 会话恢复 runner；stock headless 仍不支持 `--resume`，如需继续未完成会话，仍需实现 `ctx.agents.resume({ resumeSessionId })` 调用路径。
