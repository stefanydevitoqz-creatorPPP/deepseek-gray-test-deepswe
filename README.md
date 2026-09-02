# DeepSeek 灰测模型 DeepSWE 评测

本仓库记录评测窗口内实际命中的 DeepSeek 灰测模型的 DeepSWE 评测报告、统计结果和脱敏 verifier 证据。证据中的 `deepseek-v4-pro` 与 `deepseek-v4-flash-vision-exp` 只是进入灰测后端时使用的请求路由别名和推理配置，不表示被测后端就是目前公开的两个同名模型。

## 内容索引

- [`artifacts/README.md`](artifacts/README.md)：当前 113 题台账和证据索引
- [`artifacts/tasks-current-2026-09-02.csv`](artifacts/tasks-current-2026-09-02.csv)：符合标准 CSV 格式的 113 题状态快照
- [`artifacts/DEEPSWE_TEST_ARCHIVE.md`](artifacts/DEEPSWE_TEST_ARCHIVE.md)：测试方法、灰测通道判定和结果存档
- [`artifacts/DEEPSEEK_GRAY_MODEL_DEEPSWE_EVALUATION_REPORT_2026-09-02.md`](artifacts/DEEPSEEK_GRAY_MODEL_DEEPSWE_EVALUATION_REPORT_2026-09-02.md)：当前 87 题灰测模型报告及 113 题得分估计
- [`artifacts/DEEPSEEK_V4_PRO_GRAY_DEEPSWE_EVALUATION_REPORT.md`](artifacts/DEEPSEEK_V4_PRO_GRAY_DEEPSWE_EVALUATION_REPORT.md)：历史 57 题快照
- [`artifacts/DEEPSWE_GRAY_SCORE_INTERVAL_ANALYSIS.md`](artifacts/DEEPSWE_GRAY_SCORE_INTERVAL_ANALYSIS.md)：得分区间分析
- [`artifacts/DEEPSWE_GRAY_MULTI_MODEL_LANGUAGE_COMPARISON.md`](artifacts/DEEPSWE_GRAY_MULTI_MODEL_LANGUAGE_COMPARISON.md)：灰测模型与多模型语言能力对比
- [`artifacts/CODEXRADAR_MULTI_MODEL_LANGUAGE_PREFERENCES.md`](artifacts/CODEXRADAR_MULTI_MODEL_LANGUAGE_PREFERENCES.md)：更大范围的多模型语言偏好
- [`artifacts/DEEPSWE_REMAINING_TASK_TEST_PRIORITIES.md`](artifacts/DEEPSWE_REMAINING_TASK_TEST_PRIORITIES.md)：剩余题测试优先级
- [`cache/`](cache/)：机器可读的派生统计 JSON 和 CSV
- [`TASK_CATALOG.md`](TASK_CATALOG.md)：固定 113 题任务目录
- [`PUBLICATION_SCOPE.md`](PUBLICATION_SCOPE.md)：公开范围和排除项说明

## 数据集和计分

评测使用固定版 113 题 DeepSWE 数据集，标识如下：

```text
sha256:aaa82ceb8404dccc17689c9383f93dbcbc8f029a7601d2e3856a416f2cb89269
```

当前台账包含 87 条灰测模型完整评测：64 条归一化通过、23 条真实模型失败，另有 26 题未运行。完成题通过率为 64/87（73.6%）；以完整 113 题为分母的已知通过贡献为 64/113（56.6%）。按照 Pro0813 逐题历史率迁移的条件假设，当前预计得分为 88.04/113（77.9%），条件预测范围为 86–90/113。

归档 job 名中的 `retryN` 是任务编排序号，不是模型版本或额外计分轮次。前序尝试若因 DSH/agent 进程崩溃、异常早退或命令行参数转发错误而作废，不计为模型失败，也不增加正式运行数。watchdog、API 中断和 verifier 环境失败同样排除；Boa、Narwhals、Skrub 只有在 verifier 重放或 pristine-HEAD 对照确认环境问题后才归一化。

## 凭据和私有证据

仓库不保存 API key。只通过进程环境提供 `DEEPSEEK_API_KEY`；`.env.example` 仅为占位示例。完整 DSH 对话、模型 session、Docker/Pier 本地作业、导出的任务仓库、实时日志和 proxy 审计日志均不进入公开层。详见 [`PUBLICATION_SCOPE.md`](PUBLICATION_SCOPE.md)。

## 完整性

`PUBLICATION_MANIFEST.sha256` 保存公开层文件的 SHA-256；它从仓库根目录生成，并排除 `.git/` 和 manifest 自身。
