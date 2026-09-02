import asyncio
import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from deepswe_agent import DshHeadlessAgent


class Result:
    return_code = 0
    stdout = ""
    stderr = ""


class Environment:
    captured_env = None

    @staticmethod
    def agent_process_env(env):
        return env

    async def exec(self, **kwargs):
        self.captured_env = kwargs["env"]
        return Result()


class Capture(logging.Handler):
    record = None

    def emit(self, record):
        if record.getMessage().startswith("Running command"):
            self.record = record


async def main():
    logger = logging.getLogger("deepswe-agent-test")
    logger.setLevel(logging.DEBUG)
    capture = Capture()
    logger.addHandler(capture)
    agent = DshHeadlessAgent(
        logs_dir=Path("deepswe-env/jobs/adapter-check"),
        logger=logger,
        smoke_only=True,
        extra_env={"DEEPSEEK_API_KEY": "test-secret", "VISIBLE": "value"},
    )
    environment = Environment()
    await agent._exec(environment, "true", env={"LOCAL": "value"})
    assert environment.captured_env["DEEPSEEK_API_KEY"] == "test-secret"
    assert capture.record.env["DEEPSEEK_API_KEY"] == "<redacted>"
    assert capture.record.env["VISIBLE"] == "value"
    try:
        DshHeadlessAgent(logs_dir=Path("deepswe-env/jobs/adapter-check"))
    except ValueError as error:
        assert "transport_session_id is required" in str(error)
    else:
        raise AssertionError("real adapter accepted a missing transport Session ID")
    print("agent redaction test passed")


asyncio.run(main())
