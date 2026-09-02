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

## 灰测模型与非灰测 Pro 的特征区别

这里的“灰测模型”是评测窗口内通过指定条件实际命中的后端，不等同于公开可用的 Pro 模型。`deepseek-v4-pro`、`Pro/max` 等字符串只是请求路由别名和档位，不能单独证明后端身份；下面的特征是本次评测窗口中用于联合判定和排除的运行证据，不是模型厂商公开的永久接口承诺。

| 维度 | 灰测模型（本次评测对象） | 非灰测 Pro / 常规公开后端 | 判定注意 |
|---|---|---|---|
| 请求条件 | 通过已验证的灰测传输 Session，并使用 DSH PTC/code（`tools_mode=code`）和对应路由别名 | 相同别名或相同 `max` 档位也可能返回常规后端；裸 API 或未满足 PTC 条件时曾观察到常规模型 | 路由别名、模型字段和 reasoning 档位都不能单独作为身份凭据 |
| PTC 路由表现 | 在本次窗口中，PTC/code 是进入灰测后端的必要触发条件之一 | 未满足 PTC 条件时，通道可能落到常规公开后端 | 这是本次窗口的实测条件，不保证适用于其他时间或接口 |
| reasoning 可观察信号 | 灰测输出通常有英文 reasoning，`I'm` 相对频繁；51 条可对齐 Pro 灰测 session 合计约 5,856 次 `I'm`，加权约 **0.93 次/千字符**，session 级中位数约 **1.54 次/千字符** | 已知非灰测 GPT-5.6 对照 session 未出现 `I'm`；但不是严格配对实验，不能据此设硬阈值 | `I'm` 密度受提示词、任务和会话长度影响，只能作为联合佐证 |
| 首 token / 首 reasoning 延迟 | 51 条 Pro 灰测 session 中，首 assistant 流事件中位数 **2.67s**，首个非空增量中位数 **8.73s**，首 reasoning 增量中位数 **11.12s**，且存在分钟级长尾 | 已知非灰测 GPT-5.6 对照的首个非空增量约 **10.7s**；不同会话形态使其只能作弱对照 | 灰测的特征更准确地说是“首个有意义 reasoning 内容较慢且长尾明显”，不是底层流事件必然慢 |
| 输出速度 | 51 条 Pro 灰测 session 的 output token/s 中位数约 **22.4**，reasoning token/s 中位数约 **6.62**；reasoning 字符/s 中位数约 **32.7** | 已知非灰测对照的会话节奏不同，但受多轮工具调用、上下文和负载影响 | 低 token/s 是会话级经验信号，不是模型身份的单独证明 |
| watchdog / 配置 | watchdog 用于确认请求模型标签、reasoning 档位、usage 和前 10 分钟 token 状态 | 常规模型可能仍返回相似的模型标签，因此只看标签会误判 | 必须结合 Session、PTC 配置、reasoning、首 token 延迟和输出速度对照 |
| 任务表现 | 当前 87 题正式结果为 64/87，语言上表现为 Go/Python 较强、TypeScript 偏弱 | DSH/Pro0813 历史累计为 186/314；语言结构为 Go 67.7%、Python 59.8%、TypeScript 52.6% | 两者 Harness、批次和任务集合不同，不能把差值直接归因于模型权重 |
| 计分身份 | 所有已验证路由别名的有效结果统一计为“DeepSeek 灰测模型”，不拆成两个公开模型 | 非灰测运行只作为历史对照，不并入灰测台账 | 只有完整 verifier-backed 灰测运行进入当前正式结果 |

### 会话记录定性结论

本结论来自本地会话 JSONL/zstd 与 watchdog 的结构化审计汇总，而不是公开完整会话原文。纳入的 51 条可对齐 Pro 灰测 session 显示：底层 assistant 流事件通常在数秒内出现，但首个非空 reasoning 增量中位数约 **8.7 秒**、首 reasoning 增量中位数约 **11.1 秒**，少数会话存在一分钟以上长尾；因此“首 token 较久”更准确地指首个有意义 reasoning 内容的延迟，而不是所有底层流事件都慢。同期 `I'm`/`I’m` 合计约 **5,856 次**，按 assistant 文本加权约 **0.93 次/千字符**，session 级中位数约 **1.54 次/千字符**；output token/s 中位数约 **22.4**，reasoning token/s 中位数约 **6.62**，reasoning 字符/s 中位数约 **32.7**。这些记录共同支持“`I'm` 较多、首个有效 reasoning 有延迟长尾、reasoning 生成速度偏低”的灰测会话画像。

已知非灰测 GPT-5.6 对照 session 中未出现 `I'm`，但它不是同任务、同负载的严格配对实验；首个非空增量约 10.7 秒，也说明单一延迟数值不能作为硬阈值。因此，**灰测身份应由已验证的 Session、PTC/code 配置、watchdog 状态、会话时间线、`I'm` 密度、首 reasoning 延迟和 token/s 等多项证据联合判断**。单个词频、单次首 token 延迟、单次 token/s 或模型标签都不足以证明后端身份。

简要说，**灰测模型的核心区别不是文件中的模型字符串，而是“已验证的路由条件 + PTC 执行方式 + 运行中联合信号”**。本次评测中，灰测模型相对非灰测 Pro 的最明显任务级差异是 Python/Go 成功率更高，但该差异受 Harness、题目批次和环境归一化影响，不能单独用来鉴定某一次请求的后端身份。详细的通道有效性和排除记录见 [`DEEPSWE_TEST_ARCHIVE.md`](DEEPSWE_TEST_ARCHIVE.md)，语言对比见 [`DEEPSWE_GRAY_MULTI_MODEL_LANGUAGE_COMPARISON.md`](DEEPSWE_GRAY_MULTI_MODEL_LANGUAGE_COMPARISON.md)。

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
