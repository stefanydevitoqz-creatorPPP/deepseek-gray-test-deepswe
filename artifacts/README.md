# DeepSWE × DeepSeek 灰测模型验证数据

本目录归集固定版 DeepSWE 任务评测的公开可复核产物，用于记录评测窗口内实际命中的 **DeepSeek 灰测模型**。证据中的 `deepseek-v4-pro` 与 `deepseek-v4-flash-vision-exp` 是请求路由别名和 reasoning 档位，不表示被测对象就是目前公开的两个同名模型，也不作为两个独立模型分别计分。

## 当前结果概览

固定数据集共 113 道题，SHA-256：

```text
aaa82ceb8404dccc17689c9383f93dbcbc8f029a7601d2e3856a416f2cb89269
```

| 指标 | 当前值 |
|---|---:|
| 数据集总题数 | 113 |
| 已完成评测 | 87 |
| 正式通过 | **64** |
| 真实未通过 | **23** |
| 未运行 | **26** |
| 已完成题通过率 | **64/87 = 73.6%** |
| 对完整 113 题的已知通过贡献 | **64/113 = 56.6%** |
| 当前条件得分预测 | **88.04/113 = 77.9%** |
| 当前条件预测范围 | **86–90/113** |

状态只在完整 verifier-backed 运行完成后写入正式台账。进程崩溃、异常早退、命令行参数传递错误、watchdog 终止、API/网关中断、构建失败和 verifier 环境失败不计为模型失败；同一 model patch 的 verifier 重放也不作为第二次模型答题。详细口径见 [`DEEPSWE_TEST_ARCHIVE.md`](DEEPSWE_TEST_ARCHIVE.md)。

## 按语言的当前摘要

以下是当前 87 道已完成题的语言分布，不是 113 道题的最终语言成绩。完整 113 题快照见 [`tasks-current-2026-09-02.csv`](tasks-current-2026-09-02.csv)。

| 语言 | 总题数 | 已完成 | 通过 | 未通过 | 未运行 | 完成题通过率 |
|---|---:|---:|---:|---:|---:|---:|
| Go | 34 | 28 | **24** | 4 | 6 | **85.7%** |
| Python | 33 | 24 | **19** | 5 | 9 | **79.2%** |
| TypeScript | 35 | 27 | **16** | 11 | 8 | **59.3%** |
| Rust | 5 | 5 | **4** | 1 | 0 | **80.0%** |
| JavaScript | 6 | 3 | **1** | 2 | 3 | **33.3%** |
| **合计** | **113** | **87** | **64** | **23** | **26** | **73.6%** |

当前灰测模型的主要语言趋势是 **Go/Python 较强、TypeScript 明显偏弱**。JavaScript 和 Rust 的任务数量较少，暂不据此做稳定的跨模型排序。多模型结构比较见 [`DEEPSWE_GRAY_MULTI_MODEL_LANGUAGE_COMPARISON.md`](DEEPSWE_GRAY_MULTI_MODEL_LANGUAGE_COMPARISON.md)。

## 代表性结果案例

下面只列出少量案例，用于快速说明不同结果类型；这不是完整任务清单，也不按题号排序。完整逐题结果以 [`tasks.csv`](tasks.csv) 和 [`tasks-current-2026-09-02.csv`](tasks-current-2026-09-02.csv) 为准。

| 类型 | 代表任务 | 正式结果 | 说明 |
|---|---|---|---|
| 常规通过 | `goreleaser-retry-publish-auditing` | **reward 1.0** | baseline 与专项测试双绿 |
| 常规未通过 | `go-critic-doc-link-checker` | reward 0.0 | baseline 通过，官方专项测试失败 |
| 环境归一化通过 | `boa-hierarchical-evaluation-cancellation` | **归一化 reward 1.0** | 修复工具链后用同一 model patch 重放，基线 7/7、专项 17/17 |
| 环境归一化通过 | `narwhals-rolling-window-suite` | **归一化 reward 1.0** | pristine HEAD 出现相同 baseline 失败，模型专项全绿 |
| 参数问题修复后通过 | `ink-grid-box-layout` | **reward 1.0** | 前序 Flash retry 因题目以 `- ` 开头触发命令行解析崩溃；增加第二个 `--` 后正式 Pro/max 运行通过 |
| 监控窗口后完成 | `kgateway-consistent-hash-policy` | **reward 1.0** | Flash-Vision/high 路由；前 10 分钟 watchdog 只记录观测，窗口结束后自然完成 |

