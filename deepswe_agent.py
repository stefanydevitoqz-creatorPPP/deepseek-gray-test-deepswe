from __future__ import annotations

import shlex
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

from pier.agents.installed.base import (
    BaseInstalledAgent,
    NonZeroAgentExitCodeError,
    with_prompt_template,
)
from pier.environments.base import BaseEnvironment
from pier.models.agent.context import AgentContext
from pier.models.agent.install import AgentInstallSpec, InstallStep
from pier.models.agent.network import NetworkAllowlist
from pier.utils.env import is_sensitive_env_key


class DshHeadlessAgent(BaseInstalledAgent):
    SUPPORTS_ATIF = False
    _DSH_VERSION = "0.1.0-rc.7"

    def __init__(
        self,
        *args,
        upstream_base_url: str = "https://api.deepseek.com",
        transport_session_id: str | None = None,
        smoke_only: bool = False,
        egress_smoke_only: bool = False,
        retain_sessions: bool = False,
        token_limit: int = 1_000_000,
        token_window_seconds: int = 600,
        tools_mode: str | None = None,
        expected_reasoning_effort: str = "max",
        **kwargs,
    ):
        super().__init__(*args, version=self._DSH_VERSION, **kwargs)
        parsed_upstream = urlparse(upstream_base_url)
        if (
            parsed_upstream.scheme not in {"http", "https"}
            or not parsed_upstream.hostname
            or parsed_upstream.username
            or parsed_upstream.password
            or parsed_upstream.query
            or parsed_upstream.fragment
        ):
            raise ValueError("upstream_base_url must be an HTTP(S) URL without credentials, query, or fragment")
        if not smoke_only and not transport_session_id:
            raise ValueError("transport_session_id is required for a real run")
        self.upstream_base_url = upstream_base_url
        self.transport_session_id = transport_session_id
        self.smoke_only = smoke_only
        if token_limit < 1 or token_window_seconds < 1:
            raise ValueError("token_limit and token_window_seconds must be positive")
        if tools_mode is not None and tools_mode not in {"default", "code"}:
            raise ValueError("tools_mode must be 'default' or 'code'")
        self.egress_smoke_only = egress_smoke_only
        self.retain_sessions = retain_sessions
        self.token_limit = token_limit
        self.token_window_seconds = token_window_seconds
        self.tools_mode = tools_mode
        self.expected_reasoning_effort = expected_reasoning_effort

    @staticmethod
    def name() -> str:
        return "dsh-headless"

    async def _exec(
        self,
        environment: BaseEnvironment,
        command: str,
        user: str | int | None = None,
        env: dict[str, str] | None = None,
        cwd: str | None = None,
        timeout_sec: int | None = None,
    ) -> Any:
        merged_env = dict(env) if env else {}
        merged_env.update(self._extra_env)
        logged_env = {
            key: "<redacted>" if is_sensitive_env_key(key) else value
            for key, value in merged_env.items()
        }
        self.logger.debug(
            f"Running command: {command}",
            extra={"user": str(user), "env": logged_env},
        )
        result = await environment.exec(
            command=f"set -o pipefail; {command}",
            user=user,
            env=environment.agent_process_env(merged_env or None),
            cwd=cwd,
            timeout_sec=timeout_sec,
        )
        if result.return_code != 0:
            self.logger.debug(
                "Command failed",
                extra={
                    "return_code": result.return_code,
                    "stdout": self._truncate_output(result.stdout),
                    "stderr": self._truncate_output(result.stderr),
                },
            )
            raise NonZeroAgentExitCodeError(
                f"Command failed (exit {result.return_code}): {command}\n"
                f"stdout: {self._truncate_output(result.stdout)}\n"
                f"stderr: {self._truncate_output(result.stderr)}"
            )
        return result

    def install_spec(self) -> AgentInstallSpec:
        return AgentInstallSpec(
            agent_name=self.name(),
            version=self.version(),
            steps=[
                InstallStep(
                    user="root",
                    env={"DEBIAN_FRONTEND": "noninteractive"},
                    run="apt-get update && apt-get install -y --no-install-recommends ca-certificates curl && rm -rf /var/lib/apt/lists/*",
                ),
                InstallStep(
                    user="agent",
                    run=(
                        "set -euo pipefail; "
                        "if ! command -v node >/dev/null 2>&1 || "
                        "! node -e 'process.exit(parseInt(process.versions.node, 10) >= 22 ? 0 : 1)'; then "
                        "curl --fail --show-error --location https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash; "
                        'export NVM_DIR="$HOME/.nvm"; if [ -s "$NVM_DIR/nvm.sh" ]; then . "$NVM_DIR/nvm.sh"; fi; '
                        "nvm install 22.23.2; fi; "
                        'export NVM_DIR="$HOME/.nvm"; if [ -s "$NVM_DIR/nvm.sh" ]; then . "$NVM_DIR/nvm.sh"; fi; '
                        f"npm install -g @deepseek-ai/dsh@{self._DSH_VERSION}; "
                        "dsh --version"
                    ),
                ),
            ],
            verification_command='export NVM_DIR="$HOME/.nvm"; if [ -s "$NVM_DIR/nvm.sh" ]; then . "$NVM_DIR/nvm.sh"; fi; dsh --version',
        )

    def network_allowlist(self) -> NetworkAllowlist:
        hostname = urlparse(self.upstream_base_url).hostname
        return NetworkAllowlist(domains=[hostname] if hostname else [])

    async def setup(self, environment: BaseEnvironment) -> None:
        await super().setup(environment)
        base = Path(__file__).resolve().parent
        await environment.upload_file(
            base / "proxy" / "session_id_proxy.mjs",
            "/installed-agent/session_id_proxy.mjs",
        )
        await environment.upload_file(
            base / "config" / "dsh-eval.patch.yml",
            "/installed-agent/dsh-eval.patch.yml",
        )
        await environment.upload_file(
            base / "scripts" / "token_watchdog.mjs",
            "/installed-agent/token_watchdog.mjs",
        )
        await self.exec_as_root(
            environment,
            command=(
                "chmod 0644 /installed-agent/session_id_proxy.mjs "
                "/installed-agent/dsh-eval.patch.yml /installed-agent/token_watchdog.mjs"
            ),
        )

    def populate_context_post_run(self, context: AgentContext) -> None:
        return None

    @with_prompt_template
    async def run(self, instruction: str, environment: BaseEnvironment, context: AgentContext) -> None:
        if self.smoke_only:
            await self.exec_as_agent(
                environment,
                command=(
                    "set -euo pipefail; "
                    'export NVM_DIR="$HOME/.nvm"; if [ -s "$NVM_DIR/nvm.sh" ]; then . "$NVM_DIR/nvm.sh"; fi; '
                    "dsh --version; "
                    "node --check /installed-agent/session_id_proxy.mjs; "
                    "node --check /installed-agent/token_watchdog.mjs; "
                    "printf 'DSH adapter install smoke passed\\n' | tee /logs/agent/install-smoke.txt; "
                    "test -s /logs/agent/install-smoke.txt"
                ),
            )
            return

        env = self.build_process_env({
            "DSH_HOME": "/tmp/dsh-deepswe",
            "DSH_PERMISSION_MODE": "danger-full-access",
            "DEEPSEEK_BASE_URL": "http://127.0.0.1:8787",
            "DEEPSWE_UPSTREAM_BASE_URL": self.upstream_base_url,
            "DEEPSWE_MODEL_SESSION_ID": str(self.transport_session_id),
            "DEEPSWE_PROXY_AUDIT_PATH": "/logs/agent/proxy-audit.jsonl",
            "DEEPSWE_TOKEN_LIMIT": str(self.token_limit),
            "DEEPSWE_TOKEN_WINDOW_SECONDS": str(self.token_window_seconds),
            "DEEPSWE_EXPECTED_MODEL": str(self._parsed_model_name or ""),
            "DEEPSWE_EXPECTED_REASONING_EFFORT": self.expected_reasoning_effort,
            "NODE_USE_ENV_PROXY": "1",
        })
        if self.tools_mode is not None:
            env["DSH_TOOLS_MODE"] = self.tools_mode
        if self.egress_smoke_only:
            command = (
                "set -euo pipefail; "
                'export NVM_DIR="$HOME/.nvm"; if [ -s "$NVM_DIR/nvm.sh" ]; then . "$NVM_DIR/nvm.sh"; fi; '
                "node /installed-agent/session_id_proxy.mjs > /logs/agent/proxy.log 2>&1 & proxy_pid=$!; "
                "trap 'kill $proxy_pid 2>/dev/null || true; wait $proxy_pid 2>/dev/null || true' EXIT; "
                "for i in $(seq 1 30); do curl -fsS http://127.0.0.1:8787/health >/dev/null && break; sleep 0.2; done; "
                "curl -fsS http://127.0.0.1:8787/health >/dev/null; "
                "status=$(curl -sS -o /logs/agent/proxy-egress-response.json -w '%{http_code}' "
                "-H 'content-type: application/json' "
                "--data '{\"model\":\"invalid-egress-smoke\",\"messages\":[]}' "
                "http://127.0.0.1:8787/chat/completions); "
                "test \"$status\" != 000; test \"$status\" != 502; "
                "printf 'proxy egress smoke passed with upstream HTTP %s\\n' \"$status\" "
                "| tee /logs/agent/proxy-egress-smoke.txt"
            )
            await self.exec_as_agent(environment, command=command, env=env)
            return

        session_export = ""
        if self.retain_sessions:
            session_export = (
                "mkdir -p /logs/agent; "
                "git -C /app status --short > /logs/agent/worktree-status.txt || "
                "printf 'WARNING: failed to export worktree status\\n' >&2; "
                "git -C /app add -N . >/dev/null 2>&1 || true; "
                "git -C /app diff --binary HEAD > /logs/agent/model.patch || "
                "printf 'WARNING: failed to export model patch\\n' >&2; "
                "git -C /app reset --quiet >/dev/null 2>&1 || true; "
                "if [ -d /tmp/dsh-deepswe/sessions ]; then "
                "mkdir -p /logs/agent/dsh-home && "
                "cp -a /tmp/dsh-deepswe/sessions /logs/agent/dsh-home/ && "
                "chmod -R go-rwx /logs/agent/dsh-home || "
                "printf 'WARNING: failed to export DSH sessions\\n' >&2; fi; "
                "chmod go-rwx /logs/agent/model.patch /logs/agent/worktree-status.txt 2>/dev/null || true; "
            )
        command = (
            "set -euo pipefail; "
            'export NVM_DIR="$HOME/.nvm"; if [ -s "$NVM_DIR/nvm.sh" ]; then . "$NVM_DIR/nvm.sh"; fi; '
            "watchdog_pid=; node /installed-agent/session_id_proxy.mjs > /logs/agent/proxy.log 2>&1 & proxy_pid=$!; "
            f"cleanup() {{ status=$?; if [ -n \"$watchdog_pid\" ]; then kill $watchdog_pid 2>/dev/null || true; wait $watchdog_pid 2>/dev/null || true; fi; kill $proxy_pid 2>/dev/null || true; wait $proxy_pid 2>/dev/null || true; {session_export}exit $status; }}; "
            "trap cleanup EXIT; "
            "for i in $(seq 1 30); do curl -fsS http://127.0.0.1:8787/health >/dev/null && break; sleep 0.2; done; "
            "curl -fsS http://127.0.0.1:8787/health >/dev/null; "
            "node /installed-agent/token_watchdog.mjs > /logs/agent/token-watchdog.log 2>&1 & watchdog_pid=$!; "
            # Extra "--": the profile app re-parses the forwarded args with its own
            # strict commander, so a task text starting with "-" (e.g. "- Update ...")
            # would otherwise die as "unknown option". The first "--" is consumed by
            # the dsh launcher; the second makes the app treat the task as positional.
            f"dsh --profile headless --patch /installed-agent/dsh-eval.patch.yml -- -- {shlex.quote(instruction)} "
            "2>&1 | stdbuf -oL tee /logs/agent/dsh-output.txt"
        )
        await self.exec_as_agent(environment, command=command, env=env)
