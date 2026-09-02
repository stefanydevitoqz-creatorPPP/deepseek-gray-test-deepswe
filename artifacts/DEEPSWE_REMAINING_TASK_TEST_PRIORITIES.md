# 剩余题测试优先级与后续结果校准

> **目标**：用已完成的定向测试，判断灰测模型是否继承 Pro0813 在部分剩余题上的优势，并把结果用于校准 113 题得分预测。
>
> **当前范围**：固定 113 题中，87 题已经完成，26 题仍未运行。本文最初是在 57 题完成、56 题未运行时制定的测试计划；下面同时保留原计划和实际执行结果，避免把历史计划误读成当前队列。
>
> **被测对象**：评测窗口内实际命中的 DeepSeek 灰测模型。`Pro/max`、`Flash-Vision/high` 及 `deepseek-v4-pro`、`deepseek-v4-flash-vision-exp` 只表示请求路由别名和 reasoning 档位，不表示被测对象就是目前公开的两个同名模型。

## 一、原测试计划与执行结论

原计划分为两个测试段：

- **优势验证段 A**：选择 Pro0813 历史长期率为 100%、而其他模型较低的题，检验 Pro 优势能否迁移到灰测模型。
- **弱项校准段 B**：选择 Pro0813 历史或最近状态较弱的题，检验灰测模型是否能修复 Pro 的已知短板。

### 1.1 优势验证段 A：8 个测试位

| 计划序 | 计划任务 | 实际运行任务 | 语言 | 灰测结果 | 是否计入台账 | 说明 |
|---:|---|---|---|---|---|---|
| 1 | `kgateway-consistent-hash-policy` | 同左 | Go | **通过 1.0** | 是 | Flash-Vision/high；baseline 与 `TestConsistentHash` 专项均通过 |
| 2 | `ink-grid-box-layout` | 同左 | TypeScript | **通过 1.0** | 是 | Flash 阶段前六次因命令行参数解析崩溃作废；修复第二个 `--` 后 Pro/max 完整运行通过 |
| 3 | `skrub-duration-encoding` | 同左 | Python | **通过，归一化 1.0** | 是 | 原始 reward 0.0；97 项 baseline 失败在 pristine HEAD 同样出现，专项新测试 130/130，通过环境口径归一化 |
| 4 | `query-persist-restored-query-state` | 同左 | TypeScript | **通过 1.0** | 是 | Flash-Vision/high，baseline 与专项测试双绿 |
| 5 | `ipython-session-bundle-replay` | 同左 | Python | **通过 1.0** | 是 | Flash-Vision/high，baseline 29 项、专项 17/17 通过 |
| 6 | `narwhals-rolling-window-suite` | 同左 | Python | **通过，归一化 1.0** | 是 | 模型专项全绿；6 项 baseline 在 pristine HEAD 同样失败，按环境口径归一化 |
| 7 | `go-critic-doc-link-checker` | 同左 | Go | 未通过 0.0 | 是 | Pro/max 与 Flash 结果均未通过官方专项测试 |
| 8 | `httpx-streaming-json-iteration` | 同左 | Python | 未通过 0.0 | 是 | 基线通过，专项 107/108；与 Flash 重试暴露同一实现缺口 |
| **合计** | **8 个测试位** | — | — | **6/8 通过** | — | 说明 Pro 优势在灰测模型上大部分可迁移，但不是全部迁移 |

### 1.2 弱项校准段 B：6 个测试位

