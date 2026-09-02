import asyncio
import json
from pathlib import Path

from harbor.registry.client.package import PackageDatasetClient

DATASET = "datacurve/deep-swe@sha256:aaa82ceb8404dccc17689c9383f93dbcbc8f029a7601d2e3856a416f2cb89269"
ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "dataset"
STATUS = ROOT / "dataset-status.json"


def started(task_id):
    print(f"START {task_id.get_name()}", flush=True)


def completed(task_id, result):
    state = "CACHED" if result.cached else "DONE"
    print(f"{state} {task_id.get_name()} -> {result.path}", flush=True)


async def main():
    client = PackageDatasetClient()
    metadata = await client.get_dataset_metadata(DATASET)
    items = await client.download_dataset(
        DATASET,
        output_dir=OUTPUT,
        export=True,
        on_task_download_start=started,
        on_task_download_complete=completed,
    )
    status = {
        "dataset": metadata.name,
        "version": metadata.version,
        "expectedTasks": len(metadata.task_ids),
        "downloadedTasks": len(items),
        "output": str(OUTPUT),
    }
    STATUS.write_text(json.dumps(status, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(status), flush=True)


if __name__ == "__main__":
    asyncio.run(main())
