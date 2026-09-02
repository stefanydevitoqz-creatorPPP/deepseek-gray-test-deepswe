# DeepSeek 灰测模型 DeepSWE 评测报告（当前快照）

- 报告版本：2026-09-02 current snapshot
- 数据截止：2026-09-02
- 固定数据集：113 题，SHA-256 `aaa82ceb8404dccc17689c9383f93dbcbc8f029a7601d2e3856a416f2cb89269`
- 被测对象：评测窗口内实际命中的 **DeepSeek 灰测模型**
- 请求路由别名：`deepseek-official/deepseek-v4-pro`（effort `max`）与 `deepseek-official/deepseek-v4-flash-vision-exp`（effort `high`）；二者是当时用于进入灰测后端的请求别名/配置档位，不表示被测对象就是目前公开的两个同名模型，也不作为两个独立模型分别计分
- 执行方式：DeepSWE Harness PTC/code 模式（`tools_mode=code`）
- 权威台账：[`artifacts/tasks.csv`](tasks.csv)
- 当前剩余题多模型统计：[`cache/remaining_tasks_multimodel_analysis_2026-09-02.json`](../cache/remaining_tasks_multimodel_analysis_2026-09-02.json)
- 旧版报告：2026-09-01 的 57 题困难样本报告，保留为历史快照，不作为当前统计来源

## 一、执行摘要

当前台账包含 113 道固定题目：

| 指标 | 数量 | 比例 |
|---|---:|---:|
| 已完成 | 87 | 77.0% |
| 通过 | 64 | 56.6%（以全 113 题为分母） |
| 未通过 | 23 | 20.4%（以全 113 题为分母） |
| 未运行 | 26 | 23.0% |

已完成题中的观测通过率为 **64/87 = 73.56%**。这是完成题条件下的诊断指标；当前完整 113 题成绩的直接已知部分是 **64/113 = 56.64%**，不能把二者混为一谈。

按当前灰测评测口径，新增的 9 月 2 日批次包含 26 个通过 `deepseek-v4-pro` 请求别名、effort `max` 进入灰测后端的唯一任务：**19 题原始通过、7 题原始未通过**；另有通过 `deepseek-v4-flash-vision-exp` 请求别名、effort `high` 进入同一评测对象范围的 `kgateway-consistent-hash-policy` 通过结果。当前台账新增批次快照为 **27 题、21 通过、6 未通过**。两种请求别名只为证据追溯而分开记录，计分对象统一是评测窗口内的 **DeepSeek 灰测模型**，不是目前公开的两个同名模型。

## 二、有效性与计分口径

只有完整完成 verifier、并能确认灰测路由和 PTC 配置的结果进入正式台账。证据中的 Pro/max 与 Flash-Vision/high 是请求路由别名/档位，不是对当前公开两个模型的身份声明。归档 job 名中的 `retryN` 只是任务编排重试序号：前序尝试可能因 DSH/agent 进程崩溃或异常早退而作废，也可能因启动命令行参数传递错误而未形成有效作答；这些作废轮次不计为模型失败，也不增加运行数。以下情况不作为模型失败：

- watchdog 在规定前 10 分钟窗口内触发的终止；
- DSH/agent 进程崩溃、Harness early exit、API 524、stream interruption 或资源异常；
- 启动命令行或参数转发错误，包括题目文本以前导 `- ` 开始时被严格参数解析误认为选项；
- Docker、工具链、依赖下载和 verifier 环境失败；
- 非灰测期间的普通模型结果；
- 同一模型 patch 的 verifier 重放不作为第二次模型答题。

环境问题需要有对照证据才归一化：

- `boa-hierarchical-evaluation-cancellation` 原始 verifier 因 cargo 工具链和依赖下载环境失败；修复工具链后用同一 patch 重放，baseline 7/7、新测试 17/17，因此按 reward 1.0 计入。
- `narwhals-rolling-window-suite` 的 6 项 baseline 失败在 pristine HEAD 中同样出现，专项测试全绿，因此按环境污染规则归一化为通过。
- `skrub-duration-encoding` 的 97 项 baseline 失败同样由 pristine HEAD 对照确认是既有环境兼容问题，专项测试 130/130 全绿，因此按同一规则计入通过。

## 三、当前结果与证据覆盖

当前结果来源分为两层：

