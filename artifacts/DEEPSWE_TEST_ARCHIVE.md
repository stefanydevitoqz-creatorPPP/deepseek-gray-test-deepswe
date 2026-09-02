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

**v4-pro 请求路由**（请求别名由用户于 2026-08-31 21:32 发现，其他电脑同 API key；本次窗口观察到的灰测指纹包括英文 reasoning、`I'm` 相对频繁、首 token 等待较长和输出 token/s 偏低；`Let me`/`Hmm`/`I'll` 等词的具体密度可随路由和任务变化，不能把单一词频当作身份凭据）：

```text
session-8fe028d0-31b1-46b5-920c-591e78a73e71
session-6166250c-d03b-4cda-9c51-99c9b40b11bc
session-be68b190-2c99-4435-8b0e-0459ebc5730b
session-d058bf1a-3788-4571-b76e-9af16b33b144
session-660f6500-8781-426f-afb0-153fc3e8a489
```

测试计划（用户定）：同一灰测通道连续运行两题，观察跑分后灰测资格是否被收回。配置口径：`tools_mode: code`（PTC 为本轮灰测触发条件）+ `flash-vision-exp` 请求别名用 `expected_reasoning_effort: high` / `pro` 请求别名用 `max` + 1.5M/600s guard（仅限**开跑后前 10 分钟**窗口，由容器内 watchdog 独占执行；宿主机监控只观测不杀——口径 2026-08-31 经用户确认修正）。这里的 `flash-vision-exp`、`pro`、Flash-Vision/high 与 Pro/max 都是进入灰测后端时使用的路由别名/档位；实际被测对象统一记为 **DeepSeek 灰测模型**，不等同于目前公开的两个同名模型。

### 灰测会话特征审计摘要

以下是对本地灰测 session JSONL/zstd 与 watchdog 结构化记录的汇总，不公开完整 session、模型交互或实时日志。统计重点是会话行为特征，不把单个字段当作身份硬阈值。

| 指标 | 灰测 Pro 路由样本 | 解释 |
|---|---:|---|
| 可对齐的 `deepseek-v4-pro` 灰测 session | 51 条 | 由 55 条 watchdog 记录对齐；另有 4 条没有可公开对齐的 session |
| 首 assistant 流事件 | 中位数 2.67s（P10 1.32s，P90 3.89s） | 底层流通常很快出现，不能把“首 token 慢”理解成所有流事件都慢 |
| 首个非空增量 | 中位数 8.73s（P10 2.33s，P90 77.49s） | 首个有意义内容存在明显长尾 |
| 首 reasoning 增量 | 中位数 11.12s（P10 8.72s，P90 93.24s） | 更能反映灰测 reasoning 开始输出的等待特征 |
| `I'm`/`I’m` 密度 | 加权约 0.93 次/千字符；session 中位数约 1.54 次/千字符 | 51 条 session 合计约 5,856 次；是风格信号，不是身份证明 |
| output token/s | 中位数约 22.4 | 包含等待、工具和调度空档，不能当纯解码速度 |
| reasoning token/s | 中位数约 6.62 | 支持“reasoning 生成偏慢”的定性判断 |
| reasoning 字符/s | 中位数约 32.7 | 与低 reasoning token/s 方向一致 |

明确的非灰测 GPT-5.6 对照 session 未出现 `I'm`，但该会话不是同任务同负载的配对实验；其首个非空增量约 10.7s，也说明单次延迟不能作为硬阈值。Flash-Vision 辅助记录只有 6 条，样本太少，不用来建立严格的灰测/非灰测速度界线。

因此，本次会话记录支持的定性结论是：**灰测 session 通常很快建立 assistant 流，但首个非空 reasoning 内容存在较长等待和长尾；reasoning 中 `I'm` 较常见，reasoning token/s 处于较低水平。** 首 token 延迟、`I'm` 密度、token/s、模型标签和单个任务 reward 都只能与已验证 Session、PTC/code 配置、watchdog、会话时间线和路由对照联合使用。

