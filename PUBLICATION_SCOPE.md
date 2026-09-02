# 公开范围

本仓库公开记录评测窗口内实际命中的 DeepSeek 灰测模型的 DeepSWE 报告和派生统计。`deepseek-v4-pro` 与 `deepseek-v4-flash-vision-exp` 等模型字符串作为请求路由别名和推理配置保留，用于证据追溯；它们不表示被测灰测后端就是目前公开的两个同名模型。

## 当前公开内容

- 固定 113 题任务目录和评测台账；
- 模型对比报告和统计分析；
- 不含凭据的复现说明和配置文档；
- 历史批次 62 个任务镜像（含补入的 `fd-deterministic-multi-key-sorting`）；
- 2026-09-02 批次 26 个经 Pro/max 请求路由别名进入灰测后端的任务镜像，以及经 Flash-Vision/high 请求路由别名进入灰测后端的独立 `kgateway` 证据；
- 每题公开证据限于结果 metadata、verifier 输出、模型 patch、watchdog 摘要和 worktree 状态。

## 明确排除

- API key 和其他凭据；
- 完整 DSH 对话和模型 session；
- Docker/Pier 本地运行目录、实时日志和逐请求 proxy 审计日志；
- `dataset/` 下导出的任务仓库；
- 临时缓存和机器专属状态；
- 含本机绝对路径的本地镜像生成脚本。

job 路径中的 `retryN` 只是任务编排序号，不是模型版本，也不是额外计分轮次。前序尝试若因 DSH/agent 进程崩溃、异常早退或命令行参数传递错误而作废，既不算模型失败，也不作为单独的模型运行；只有完整完成 verifier 的结果进入台账。

原始 verifier 产物仍保留在本地供审计。公开层只包含经过单独审阅和脱敏的历史与 2026-09-02 任务级证据镜像；完整 session 和运行目录继续排除。
