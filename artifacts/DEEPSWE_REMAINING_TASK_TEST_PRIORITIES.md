# 剩余题测试优先级：验证Pro优势与校准灰测得分

> 目标：用尽量少的新增灰测任务，判断灰测是否保留Pro0813在部分剩余题上的特长，并估计剩余题中灰测相对Pro的提升幅度。
> 范围：未完成56题。
> Pro口径：逐题历史`通过/运行`长期率 + 最近一次二值状态。
> 其他模型口径：Codex / Sol@max、Sol@ultra、Terra@ultra，Grok 4.6@xhigh，GLM-5.3@max的可用历史trial；每题先算模型自己的长期率，再对可用模型等权。

## 一、先给结论

建议不要按Pro0813最近一次“通过/失败”简单抽样，而采用两段式最小验证：

### 第一段：验证Pro相对优势，建议先跑8题

优先任务：

1. `kgateway-consistent-hash-policy`
2. `ink-grid-box-layout`
3. `skrub-duration-encoding`
4. `query-persist-restored-query-state`
5. `ipython-session-bundle-replay`
6. `narwhals-rolling-window-suite`
7. `go-critic-doc-link-checker`
8. `httpx-streaming-json-iteration`

这些题Pro0813历史长期率为100%，而其他代表模型均值约38.5%–59.6%，Pro优势约40–71个百分点。8题覆盖Go、Python、TypeScript，且每题Pro至少有2次历史运行。

用这8题检验：

- 灰测若通过至少7题，说明它大概率保留了Pro在这些任务上的特长；
- 灰测若只通过4–5题，说明Pro的优势不能直接迁移到灰测；
- 灰测若通过2–3题，说明即便剩余题整体容易，仍存在明显任务类型回归。

### 第二段：校准Pro历史弱项，建议再跑6题

优先任务：

1. `boa-hierarchical-evaluation-cancellation`
2. `kysely-window-grouping-helpers`
3. `wasmi-trap-coredumps`
4. `goreleaser-retry-publish-auditing`
5. `optique-conditional-option-dependencies`
6. `prometheus-typed-label-sorting`

前3题是Pro0813最近一次仍失败的剩余任务；后3题虽然最近状态已通过，但长期历史率只有33%–50%，仍是Pro的高错误率任务。它们覆盖Rust、TypeScript、Go，能够检验灰测是否延续已测难题上的修复能力。

这6题中，若灰测通过4题以上，说明灰测在Pro薄弱题上仍有显著增益；若只通过2题或更少，则最终分数应向保守长期代理靠近。

## 二、统计背景：为什么这两段比随机抽题更有效

剩余题对所有模型都比已测57题容易，但Pro优势并不均匀。按剩余题逐题长期率：

| 模型 | 已测57题长期均值 | 剩余题长期均值 | 剩余题覆盖 |
|---|---:|---:|---:|
| Pro0813@max | 34.8% | **88.3%** | 54/56 |
| GPT-5.6 Sol@max | 52.2% | **82.3%** | 55/56 |
| GPT-5.6 Sol@ultra | 51.8% | **81.6%** | 55/56 |
| Grok 4.6@xhigh | 48.6% | **81.0%** | 54/56 |
| GPT-5.6 Terra@ultra | 50.6% | **80.3%** | 55/56 |
| GLM-5.3@max | 53.4% | **74.8%** | 54/56 |
| **灰测当前** | **70.2%** | 未测 | 0/56 |

所有模型剩余题均比已测集高21–54个百分点，证明前57题确实是历史难题集。但Pro的88.3%并不代表每题都强：它是很多100%题与少数低率题混合后的平均。

## 三、Pro相对其他模型的优势排名

下表按“Pro逐题长期率 − 其他5个代表配置可用率的等权平均”排序。只有至少4个其他配置有数据的任务才纳入排名。