### 2026-08-21 早期有效运行

| 批次 | 任务 | 请求路由/档位 | 结果 | Token（去重） | Verifier / 判定 | 备注 |
|---|---|---|---|---:|---|---|
| 1 | `bandit-structured-nosec-directives` | `deepseek-v4-pro` / `max` | **通过 reward 1.0** | 20,103,690 | 回归 324/324；专项 78/78 | runtime 40m46s；Trial `bandit-structured-nosec-directiv__MXYnhjB`；完整证据在历史证据镜像 |
| 2 | `clack-async-autocomplete-options` | `deepseek-v4-pro` / `max` | 未通过 reward 0.0 | 13,475,510 | 基线 680/680；专项 81/84 | runtime 42m57s；3 个异步错误展示场景失败；Trial `clack-async-autocomplete-options__BLQCUNM` |

### 2026-08-31 至 2026-09-02 正式运行汇总

以下表是本归档的主表：每一行对应一次完成 verifier、可计入正式台账的运行；运行顺序按实际发车/录入顺序保留，不按题号排序。`观测值`表示超时杀进程或 watchdog 只留下监控快照，不能冒充完整 session 去重值。

当前主表包含早期 2 次有效运行和 68 次后续正式运行，共 70 条详细运行记录。2026-09-02 新增批次另有 17 题此前只写入台账和证据目录、尚未在本表展开；补充表紧接在主表后，补齐当前 87 题的全部正式结果。

