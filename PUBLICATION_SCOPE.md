# Publication Scope

This repository contains public DeepSWE reports and derived statistics for the DeepSeek gray-test model reached during the recorded evaluation windows. Model strings such as `deepseek-v4-pro` and `deepseek-v4-flash-vision-exp` are retained as request-routing aliases and reasoning configurations for evidence traceability; they do not assert that the evaluated gray-test backend is either of the two models currently exposed under those names.

Included in the current publication layer:

- the fixed 113-task catalog and evaluation ledger;
- model comparison reports and statistical analyses;
- reproducibility notes and configuration documentation that contain no credentials;
- sanitized task-level evidence for the historical batch (62 task mirrors, including the backfilled `fd-deterministic-multi-key-sorting` task) and the 2026-09-02 gray-test batch (26 task mirrors reached through the Pro/max request alias plus separate `kgateway` evidence reached through the Flash-Vision/high request alias) under `artifacts/tasks-historical/` and `artifacts/tasks-2026-09-02/`, limited to result metadata, verifier output, model patches, watchdog summaries, and worktree status.

Intentionally excluded:

- API keys and other credentials;
- complete DSH conversations and model session archives;
- local Docker/Pier runtime directories, live logs, and per-request proxy audit logs;
- the exported task repositories under `dataset/`;
- temporary caches and machine-specific state.

Retry suffixes in job paths are orchestration sequence labels. Earlier attempts may have been discarded because the DSH/agent process crashed or exited early, or because command-line argument forwarding was incorrect. Those discarded attempts are neither model failures nor separately scored model runs; only completed verifier-backed evaluations enter the ledger.

The original verifier artifacts remain available locally for audit. Only the separately reviewed and sanitized historical and 2026-09-02 task-level evidence mirrors are included in this public layer; complete sessions and runtime directories remain excluded.