1. 旧批次的 62 个任务级 durable 证据（含补入的 `fd-deterministic-multi-key-sorting`）已按公开白名单脱敏镜像到 `artifacts/tasks-historical/`。
2. 9 月 2 日新增的 26 个经 Pro/max 请求别名进入灰测后端的任务，已从外部 Pier 作业目录脱敏镜像到 `artifacts/tasks-2026-09-02/`；另有经 Flash-Vision/high 请求别名进入灰测后端的 `kgateway-consistent-hash-policy` 证据目录。两者的评测对象均记为 DeepSeek 灰测模型。

因此，原始证据目录数量少于当前台账完成数，并不表示新增结果没有证据，而是说明证据来源分批保存、此前尚未镜像到同一目录。新增公开镜像不包含完整 DSH session、完整模型交互记录、实时日志、Docker/Pier 运行目录或 API key。

`ink-grid-box-layout` 的 Flash 阶段 job 名保留 `retry6` 以追溯编排历史，但前六次并不是六次模型能力失败：该题指令以前导 `- ` 开始，原适配器命令少一个参数终止符，DSH 严格参数解析将题目文本误识别为命令行选项并导致进程崩溃。适配器增加第二个 `--` 后消除此问题；只有随后完整完成 verifier 的灰测轮次进入正式台账。其他带 retry 后缀的任务同样只保留重试序号，凡前序轮次属于进程崩溃、异常早退或命令行输入错误，均作废且不计分。

`promax_results.csv` 的 27 行中有 Boa 的原始环境失败和 verifier 重放两行；折叠 Boa 重放后是 26 个唯一灰测任务，原始日志口径为 19 通过、7 未通过。进一步将 Narwhals 的 pristine-HEAD baseline 环境失败归一化后，正式计分为 **20 通过、6 真实失败**。`kgateway` 通过另一请求别名进入灰测后端，不在该日志中，因此证据单独归档。

## 四、语言结果

以下按当前台账的 `语言` 字段统计；由于 `TASK_CATALOG.md` 与台账对 #37 `gql-incremental-graphql-delivery` 的语言标注存在差异，本报告以当前台账字段为准。

| 语言 | 总题数 | 已完成 | 通过 | 未通过 | 完成题通过率 |
|---|---:|---:|---:|---:|---:|
| Go | 34 | 28 | 24 | 4 | 85.7% |
| Python | 33 | 24 | 19 | 5 | 79.2% |
| TypeScript | 35 | 27 | 16 | 11 | 59.3% |
| Rust | 5 | 5 | 4 | 1 | 80.0% |
| JavaScript | 6 | 3 | 1 | 2 | 33.3% |

台账字段合计为 113 题；目录文件的语言分配为 Go 34、Python 34、TypeScript 35、JavaScript 5、Rust 5，存在一题语言归类差异。该差异不影响总分，但会影响语言分组，已在此明确。

## 五、9 月 2 日新增灰测模型结果（Pro/max 请求路由）

| 结果 | 任务 |
|---|---|
| 正式通过 | `abs-stepped-slices`, `actionlint-action-pinning-lint`, `adaptix-name-mapping-aliases`, `anko-default-function-arguments`, `anko-typed-variable-bindings`, `arcane-drift-detection-baselines`, `boa-hierarchical-evaluation-cancellation`, `cattrs-partial-structuring-recovery`, `drizzle-orm-window-function-builders`, `geo-shapeindex-serialization`, `go-genai-streamed-function-args`, `go-git-worktree-merge-conflicts`, `goreleaser-retry-publish-auditing`, `happy-dom-abort-pending-body-reads`, `httpx-deterministic-cookie-store`, `ink-grid-box-layout`, `narwhals-rolling-window-suite`, `optique-conditional-option-dependencies`, `prometheus-typed-label-sorting`, `wasmi-trap-coredumps` |
| 真实未通过 | `dateutil-rfc5545-timezone-interop`, `dynamodb-toolbox-conditional-attribute-requirements`, `fastapi-implicit-head-options`, `go-critic-doc-link-checker`, `httpx-streaming-json-iteration`, `kysely-window-grouping-helpers` |

`narwhals-rolling-window-suite` 的原始 reward 为 0，但专项测试全绿，6 项 baseline 失败在 pristine HEAD 中同样出现，因此正式计分归一化为通过。规范化后，经 Pro/max 请求别名进入灰测后端的新批次为 **20 通过、6 真实失败**；加上经 Flash-Vision/high 请求别名进入灰测后端的 `kgateway` 通过结果后，新增台账贡献为 **21 通过、6 真实失败**。这些都是灰测模型结果，不是目前公开两个模型的横向对比。

重点失败包括：