| 序 | 任务 | 请求路由/通道 | 档位 | 结果 | Token（去重/观测） | Verifier / 判定摘要 | Trial / 备注 |
|---:|---|---|---|---|---:|---|---|
| 1 | `python-statemachine-state-data-scoping` | Flash-Vision / `fed63608` | high（PTC） | **通过 1.0** | 8,538,168 | 基线 1407 零回归；专项 72/72 | `python-statemachine-state-data-s__ujE4Hhm`；91m29s，超时后优雅收敛 |
| 2 | `vulture-persistent-analysis-cache` | Pro / `6166250c` | max（PTC） | **通过 1.0** | 2,761,774 | 基线 298 零回归；专项 24/24 | `vulture-persistent-analysis-cach__iAVtBGi`；61m自然完成 |
| 3 | `meriyah-explicit-resource-declarations` | Pro / `8fe028d0` | max（PTC） | 未通过 0.0 | 6,720,018 | 基线 94,644 零回归；专项 65/66 | `meriyah-explicit-resource-declar__mhZYBoq`；85m自然完成 |
| 4 | `gql-incremental-graphql-delivery` | Pro / `d058bf1a` | max（PTC） | **通过 1.0** | 14,928,554 | 基线 870 零回归；专项 18/18 | `gql-incremental-graphql-delivery__aQ6hCKT`；约90m超时收敛后通过 |
| 5 | `oxvg-structural-selector-preservation` | Pro / `660f6500` | max（PTC） | 未通过 0.0 | 7,362,540（观测） | 专项 8/10 | `oxvg-structural-selector-preserv__bZSaear`；524 卡死后超时，无法导出 session |
| 6 | `sqlfmt-create-table-ddl-formatting` | Pro / `be68b190` | max（PTC） | **通过 1.0** | 6,767,281（观测） | 基线零回归；专项 79/79 | `sqlfmt-create-table-ddl-formatti__7eoBuBu`；超时收敛，session 导出丢失 |
| 7 | `opa-rego-rule-profiling` | Pro / `6166250c` | max（PTC） | **通过 1.0** | 2,938,260 | 基线零回归；专项全过 | `opa-rego-rule-profiling__4veCq9G`；约102m自然完成 |
| 8 | `testem-bail-on-test-failure` | Pro / `d058bf1a` | max（PTC） | **通过 1.0** | 5,709,658 | 基线零回归；专项全过 | `testem-bail-on-test-failure__fjx9c2F`；约121m自然完成 |
| 9 | `pest-character-class-coalescing` | Pro / `8fe028d0` | max（PTC） | **通过 1.0** | 4,028,541（观测） | 基线零回归；专项 104/104 | `pest-character-class-coalescing__dijXkUZ`；首跑 HTTP 524 作废，复跑通过 |
| 10 | `igel-persist-feature-schema` | Pro / `660f6500` | max（PTC） | 未通过 0.0 | 3,821,675 | 专项 6/24 | `igel-persist-feature-schema__Z3cU4Fv`；120m超时收敛 |
| 11 | `koota-pair-relation-tracking` | Pro / `be68b190` | max（PTC） | **通过 1.0** | 7,444,481（观测） | 基线零回归；专项 38/38 | `koota-pair-relation-tracking__teyz2aj`；120m超时收敛后通过 |
| 12 | `onedump-dump-encryption-pipeline` | Pro / `660f6500` | max（PTC） | 未通过 0.0 | 2,024,716 | 专项测试包编译失败 | `onedump-dump-encryption-pip__nssq5bj`；55m自然结束 |
| 13 | `eicrud-keyset-pagination-cursor` | Pro / `6166250c` | max（PTC） | 未通过 0.0 | 9,173,087 | 基线 234 零回归；专项执行失败 | `eicrud-keyset-pagination-cursor__kjszwkn`；约112m自然结束 |
| 14 | `textual-kitty-key-phases` | Pro / `d058bf1a` | max（PTC） | **通过 1.0** | 7,925,841 | 基线零回归；专项 23/23 | Trial 名截断；约56m自然结束 |
| 15 | `helm-array-merge-strategies` | Pro / `8fe028d0` | max（PTC） | **通过 1.0** | 8,790,449 | 全部测试通过 | `helm-array-merge-strategies__pjqvm9m`；约78m自然结束 |
| 16 | `kombu-virtual-queue-dead-lettering` | Pro / `be68b190` | max（PTC） | **通过 1.0** | 7,032,348 | 基线 1453 零回归；专项 78/78 | `kombu-virtual-queue-dead-letteri__effkfnb`；异常早退后重试成功 |
| 17 | `aiomonitor-task-snapshots-diff` | Pro / `660f6500` | max（PTC） | **通过 1.0** | 9,188,941 | 全部测试通过 | `aiomonitor-task-snapshots-diff__wrpce47`；约22m自然完成 |
| 18 | `superjson-error-stack-serialization` | Pro / `be68b190` | max（PTC） | 未通过 0.0 | 2,538,638 | 专项 114/116 | `superjson-error-stack-serializat__bfqpwzh`；约32m自然结束 |
| 19 | `fastapi-deprecation-response-headers` | Pro / `8fe028d0` | max（PTC） | **通过 1.0** | 3,288,727 | 基线 3174 零回归；专项 137/137 | `fastapi-deprecation-response-hea__32zu6m4`；约40m自然结束 |
| 20 | `obsidian-linter-auto-table-of-contents` | Pro / `d058bf1a` | max（PTC） | 未通过 0.0 | 4,247,163 | 基线 1202 零回归；专项 37/41 | `obsidian-linter-auto-table-of-co__6gqc24y`；早退后重试，最终正常判错 |
| 21 | `happy-dom-deterministic-intersectionobserver` | Pro / `660f6500` | max（PTC） | 未通过 0.0 | 3,671,732 | 专项 14/15 | `happy-dom-deterministic-intersec__a4rmvw2`；约48m自然结束 |
| 22 | `pwntools-tube-multiplexing` | Pro / `6166250c` | max（PTC） | **通过 1.0** | 5,434,621 | 专项 73/73 | `pwntools-tube-multiplexing__f536yjn`；约80m自然结束 |
| 23 | `cliffy-config-file-parsing` | Pro / `8fe028d0` | max（PTC） | **通过 1.0** | 5,631,966 | 全部测试通过（459+37） | `cliffy-config-file-parsing__9khib2t`；约36m自然结束 |
| 24 | `termenv-preserve-ansi-resets` | Pro / `6166250c` | max（PTC） | 未通过 0.0 | 1,689,801 | 专项套件失败 | Trial 名截断；约37m自然结束 |
| 25 | `koota-composite-trait-aspects` | Pro / `be68b190` | max（PTC） | 未通过 0.0 | 22,119,043 | 专项 49/51 | Trial 名截断；约75m自然结束 |
| 26 | `expr-try-catch-errors` | Pro / `d058bf1a` | max（PTC） | **通过 1.0** | 14,429,790 | 全部测试通过 | `expr-try-catch-errors__mab7dem`；约65m自然结束 |
| 27 | `etree-xml-diff-patch` | Pro / `660f6500` | max（PTC） | **通过 1.0** | 3,260,751 | 全部测试通过 | Trial 名部分省略；约55m自然结束 |
| 28 | `bandit-interprocedural-taint-checks` | Pro / `8fe028d0` | max（PTC） | **通过 1.0** | 4,002,705 | 基线 322；专项 85/85 | Trial 名部分省略；约38m自然结束 |
| 29 | `dasel-html-document-format` | Pro / `be68b190` | max（PTC） | **通过 1.0** | 2,366,071 | 全部测试通过 | Trial 名部分省略；约42m自然结束 |
| 30 | `numba-stencil-boundary-modes` | Pro / `6166250c` | max（PTC） | **通过 1.0** | 6,335,877 | 基线 824 零回归；专项 32/32 | —；自然结束 |
| 31 | `psd-tools-blend-range-api` | Pro / `660f6500` | max（PTC） | **通过 1.0** | 5,446,596 | 全部测试通过 | —；自然结束 |
| 32 | `arktype-json-schema-refs-dependencies` | Pro / `d058bf1a` | max（PTC） | **通过 1.0** | 8,886,077 | 全部测试通过 | —；自然结束 |
| 33 | `pebble-durability-wait-apis` | Pro / `8fe028d0` | max（PTC） | **通过 1.0** | 4,737,462 | 全部测试通过 | —；自然结束 |
| 34 | `task-task-graph-export` | Pro / `be68b190` | max（PTC） | **通过 1.0** | 5,121,907 | 基线与专项全过 | —；自然结束 |
| 35 | `csstree-shorthand-expansion-compression` | Pro / `660f6500` | max（PTC） | 未通过 0.0 | 4,027,289 | 基线零回归；专项 exit 5 | —；agent 本地测试全过，verifier 隐藏边角失败 |
| 36 | `kea-atomic-signal-selectors` | Pro / `6166250c` | max（PTC） | 未通过 0.0 | 6,515,418 | 新功能 14/14；基线 155/156 | —；约60m自然结束 |
| 37 | `dynamodb-toolbox-lazy-recursive-schemas` | Pro / `d058bf1a` | max（PTC） | **通过 1.0** | 18,757,252 | 基线 1334 零回归；专项 37/37 | —；约72m自然结束 |
| 38 | `scc-bounded-memory-spilling` | Pro / `8fe028d0` | max（PTC） | **通过 1.0** | 6,634,096 | 基线与专项双绿 | —；约45m自然结束 |
| 39 | `tengo-destructuring-bindings` | Pro / `be68b190` | max（PTC） | **通过 1.0** | 8,265,190 | 基线与专项双绿 | —；约45m自然结束 |
| 40 | `tengo-callable-instance-isolation` | Pro / `660f6500` | max（PTC） | **通过 1.0** | 6,410,130 | 基线与专项双绿 | —；约48m自然结束 |
| 41 | `httpx-multipart-response-parsing` | Pro / `d058bf1a` | max（PTC） | 未通过 0.0 | 3,192,061 | 基线 1348 零回归；专项 121/122 | —；header folding 边角失败 |
| 42 | `participle-grammar-conflict-analysis` | Pro / `8fe028d0` | max（PTC） | **通过 1.0** | 2,966,156 | 基线与专项双绿 | —；约37m自然结束 |
| 43 | `abs-module-cache-flags` | Pro / `be68b190` | max（PTC） | **通过 1.0** | 5,131,542 | 基线与专项双绿 | —；约38m自然结束 |
| 44 | `effect-sse-httpapi-streaming` | Pro / `6166250c` | max（PTC） | **通过 1.0** | 35,096,129 | 基线 70 零回归；专项 47/47 | —；早退后重试，约77m自然结束 |
| 45 | `updo-policy-alerting` | Pro / `be68b190` | max（PTC） | 未通过 0.0 | 6,246,014 | 基线零回归；notifications 构建失败 | —；约28m自然结束 |
| 46 | `awilix-async-container-initialization` | Pro / `d058bf1a` | max（PTC） | **通过 1.0** | 13,838,080 | 基线 190 零回归；专项 24/24 | —；约42m自然结束 |
| 47 | `obsidian-linter-link-format-conversion` | Pro / `660f6500` | max（PTC） | 未通过 0.0 | 9,086,735 | 基线 1186 零回归；专项 59/60 | —；约27m自然结束 |
| 48 | `bandit-incremental-cache-control` | Pro / `d058bf1a` | max（PTC） | **通过 1.0** | 17,084,675 | 基线 341 零回归；专项 89/89 | —；约39m自然结束 |
| 49 | `ts-pattern-match-each` | Pro / `be68b190` | max（PTC） | **通过 1.0** | 4,671,786 | 基线 6 零回归；专项 85/85 | —；约23m自然结束 |
| 50 | `valibot-recursive-schema-composition` | Pro / `6166250c` | max（PTC） | **通过 1.0** | 16,614,710 | 基线 208 零回归；专项 9/9 | —；约95m自然结束 |
| 51 | `helm-unified-manifest-stream` | Pro / `660f6500` | max（PTC） | **通过 1.0** | 7,059,876 | 基线与专项双绿 | —；约53m自然结束 |
| 52 | `claude-code-by-agents-recursive-delegation` | Pro / `be68b190` | max（PTC） | 未通过 0.0 | 2,615,571 | 基线 44 全过；专项 2/7 | —；递归委派核心路径未生效 |
| 53 | `koota-query-predicates` | Pro / `8fe028d0` | max（PTC） | **通过 1.0** | 9,765,321 | 基线 173 零回归；专项 43/43 | —；约55m自然结束 |
| 54 | `textual-richlog-follow-state` | Pro / `d058bf1a` | max（PTC） | **通过 1.0** | 9,310,230 | 基线 13 零回归；专项 24/24 | —；约71m自然结束 |
| 55 | `skrub-duration-encoding` | Flash-Vision / `a29d1a42` | **通过归一化 1.0** | 1,134,105（观测） | 专项 130/130；97 项 baseline 失败与 pristine HEAD 相同 | 原始 reward 0.0，环境污染归一化；约50m自然结束 |
| 56 | `query-persist-restored-query-state` | Flash-Vision / `11aeab50` | high（PTC） | **通过 1.0** | 1,023,138 | 基线与专项双绿 | retry4 编排轮次；约35m |
| 57 | `ipython-session-bundle-replay` | Flash-Vision / `5f2538b6` | high（PTC） | **通过 1.0** | 135,920 | 基线 29；专项 17/17 | retry4 编排轮次；约41m |
| 58 | `kgateway-consistent-hash-policy` | Flash-Vision / `5f2538b6` | high（PTC） | **通过 1.0** | 1,363,960（观测） | 基线与 `TestConsistentHash` 双绿 | retry10 编排轮次；约46m自然结束 |
| 59 | `ink-grid-box-layout` | Pro / `882494eb` | max（PTC） | **通过 1.0** | 7,608,675 | 基线与专项双绿 | 参数终止符修复后正式运行；约79.8m |
| 60 | `boa-hierarchical-evaluation-cancellation` | Pro / `660f6500` | max（PTC） | **通过归一化 1.0** | 12,067,942 | 修复 verifier 工具链后重放：基线 7/7；专项 17/17 | 原始环境下载失败，按环境修正归一化 |
| 61 | `go-critic-doc-link-checker` | Pro / `sb9kTr8` | max（PTC） | 未通过 0.0 | 4,694,804 | 基线通过；官方专项 exit 1 | Flash 与 Pro 两通道同败，真实实现失败 |
| 62 | `goreleaser-retry-publish-auditing` | Pro / `zMfrrQp` | max（PTC） | **通过 1.0** | 8,143,854 | 基线与专项双绿 | 53.8m；100 次调用 |
| 63 | `httpx-streaming-json-iteration` | Pro / `oLdKwtA` | max（PTC） | 未通过 0.0 | 2,052,335 | 基线通过；专项 107/108 | 与 Flash 重试同一实现缺口；25.8m |
| 64 | `kysely-window-grouping-helpers` | Pro / `cqxf8R8` | max（PTC） | 未通过 0.0 | 9,308,870 | 基线通过；专项编译失败，6 处 TS2578 | 两次早退弃权后完成正式运行 |
| 65 | `narwhals-rolling-window-suite` | Pro / `rBEfYN7` | max（PTC） | **通过归一化 1.0** | 18,194,761 | 模型专项全绿；6 项 baseline 在 pristine HEAD 同样失败 | 环境污染归一化；Flash 与 Pro 失败集合一致 |
| 66 | `optique-conditional-option-dependencies` | Pro / `feMkWrc` | max（PTC） | **通过 1.0** | 12,598,706 | 基线与专项双绿 | 50.5m；113 次调用 |
| 67 | `prometheus-typed-label-sorting` | Pro / `nPTD9mH` | max（PTC） | **通过 1.0** | 1,940,038 | 基线与专项双绿 | 37.6m；44 次调用 |
| 68 | `wasmi-trap-coredumps` | Pro / `ixY4NfJ` | max（PTC） | **通过 1.0** | 11,642,400 | 基线与专项双绿 | 54.6m；96 次调用 |

