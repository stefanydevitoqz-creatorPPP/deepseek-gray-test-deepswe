# DeepSeek Gray-Test DeepSWE Evaluation

Public reports and reproducibility metadata for the DeepSWE evaluation of the DeepSeek gray-test model reached during the recorded test windows. The model strings `deepseek-v4-pro` and `deepseek-v4-flash-vision-exp` in the evidence are request-routing aliases and reasoning configurations used to reach the gray-test backend; they do not identify the evaluated backend as either of the two models currently exposed under those names.

## Contents

- [`artifacts/README.md`](artifacts/README.md): current 113-task ledger and evidence index
- [`artifacts/tasks-current-2026-09-02.csv`](artifacts/tasks-current-2026-09-02.csv): standards-compliant 113-task status snapshot
- [`artifacts/DEEPSWE_TEST_ARCHIVE.md`](artifacts/DEEPSWE_TEST_ARCHIVE.md): run methodology, channel qualification, and result archive
- [`artifacts/DEEPSEEK_GRAY_MODEL_DEEPSWE_EVALUATION_REPORT_2026-09-02.md`](artifacts/DEEPSEEK_GRAY_MODEL_DEEPSWE_EVALUATION_REPORT_2026-09-02.md): current 87-task gray-test model report and 113-task score forecast
- [`artifacts/DEEPSEEK_V4_PRO_GRAY_DEEPSWE_EVALUATION_REPORT.md`](artifacts/DEEPSEEK_V4_PRO_GRAY_DEEPSWE_EVALUATION_REPORT.md): historical 57-task snapshot
- [`artifacts/DEEPSWE_GRAY_SCORE_INTERVAL_ANALYSIS.md`](artifacts/DEEPSWE_GRAY_SCORE_INTERVAL_ANALYSIS.md): score interval analysis
- [`artifacts/DEEPSWE_GRAY_MULTI_MODEL_LANGUAGE_COMPARISON.md`](artifacts/DEEPSWE_GRAY_MULTI_MODEL_LANGUAGE_COMPARISON.md): language comparison across models
- [`artifacts/CODEXRADAR_MULTI_MODEL_LANGUAGE_PREFERENCES.md`](artifacts/CODEXRADAR_MULTI_MODEL_LANGUAGE_PREFERENCES.md): broader model language preferences
- [`artifacts/DEEPSWE_REMAINING_TASK_TEST_PRIORITIES.md`](artifacts/DEEPSWE_REMAINING_TASK_TEST_PRIORITIES.md): remaining-task prioritization
- [`cache/`](cache/): machine-readable derived statistics in JSON and CSV form
- [`TASK_CATALOG.md`](TASK_CATALOG.md): fixed 113-task catalog
- [`PUBLICATION_SCOPE.md`](PUBLICATION_SCOPE.md): what is and is not included in this public repository

## Dataset and scoring

The evaluation uses the fixed 113-task DeepSWE dataset identified by:

```text
sha256:aaa82ceb8404dccc17689c9383f93dbcbc8f029a7601d2e3856a416f2cb89269
```

The current ledger contains 87 complete evaluations of the gray-test model: 64 normalized passes and 23 genuine model failures, with 26 tasks not yet run. The completed-task pass rate is 64/87 (73.6%); the known contribution against the full 113-task denominator is 64/113 (56.6%). Under the documented per-task Pro0813 historical-transfer assumption, the current conditional forecast is 88.04/113 (77.9%), with a conditional predictive range of 86–90/113. Retry suffixes in archived job names are orchestration sequence labels: prior attempts were discarded when the DSH/agent process crashed or exited early, or when command-line argument forwarding was incorrect. Such attempts are not model failures and are never counted as additional evaluations. Infrastructure failures, watchdog terminations, API interruptions, and verifier-environment failures are likewise excluded. Boa, Narwhals, and Skrub are normalized only where verifier replay or pristine-HEAD controls establish an environment-only failure.

## Credentials and private evidence

No API key is stored in this repository. Supply `DEEPSEEK_API_KEY` through the process environment only; `.env.example` is a placeholder. Complete DSH conversations, model session archives, local Docker/Pier jobs, exported task repositories, and live logs are intentionally excluded from this public layer. See [`PUBLICATION_SCOPE.md`](PUBLICATION_SCOPE.md).

## Integrity

`PUBLICATION_MANIFEST.sha256` contains hashes for the files in this public publication layer. It is generated from the repository root and excludes `.git/` and the manifest itself.