| 排名 | 任务 | 语言 | Pro历史率 | 其他模型均值 | Pro优势 |
|---:|---|---|---:|---:|---:|
| 1 | `kgateway-consistent-hash-policy` | Go | 100.0% | 28.6% | **+71.4pp** |
| 2 | `ink-grid-box-layout` | TypeScript | 100.0% | 37.8% | **+62.2pp** |
| 3 | `skrub-duration-encoding` | Python | 100.0% | 38.5% | **+61.5pp** |
| 4 | `query-persist-restored-query-state` | TypeScript | 100.0% | 40.6% | **+59.4pp** |
| 5 | `ipython-session-bundle-replay` | Python | 100.0% | 55.7% | **+44.3pp** |
| 6 | `narwhals-rolling-window-suite` | Python | 100.0% | 56.8% | **+43.2pp** |
| 7 | `go-critic-doc-link-checker` | Go | 100.0% | 58.7% | **+41.3pp** |
| 8 | `httpx-streaming-json-iteration` | Python | 100.0% | 59.6% | **+40.4pp** |
| 9 | `mashumaro-flattened-dataclass-fields` | Python | 100.0% | 59.9% | **+40.1pp** |
| 10 | `anko-default-function-arguments` | Go | 100.0% | 68.2% | **+31.8pp** |
| 11 | `koota-deferred-mutation-buffer` | TypeScript | 100.0% | 70.0% | **+30.0pp** |
| 12 | `dateutil-rfc5545-timezone-interop` | Python | 66.7% | 39.8% | **+26.8pp** |
| 13 | `kombu-single-active-consumer-priority` | Python | 100.0% | 75.8% | **+24.2pp** |
| 14 | `fastapi-implicit-head-options` | Python | 100.0% | 76.0% | **+24.0pp** |
| 15 | `prometheus-transactional-reload-status` | TypeScript | 50.0% | 26.2% | **+23.8pp** |
| 16 | `abs-stepped-slices` | Go | 100.0% | 76.7% | **+23.3pp** |
| 17 | `vitest-duration-sharding` | TypeScript | 100.0% | 77.3% | **+22.7pp** |
| 18 | `opa-template-string-reconstruction` | Go | 100.0% | 78.8% | **+21.2pp** |

### 3.1 对每个其他模型的逐项胜出

平均优势还可能被某一个特别弱的模型拉高，因此另算“Pro历史率是否高于每个可用对照配置”：

- **5/5个对照都胜出**：`kgateway-consistent-hash-policy`、`ink-grid-box-layout`、`go-critic-doc-link-checker`、`httpx-streaming-json-iteration`、`mashumaro-flattened-dataclass-fields`、`anko-typed-variable-bindings`。
- **4/5个对照胜出、无败**：`skrub-duration-encoding`、`query-persist-restored-query-state`、`ipython-session-bundle-replay`、`kombu-single-active-consumer-priority`。
- `narwhals-rolling-window-suite`等题平均优势较大，但部分对照与Pro打平，因此应排在上面两组之后。

因此，最可信的Pro特有优势验证题是前述“5/5全胜”和“4/5全胜”任务，而不只是平均差值最大的任务。

### 如何选择第一段的8题

第一段没有机械地选择优势最大的8题，而是兼顾：

- Pro优势至少40pp；
- Pro每题至少2次历史运行；
- 覆盖Go/Python/TypeScript三种主要语言；
- 避免把所有题集中到同一个生态或同一类库。

如果预算允许增加4题，可继续加入：

- `mashumaro-flattened-dataclass-fields`
- `anko-default-function-arguments`
- `koota-deferred-mutation-buffer`
- `dateutil-rfc5545-timezone-interop`

## 四、Pro0813剩余高错误率题

### 4.1 最近一次仍失败的4题

| 任务 | 语言 | Pro历史 | 最近状态 | 其他模型均值 | 解释 |
|---|---|---:|---|---:|---|
| `boa-hierarchical-evaluation-cancellation` | Rust | 1/5，20.0% | 失败 | 80.8% | Pro明显弱，其他模型普遍更好 |
| `kysely-window-grouping-helpers` | TypeScript | 1/2，50.0% | 失败 | 97.1% | 其他模型几乎全过，Pro特异性短板 |
| `wasmi-trap-coredumps` | Rust | 2/4，50.0% | 失败 | 97.4% | 其他模型强，Pro仍反复失败 |
| `scriggo-method-declarations` | Go | 3/4，75.0% | 失败 | 97.1% | Pro相对弱，但不是极低长期率 |

### 4.2 长期高错误率但最近一次通过的题