### 2026-09-02 新增批次补充表

以下 17 题属于 2026-09-02 新增 Pro/max 批次。它们此前已经写入当前台账和 `artifacts/tasks-2026-09-02/` 证据目录，但未列入上面的历史运行明细；本表补齐当前 87 题的完整正式结果集合。运行顺序按批次录入顺序保留，不按题号排序。

| 序 | 任务 | 语言 | 请求路由/档位 | 结果 | Token | Verifier / 判定摘要 |
|---:|---|---|---|---|---:|---|
| 1 | `abs-stepped-slices` | Go | Pro/max（PTC） | **通过 1.0** | 2,109,989 | 完整 verifier 通过 |
| 2 | `actionlint-action-pinning-lint` | Go | Pro/max（PTC） | **通过 1.0** | 8,899,877 | 完整 verifier 通过 |
| 3 | `adaptix-name-mapping-aliases` | Python | Pro/max（PTC） | **通过 1.0** | 14,837,240 | 完整 verifier 通过 |
| 4 | `anko-default-function-arguments` | Go | Pro/max（PTC） | **通过 1.0** | 5,258,544 | 完整 verifier 通过 |
| 5 | `anko-typed-variable-bindings` | Go | Pro/max（PTC） | **通过 1.0** | 4,802,863 | 完整 verifier 通过 |
| 6 | `arcane-drift-detection-baselines` | Go | Pro/max（PTC） | **通过 1.0** | 7,018,976 | 完整 verifier 通过 |
| 7 | `cattrs-partial-structuring-recovery` | Python | Pro/max（PTC） | **通过 1.0** | 5,466,188 | 完整 verifier 通过 |
| 8 | `dateutil-rfc5545-timezone-interop` | Python | Pro/max（PTC） | 未通过 0.0 | 5,307,308 | 完整 verifier；专项边界测试失败 |
| 9 | `drizzle-orm-window-function-builders` | TypeScript | Pro/max（PTC） | **通过 1.0** | 5,357,651 | 完整 verifier 通过；本地新增题，历史对照缺失 |
| 10 | `dynamodb-toolbox-conditional-attribute-requirements` | TypeScript | Pro/max（PTC） | 未通过 0.0 | 3,988,561 | 完整 verifier；专项测试失败 |
| 11 | `fastapi-implicit-head-options` | Python | Pro/max（PTC） | 未通过 0.0 | 8,562,392 | 完整 verifier；`include_router`/`auto_head` 优先级测试失败 |
| 12 | `fd-deterministic-multi-key-sorting` | Rust | 历史灰测快照回填 | **通过 1.0** | — | 基线与专项新测试双绿；9 月 1 日报告回填，未重复运行 |
| 13 | `geo-shapeindex-serialization` | Go | Pro/max（PTC） | **通过 1.0** | 9,073,379 | 完整 verifier 通过 |
| 14 | `go-genai-streamed-function-args` | Go | Pro/max（PTC） | **通过 1.0** | 5,394,444 | 完整 verifier 通过 |
| 15 | `go-git-worktree-merge-conflicts` | Go | Pro/max（PTC） | **通过 1.0** | 7,645,478 | 完整 verifier 通过 |
| 16 | `happy-dom-abort-pending-body-reads` | TypeScript | Pro/max（PTC） | **通过 1.0** | 11,596,933 | 完整 verifier 通过 |
| 17 | `httpx-deterministic-cookie-store` | TypeScript | Pro/max（PTC） | **通过 1.0** | 3,228,753 | 完整 verifier 通过 |