- `dateutil-rfc5545-timezone-interop`：TZID 序列化边界测试失败；
- `dynamodb-toolbox-conditional-attribute-requirements`：update 模式下 3 项自动条件合并测试失败；
- `fastapi-implicit-head-options`：`include_router` 的 `auto_head` 优先级链处理错误；
- `go-critic-doc-link-checker`：官方新测试退出码为 1；
- `httpx-streaming-json-iteration`：107/108 项专项测试通过；
- `kysely-window-grouping-helpers`：6 处 TS2578，类型签名过宽导致应拒绝调用被接受。

## 六、当前未运行的 26 道题

```text
katex-multicolumn-array-spans
kcp-go-multiplexed-kcp-streams
kombu-single-active-consumer-priority
koota-deferred-mutation-buffer
koota-entity-snapshot-rollback
langchain-request-coalescing
mashumaro-flattened-dataclass-fields
mnamer-daemon-watch-lifecycle
mobly-grouped-test-barriers
obsidian-linter-scoped-ignore-markers
ofetch-per-origin-circuit-breaker
opa-template-string-reconstruction
prometheus-transactional-reload-status
quill-shared-toolbar-focus
returns-validated-error-accumulation
scriggo-method-declarations
sql-formatter-bigquery-pipe-formatting
sqlite-utils-safe-import-checkpoints
testem-per-launcher-reports
tomlkit-toml-table-converters
true-myth-iterable-collection-combinators
vitest-duration-sharding
wazero-multi-module-snapshots
yaegi-go-embed-directives
yjs-map-conflict-detection
ytt-jsonpath-query-api
```

队列元数据中，这 26 题中有 25 题可在 queue、suspended 或 `voided_non_gray` 列表中找到；`sql-formatter-bigquery-pipe-formatting` 未运行，但没有被这些队列状态分类，属于当前队列元数据遗漏。它仍然是未运行题，不应当作失败。

## 七、其他模型在剩余题上的历史正确率

以下是这些模型在当前 26 道未运行题上的历史参考，不是本次灰测新实测。主指标为每题等权历史通过率；汇总运行率作为补充。缺少某题历史时不当作失败。

| 模型 | 历史覆盖 | 题目等权正确率 | 预计通过题数 | 汇总运行通过率 |
|---|---:|---:|---:|---:|
| Pro0813@max | 25/26 | **92.33%** | 23.08 | 59/64 = 92.19% |
| Grok 4.6@xhigh | 25/26 | **88.67%** | 22.17 | 48/55 = 87.27% |
| GPT-5.6 Sol@ultra | 26/26 | **86.13%** | 22.39 | 408/476 = 85.71% |
| GPT-5.6 Sol@max | 26/26 | **83.99%** | 21.84 | 373/453 = 82.34% |
| GPT-5.6 Terra@ultra | 26/26 | **82.59%** | 21.47 | 281/342 = 82.16% |
| GPT-5.5@xhigh | 26/26 | **79.18%** | 20.59 | 277/350 = 79.14% |
| GPT-5.6 Luna@max | 26/26 | **76.03%** | 19.77 | 335/438 = 76.48% |
| GLM-5.3@max | 25/26 | **74.00%** | 18.50 | 22/29 = 75.86% |
| DeepSeek V4 Flash@max | 24/26 | **73.61%** | 17.67 | 32/41 = 78.05% |

Pro0813 缺少 `langchain-request-coalescing` 的历史运行记录；在灰测模型得分预测中对这一题使用其他未运行 Python 题历史率的均值 95.83% 进行单独插补。Grok/GLM 缺少 `koota-entity-snapshot-rollback`；Flash 缺少该题和 `langchain-request-coalescing`。缺失记录均未被当作失败。

## 八、灰测模型 113 题得分估计

### 8.1 直接观测值

- 已完成题通过率：`64/87 = 73.56%`；
- 对完整 113 题的已知通过贡献：`64/113 = 56.64%`；
- 剩余未运行：26 题。

### 8.2 核心条件预测：Pro0813 逐题历史率迁移

对每道未运行题设 `X_i ~ Bernoulli(p_i)`，其中 `p_i` 为 Pro0813@max 在该题上的历史通过率；对 `langchain-request-coalescing` 使用 95.8333% 的明确插补值，并假设在给定 `p_i` 后各题条件独立。

- 预计剩余通过：**24.0417/26**；
- 预计最终通过：**88.0417/113**；
- 预计最终得分：**77.91%**；
- 剩余通过数标准差：约 **1.08**；
- 90% 条件预测范围：**86–90/113**；
- 95% 条件预测范围：**86–90/113**。

这是条件预测区间，不是实际成绩的无条件置信区间。它反映的是“Pro0813 的逐题历史难度可以迁移到灰测模型”的假设。