| 计划序 | 计划任务 | 实际运行任务 | 语言 | 灰测结果 | 是否计入台账 | 说明 |
|---:|---|---|---|---|---|---|
| 1 | `boa-hierarchical-evaluation-cancellation` | 同左 | Rust | **通过，归一化 1.0** | 是 | 原始 verifier 为环境下载失败；修复工具链后以同一 model patch 重放，基线 7/7、专项 17/17 |
| 2 | `kysely-window-grouping-helpers` | 同左 | TypeScript | 未通过 0.0 | 是 | 基线通过；专项编译失败，6 处 TS2578，属于真实实现失败 |
| 3 | `wasmi-trap-coredumps` | 同左 | Rust | **通过 1.0** | 是 | 基线与专项双绿，含 host-error coredump 用例 |
| 4 | `goreleaser-retry-publish-auditing` | 同左 | Go | **通过 1.0** | 是 | 基线与专项双绿 |
| 5 | `optique-conditional-option-dependencies` | 同左 | TypeScript | **通过 1.0** | 是 | 基线与专项双绿 |
| 6 | `prometheus-transactional-reload-status` | `prometheus-typed-label-sorting`（同方向替代） | TypeScript / Go | **替代任务通过 1.0** | 仅替代任务计入 | 原计划题触发 watchdog 后作废、未完成；不能把 `typed-label-sorting` 的结果写成 `transactional-reload-status` 的结果 |
| **合计** | **6 个测试位** | — | — | **按替代位计 5/6 通过** | — | 严格按原计划题目计算为 4/5 个已完成任务通过，另 1 个原题未运行；替代 Prometheus 任务通过 |

### 1.3 这组结果说明什么

- 优势验证段 A 为 **6/8**：灰测模型保留了 Pro0813 在大多数优势题上的表现，但 `go-critic` 和 `httpx-streaming` 显示出任务级回归风险。
- 弱项校准段 B 按替代测试位为 **5/6**：灰测模型在 Boa、Wasmi、Goreleaser、Optique 上通过，Kysely 失败；Prometheus 原计划题没有有效完成，不能把替代任务结果冒充原题结果。
- 合并看，14 个测试位中 **11 个通过**。这个 11/14 只用于描述定向验证样本，不是 113 题通过率，也不应直接乘到全部剩余题。
- 三个环境归一化结果（Boa、Narwhals、Skrub）不是把环境失败算成模型成功，而是先由 pristine HEAD 对照或 verifier 重放确认模型补丁有效后，才按正式口径归一化。
- 所有 retry 后缀都是任务编排序号。进程崩溃、异常早退、命令行参数传递错误、watchdog、API 中断和 verifier 环境失败的轮次均不计为模型失败或额外运行。

## 二、剩余 26 题的统计背景

当前不再使用旧版“剩余 56 题”统计。新版逐题统计见 [`cache/remaining_tasks_multimodel_analysis_2026-09-02.json`](../cache/remaining_tasks_multimodel_analysis_2026-09-02.json) 和对应 CSV。

| 模型/配置 | 剩余 26 题的逐题历史均值 | 覆盖说明 |
|---|---:|---|
| Pro0813@max | 由逐题历史率迁移，作为主预测基线 | `langchain-request-coalescing` 为 0/0，使用明确插补 |
| GPT-5.6 Sol@max | 作为敏感性基线 | 仅把有历史运行的题纳入，缺失不当作失败 |
| GPT-5.6 Sol@ultra | 作为补充对照 | 同上 |
| GPT-5.6 Terra@ultra | 作为补充对照 | 同上 |
| Grok 4.6@xhigh | 作为补充对照 | 同上 |
| GLM-5.3@max | 作为补充对照 | 同上 |
| 灰测模型 | 26 题尚未逐题运行 | 已运行的 87 题不与这 26 题混合 |

这 26 题是从当前整理后的队列得到的剩余集合，不再是早期主动选择的 56 题困难样本。因此，早期文档中“Pro 88.3%”“推荐 14 题占剩余 56 题 25%”等数字只保留为历史计划背景，不作为当前统计结论。

## 三、定向结果如何用于得分预计

定向测试结果提供了重要的迁移校准，但由于测试位是按信息增益选择的非随机样本，不能直接将 `11/14` 乘到剩余 26 题或全部 113 题。当前正式得分预计采用新版主报告的逐题条件预测：

