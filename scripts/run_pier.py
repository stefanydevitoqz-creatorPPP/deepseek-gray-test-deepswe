from __future__ import annotations

from pathlib import Path

import pier.environments.docker.docker as docker_environment
from pier.cli.main import app


_original_write_docker_proxy_compose = docker_environment.write_docker_proxy_compose


def _write_docker_proxy_compose_lf(*args, **kwargs):
    compose_path = _original_write_docker_proxy_compose(*args, **kwargs)
    proxy_dir = Path(kwargs["proxy_dir"])
    script_path = proxy_dir / "start-squid.sh"
    script = script_path.read_text(encoding="utf-8")
    script_path.write_text(script, encoding="utf-8", newline="\n")
    return compose_path


docker_environment.write_docker_proxy_compose = _write_docker_proxy_compose_lf


if __name__ == "__main__":
    app()