### 8.3 敏感性场景

- 使用 Pro0813 最近一次二元状态：25 道有有效历史运行的题中最近 24 题通过、1 题失败；对唯一 `0/0` 的 `langchain-request-coalescing` 仍使用 95.83% 插补。预计 **88.96/113 = 78.72%**；90% 条件范围约 **89–89**，95% 条件范围约 **88–89**。该场景偏乐观，因为把最近一次状态当成稳定概率。
- 使用 GPT-5.6 Sol@max 的逐题历史率：预计 **85.84/113 = 75.96%**；90% 条件范围约 **84–88**，95% 条件范围约 **83–88**。这是历史基线敏感性，不应与 Pro0813 预测机械平均。
- 若完全不对剩余题作任何假设，严格数学边界为 **64–90/113**，即 **56.64%–79.65%**。

## 九、失败、环境和清理分析

当前 23 条正式未通过记录应与以下内容分开：

- 环境污染归一化通过：Boa、Narwhals、Skrub；
- 进程崩溃、异常早退、命令行参数转发错误、watchdog、API 中断、构建失败和非灰测记录：不计为模型失败；
- 真实实现失败：baseline 正常而专项测试失败，或 baseline/专项测试明确证明模型补丁缺少目标行为。

清理后的 26 道未运行题中，队列显式标记了 11 道非灰测 void、5 道因通道失效而暂停的题目；其余排队状态也因全局 halt sentinel 而没有继续发车。`sql-formatter-bigquery-pipe-formatting` 是唯一没有出现在 queue/suspended/voided 分类中的未运行题，建议后续单独补充队列归类元数据，但不应改变成绩。

## 十、证据、复现与安全

当前公开/工作副本证据布局：

- 历史 62 条任务级证据（含补入的 `fd-deterministic-multi-key-sorting`）：`artifacts/tasks-historical/`；
- 当前新增灰测证据（26 个经 Pro/max 请求别名进入的任务）：`artifacts/tasks-2026-09-02/`；
- 当前新增 `kgateway` 灰测证据（经 Flash-Vision/high 请求别名进入）：同一目录下的 `kgateway-consistent-hash-policy/`；
- 统计输入：`_wipe_codex.json`、`_wipe_dsh.json`、`_wipe_grok.json`、`_wipe_zcode.json`、`deepswe_solmax_vs_dsh_promax.csv`；
- 当前统计生成脚本：`cache/build_current_2026-09-02.cjs`；
- 当前统计输出：`cache/remaining_tasks_multimodel_analysis_2026-09-02.json` 和 `.csv`。

证据搬运只保留任务级结果、verifier 输出、model patch、watchdog/worktree 摘要和元数据；完整 session、压缩对话、实时 proxy 日志、Docker/Pier 运行目录和 API key 不进入公开证据包。来源文件扫描未发现 `sk-[A-Za-z0-9]{20,}` 形式真实 key；配置中的 `${DEEPSEEK_API_KEY}` 仅作为进程环境占位符。

注意：当前源 `tasks.csv` 有 53 行未正确引用包含逗号的字段。状态、reward 和运行次数位于问题字段之前，仍可用支持引号/位置恢复的解析方法读取；费用、备注和末尾证据标志不能直接用普通 CSV 解析器解释。后续应生成一份标准 RFC 4180 CSV 镜像，避免下游工具误读。

## 十一、与旧版报告的变更

旧版 2026-09-01 报告描述的是主动选择的 57 题困难样本：40/57 通过，约 70.2%，并以 56 题为剩余集。它仍可用于历史对比，但不再代表当前台账。

本新版改用当前整理后的 113 题台账：87 题完成、64 题通过、23 题未通过、26 题未运行，并将剩余题模型历史率重算为当前 26 题集合。核心条件预测从旧版约 89–92/113 调整为当前约 **88/113，77.9%**，主要原因是更多历史上较容易的题目已经被完成，剩余集合的组成发生了变化。

## 十二、结论

当前最稳妥的报告结论是：

> 灰测模型在已完成 87 题上通过 64 题，完成题通过率为 73.6%。在把剩余 26 题的 Pro0813@max 逐题历史率作为条件迁移基线时，预计最终 DeepSWE 得分约为 **88/113，77.9%**；条件预测范围约 **86–90/113**。最近状态的乐观情景约为 89/113，Sol@max 历史基线情景约为 86/113。无假设严格边界仍是 64–90/113。该估计不包含未运行题的新实测结果，也不是无条件置信区间。