| 口径 | 预计最终通过 | 得分 | 说明 |
|---|---:|---:|---|
| 已完成题直接观测 | 64/113 | 56.64% | 87 题已完成，其中 64 题正式通过 |
| Pro0813@max 逐题历史率迁移 | **88.0417/113** | **77.91%** | 当前主条件预测；剩余 26 题预计 24.0417 题通过 |
| Pro0813 最近一次状态敏感性 | 88.9583/113 | 78.72% | 偏乐观敏感性场景，不是主估计 |
| GPT-5.6 Sol@max 历史率敏感性 | 约 85.84/113 | 75.96% | 作为基线敏感性，不与主预测机械平均 |
| 无假设严格边界 | 64–90/113 | 56.64%–79.65% | 只由已知通过和未运行题数决定 |

### 3.1 与本文件定向结果的关系

`6/8` 的优势验证结果说明灰测模型不能被视为“完全丢失 Pro 优势”；`5/6` 的弱项校准结果说明它在部分 Pro 薄弱题上有修复能力。它们支持主预测不应简单下调到 Pro0813 的偏难 57 题表现，但也不足以把主预测直接上调到 92–94/113。

因此，本文件对当前得分预计的引用结论是：

> 定向验证的 14 个测试位中有 11 个通过，其中优势验证段为 6/8，弱项校准段按替代 Prometheus 测试位计为 5/6。该结果支持灰测模型在剩余题上大体继承 Pro0813 的容易题优势，但因样本是主动选择的，正式 113 题预计仍采用新版主报告的 **88.0417/113（77.91%，条件范围 86–90/113）**，并以 88.96/113 和约 85.84/113 作为敏感性参照。

正式引用：

- [`DEEPSEEK_GRAY_MODEL_DEEPSWE_EVALUATION_REPORT_2026-09-02.md`](DEEPSEEK_GRAY_MODEL_DEEPSWE_EVALUATION_REPORT_2026-09-02.md)，第八节“灰测模型 113 题得分估计”；
- [`cache/remaining_tasks_multimodel_analysis_2026-09-02.json`](../cache/remaining_tasks_multimodel_analysis_2026-09-02.json)，当前 26 道未运行题的逐题模型历史率与预测输入；
- [`cache/remaining_tasks_multimodel_analysis_2026-09-02.csv`](../cache/remaining_tasks_multimodel_analysis_2026-09-02.csv)，同一统计的表格镜像。

## 四、后续测试优先级

如果灰测窗口重新开放，优先级应从旧的 14 题计划转为当前 26 题中的信息增益排序：

1. 优先补测当前 26 题中 Pro0813 与其他模型分歧最大的任务，特别是能够区分“Pro 优势可迁移”和“灰测出现回归”的任务。
2. 优先覆盖剩余 TypeScript 题，验证当前已测集合暴露出的 TypeScript 共同失败风险。
3. 对 `langchain-request-coalescing` 单独补测；它在 Pro0813 历史中为 0/0，不能把缺测当成失败。
4. 对 `drizzle-orm-window-function-builders` 保持未知状态；雷达没有该本地新增题的历史记录，不能用其他模型缺测替代。
5. 任何重试都必须产生完整 verifier-backed 结果后才进入 `tasks.csv`；进程崩溃、异常早退、命令行错误、watchdog、API 中断和环境失败继续单独归档。

## 五、复核文件

- 当前灰测主报告：`DEEPSEEK_GRAY_MODEL_DEEPSWE_EVALUATION_REPORT_2026-09-02.md`
- 当前 113 题标准快照：`tasks-current-2026-09-02.csv`
- 当前剩余题多模型分析：`cache/remaining_tasks_multimodel_analysis_2026-09-02.json`、`.csv`
- 详细测试归档：`DEEPSWE_TEST_ARCHIVE.md`
- 灰测任务台账：`tasks.csv`
- 多模型语言画像：`DEEPSWE_GRAY_MULTI_MODEL_LANGUAGE_COMPARISON.md`
