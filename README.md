# DeepSeek Gray-Test DeepSWE Evaluation

Public reports and reproducibility metadata for the DeepSWE evaluation of DeepSeek gray-test channels.

## Contents

- [`artifacts/README.md`](artifacts/README.md): 113-task ledger and evaluated-task summary
- [`artifacts/DEEPSWE_TEST_ARCHIVE.md`](artifacts/DEEPSWE_TEST_ARCHIVE.md): run methodology, channel qualification, and result archive
- [`artifacts/DEEPSEEK_V4_PRO_GRAY_DEEPSWE_EVALUATION_REPORT.md`](artifacts/DEEPSEEK_V4_PRO_GRAY_DEEPSWE_EVALUATION_REPORT.md): gray-test evaluation report
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

The ledger currently contains 61 complete evaluations: 43 normalized passes and 18 genuine model failures. Infrastructure failures, harness early exits, watchdog terminations, API interruptions, and verifier-environment failures are excluded from model-failure counts. The `skrub-duration-encoding` raw verifier result was normalized to a pass after a pristine-HEAD control run reproduced the same 97 pre-existing Polars/scikit-learn compatibility failures while all 130 task-specific tests passed.

## Credentials and private evidence

No API key is stored in this repository. Supply `DEEPSEEK_API_KEY` through the process environment only; `.env.example` is a placeholder. Complete DSH conversations, model session archives, local Docker/Pier jobs, exported task repositories, and live logs are intentionally excluded from this public layer. See [`PUBLICATION_SCOPE.md`](PUBLICATION_SCOPE.md).

## Integrity

`PUBLICATION_MANIFEST.sha256` contains hashes for the files in this public publication layer. It is generated from the repository root and excludes `.git/` and the manifest itself.