| 任务 | 语言 | Pro历史 | 最近状态 | 其他模型均值 | Pro相对差异 |
|---|---|---:|---|---:|---:|
| `optique-conditional-option-dependencies` | TypeScript | 1/3，33.3% | 通过 | 85.3% | **-51.9pp** |
| `goreleaser-retry-publish-auditing` | Go | 1/2，50.0% | 通过 | 100.0% | -50.0pp |
| `prometheus-typed-label-sorting` | Go | 1/2，50.0% | 通过 | 90.8% | -40.8pp |
| `quill-shared-toolbar-focus` | TypeScript | 1/2，50.0% | 通过 | 37.8% | +12.2pp |
| `prometheus-transactional-reload-status` | TypeScript | 1/2，50.0% | 通过 | 26.2% | +23.8pp |
| `dateutil-rfc5545-timezone-interop` | Python | 2/3，66.7% | 通过 | 39.8% | +26.8pp |
| `arcane-drift-detection-baselines` | Go | 2/3，66.7% | 通过 | 91.9% | -25.2pp |
| `mnamer-daemon-watch-lifecycle` | Python | 2/3，66.7% | 通过 | 78.6% | -11.9pp |
| `cattrs-partial-structuring-recovery` | Python | 3/4，75.0% | 通过 | 97.0% | -22.0pp |

`prometheus-transactional-reload-status`和`quill-shared-toolbar-focus`虽然Pro长期率只有50%，但它们并非Pro特异性弱项，因为其他模型也低；这类题应放在“共同风险”而不是“验证Pro弱项”列表。

## 五、最小测试方案与得分更新规则

### 方案A：极简6题

如果资源极少，跑：

- 优势验证：`kgateway`、`ink-grid`、`skrub`
- 弱项验证：`boa`、`kysely`、`optique`

解释力有限，但能同时覆盖Go/TS/Python/Rust中的Pro特长和特异性短板。

### 方案B：推荐14题

先跑第一段8题，再跑第二段6题。这是推荐方案：

- 8题检验Pro特有优势是否迁移到灰测；
- 6题检验灰测是否继续修复Pro的高错误率题；
- 合计14题，占剩余56题的25%，但能覆盖两类最关键的迁移假设。

### 方案C：两阶段停止规则

不要预先承诺一定跑完14题：

1. 先跑优势验证8题；
2. 若灰测通过≤4题，说明Pro优势迁移弱，继续跑弱项中的6题；
3. 若灰测通过≥7题，说明Pro优势迁移可信，再跑弱项6题判断是否存在额外增益；
4. 若灰测通过5–6题，先跑弱项中的`boa`、`kysely`、`optique`三题，再决定是否扩展。

### 得分更新公式

设第一段优势题灰测通过率为\(q_A\)，第二段弱项题灰测通过率为\(q_B\)。剩余未测题按Pro逐题长期率作为基线，已测样本提供相对Pro的修正：

\[
\Delta_A=q_A-\bar p_{Pro,A}
\]

\[
\Delta_B=q_B-\bar p_{Pro,B}
\]

将修正限制在\([-1,1]\)后，对相似任务层做加权外推。不要把14题的总体结果直接乘到全部56题，因为两段是按信息增益选出的非随机样本。

一个更简单的实务更新是：

- 若优势8题灰测≥7/8，保留92题上侧情景；
- 若优势8题≤4/8，将92题情景下调到89–90题附近；
- 若弱项6题≥4/6，保守89.5题基线应上调约1–2题；
- 若弱项6题≤2/6，保守基线不动，且应下调对92题的信心；
- 若两段均达到阈值，最终预测可上调至约91–94题；这是条件更新，不是无条件得分保证。

## 六、重要排除项

- `drizzle-orm-window-function-builders`：本地113题新增，雷达无记录；保留为未知题，不用其他模型缺测当作失败。
- `langchain-request-coalescing`：Pro0813为0/0；不要把它当成Pro失败。
- `katex-multicolumn-array-spans`、`optique-conditional-option-dependencies`、`scriggo-method-declarations`、`prometheus-transactional-reload-status`此前有灰测watchdog排除记录。它们可以作为未来候选，但若复测，必须重新得到完整verifier结果后才能计分。
- `wasmi-trap-coredumps`、`kysely-window-grouping-helpers`此前有harness早退排除记录；这次若纳入测试，也必须按新一轮完整结果处理。

## 七、复核文件

- 排名生成脚本：`cache/build_remaining_task_test_priorities.py`
- 完整逐题JSON：`cache/remaining_task_test_priorities.json`
- 推荐优先级CSV：`cache/remaining_task_test_priorities.csv`
- 剩余题多模型统计：`cache/remaining_tasks_multimodel_analysis.json`
- 得分区间分析：`DEEPSWE_GRAY_SCORE_INTERVAL_ANALYSIS.md`