补充表包含 16 个新增正式运行和 1 个历史回填：其中 13 个新增正式通过、3 个真实未通过；`fd-deterministic-multi-key-sorting` 不增加新的模型运行数。因此，上面的 70 条详细运行记录加上补充表中的 16 个此前未展开的正式运行，覆盖当前台账的 87 个已完成任务；历史回填任务作为新增补充记录列出，不增加新的模型运行数。

### 作废、异常和未计分尝试

以下记录用于解释为什么某些尝试没有进入上表或 `tasks.csv`，不属于模型成绩。表中“原因”统一限定为进程崩溃、异常早退、输入命令行参数传递错误、watchdog 会话退役或 verifier 环境失败。

| 任务 | 路由/档位 | 状态 | Token / 请求 | 作废原因 | 后续处理 |
|---|---|---|---|---|---|
| `gql-incremental-graphql-delivery` | 旧主通道 / Pro max | 作废 | — | 灰测窗口结束，后端切回常规模型；思维链特征不匹配 | 不计分，后续有效 Pro/max 运行另记 |
| `obsidian-linter-auto-table-of-contents` | Pro max / `d058bf1a` | 作废后重试 | — | DSH/agent 异常早退 | 后续重试形成正式判定 |
| `kombu-virtual-queue-dead-lettering` | Pro max / `be68b190` | 作废后重试 | — | DSH/agent 异常早退 | 后续重试通过 |
| `kysely-window-grouping-helpers` | Pro max / `660f6500` | 作废 | 36 请求全 200 | agent 约8分钟非零崩溃，异常早退 | 改队尾待重试 |
| `kysely-window-grouping-helpers` | Pro max / `8fe028d0` | 作废 | 37 请求全 200 | 第二次异常早退，exit 143；patch 为空 | 停止重试；后续其他有效运行入表 |
| `wasmi-trap-coredumps` | Pro max / `8fe028d0` | 作废 | 33 请求全 200 | agent 约15分钟非零崩溃，异常早退 | 后续有效运行通过 |
| `wasmi-trap-coredumps` | Pro max / `be68b190` | 作废 | 28 请求全 200 | 第二次异常早退，exit 143；仍在探索 | 后续有效运行通过 |
| `scriggo-method-declarations` | Pro max / `8fe028d0` | 作废 | 1,566,956（前210秒） | 前10分钟 token watchdog 触发，会话退役 | 会话停用，不入 CSV |
| `scriggo-method-declarations` | Pro max / `5bbb6944` | 作废 | 1,540,236（前234秒） | 替换会话再次触发 watchdog | 会话停用，不入 CSV |
| `scriggo-method-declarations` | Pro max / `f3e46bd4` | 作废 | 1,527,025（前160秒） | 最后备用会话再次触发 watchdog | 无可用灰测 ID，不再排队 |
| `boa-hierarchical-evaluation-cancellation` | Pro max / `660f6500` | 作废 | 42,585,171 | verifier 下载 criterion 失败，环境不完整 | 修复环境后同一 patch 重放，正式归一化通过 |
| `prometheus-transactional-reload-status` | Pro max / `6166250c` | 作废 | 1,533,578（前338秒） | 前10分钟 token watchdog 触发，会话退役 | 不计分，从队列移除 |
| `ink-grid-box-layout` | Flash-Vision/high | 作废 | — | 题目文本以 `- ` 开头，被 DSH 严格参数解析当作命令行选项，导致进程崩溃 | 增加第二个 `--` 后改用 Pro/max 完整运行通过 |
| `pest-character-class-coalescing` | Pro max | 作废 | — | 连续5次 HTTP 524，上游网关中断 | 完整复跑通过 |