retry 后缀只表示任务编排序号。前序尝试若因 DSH/agent 进程崩溃、异常早退或输入命令行参数错误而作废，不计为模型失败，也不增加正式运行数。

## 完整数据与证据入口

- [`tasks.csv`](tasks.csv)：113 题完整源台账，保留全部字段。
- [`tasks-current-2026-09-02.csv`](tasks-current-2026-09-02.csv)：标准 CSV 当前快照，适合下游工具读取。
- [`DEEPSEEK_GRAY_MODEL_DEEPSWE_EVALUATION_REPORT_2026-09-02.md`](DEEPSEEK_GRAY_MODEL_DEEPSWE_EVALUATION_REPORT_2026-09-02.md)：当前 87 题结果、26 题剩余题统计和 113 题得分预测。
- [`DEEPSWE_TEST_ARCHIVE.md`](DEEPSWE_TEST_ARCHIVE.md)：统一表格化的正式运行、作废尝试和评测口径。
- [`DEEPSWE_GRAY_SCORE_INTERVAL_ANALYSIS.md`](DEEPSWE_GRAY_SCORE_INTERVAL_ANALYSIS.md)：当前得分预测、条件区间和严格数学边界。
- [`DEEPSWE_REMAINING_TASK_TEST_PRIORITIES.md`](DEEPSWE_REMAINING_TASK_TEST_PRIORITIES.md)：定向测试计划、后续结果和迁移校准。
- [`PRO0813_VS_GPT56_LANGUAGE_ANALYSIS.md`](PRO0813_VS_GPT56_LANGUAGE_ANALYSIS.md)：基于当前 87 题的灰测语言趋势与多模型相似性。
- [`DEEPSWE_GRAY_MULTI_MODEL_LANGUAGE_COMPARISON.md`](DEEPSWE_GRAY_MULTI_MODEL_LANGUAGE_COMPARISON.md)：当前灰测语言画像与多模型长期历史画像对比。
- [`../cache/remaining_tasks_multimodel_analysis_2026-09-02.json`](../cache/remaining_tasks_multimodel_analysis_2026-09-02.json)：当前 26 道未运行题的逐题历史统计和预测输入。
- [`../cache/remaining_tasks_multimodel_analysis_2026-09-02.csv`](../cache/remaining_tasks_multimodel_analysis_2026-09-02.csv)：上述统计的 CSV 镜像。

公开任务级证据分为两批：

- [`tasks-historical/`](tasks-historical/)：62 个历史任务级脱敏镜像，含补入的 `fd-deterministic-multi-key-sorting`。
- [`tasks-2026-09-02/`](tasks-2026-09-02/)：26 个当前 Pro/max 任务级脱敏镜像，并包含单独归档的 Flash-Vision/high `kgateway-consistent-hash-policy` 证据。

每个公开任务目录只保留 `result.json`、`config.json`、`metadata.json`、verifier reward/输出、`model.patch`、watchdog JSON 和 worktree 状态。完整 DSH session、完整模型交互、实时 proxy 日志、Docker/Pier 运行目录、数据集导出、API key 和本机绝对路径不进入公开层。凭据扫描只允许配置中的 `${DEEPSEEK_API_KEY}` 占位符存在。

## 如何验证

1. **完整性**：在仓库根目录执行 `sha256sum -c PUBLICATION_MANIFEST.sha256`，检查公开层文件哈希。
2. **当前台账**：阅读 [`tasks-current-2026-09-02.csv`](tasks-current-2026-09-02.csv)，确认 113 题的状态、reward 和未运行集合。
3. **得分预测**：阅读当前报告第八节，区分 `64/87`、`64/113`、`88.04/113` 和无假设边界 `64–90/113`。
4. **任务证据**：在 `tasks-historical/` 或 `tasks-2026-09-02/` 中打开目标任务的 `metadata.json`、`verifier/reward.txt`、`verifier/test-stdout.txt` 和 `artifacts/model.patch`。

## 安全和范围

API key 只通过进程环境变量供给，从未写入公开文件。完整 DSH 对话、模型 session、Pier/Docker 运行时和实时代理审计日志仅保留在本地审计范围，不属于 GitHub 公开层。发布范围详见 [`../PUBLICATION_SCOPE.md`](../PUBLICATION_SCOPE.md)，公开层哈希见 [`../PUBLICATION_MANIFEST.sha256`](../PUBLICATION_MANIFEST.sha256)。