### 统一口径说明

- `retryN` 是任务编排序号，不是模型版本，也不是额外计分轮次。
- DSH/agent 进程崩溃、异常早退、启动命令或参数转发错误、watchdog 终止、API/网关中断、verifier 环境失败，均不计为模型失败；只有完整 verifier-backed 运行进入正式台账。
- `Boa`、`Narwhals`、`Skrub` 的环境污染只有在 pristine HEAD 对照或修复后 verifier 重放能够支持时才归一化为通过。
- 当前 113 题快照为 87 题完成、64 题正式通过、23 题真实未通过、26 题未运行。上述主表是归档中有详细运行记录的子集，不等同于完整 113 题台账。


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

## 早期运行审计补充

早期两次运行的字段级审计信息也采用与主表一致的表格格式；完整 DSH session、Pier jobs 和实时日志只保留在本地，不属于公开仓库。

| 任务 | Pier job | DSH session | 10 分钟 guard | Patch | 代理审计 | 结果与补充 |
|---|---|---|---:|---|---:|---|
| `bandit-structured-nosec-directives` | `e26d6fd3-64e5-445a-aba7-885f5a086491` | `session-5786115d-6a7e-4ea3-a260-e9f336e09146` | 526,011 | 9 文件；+1,230/−60；48,872 bytes | 151 次，全部 HTTP 200 | **通过 1.0**；324/324 回归；78/78 专项；总 Token 20,103,690；runtime 40m46s；完整 DSH session 10,793 events |
| `clack-async-autocomplete-options` | `87e4ba6e-88b0-462d-a328-77233233b12b` | `session-86102519-552b-4e8c-8832-63207b0a78bc` | 903,083 | 6 文件；+1,823/−47；63,117 bytes | 112 次，全部 HTTP 200 | 未通过 0.0；基线 680/680；专项 81/84；总 Token 13,475,510；runtime 42m57s；失败为异步错误展示的 3 个专项场景 |

第 13 题此前另有一次 `high` 档位 guard 截断记录，因 watchdog/档位异常不计入正式结果；第 16 题首次构建尝试因旧 adapter 强制安装 Node 22 在 Docker build 阶段失败、未产生模型 Token，也不计入正式运行。两项均只作本地审计追溯。

## 实现与恢复限制

- Web GUI 配置控制面插件尚未纳入本公开归档。
- 当前 stock headless 不支持 `--resume`；如需继续未完成会话，仍需通过 `ctx.agents.resume({ resumeSessionId })` 增加专用恢复路径。
