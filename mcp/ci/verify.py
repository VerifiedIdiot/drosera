"""Run required checks and keep raw evidence outside the repository."""

import json
import os
import re
import subprocess
from pathlib import Path


def main():
    package = Path(__file__).resolve().parents[1]
    evidence = Path(os.environ["PODORI_EVIDENCE_DIR"])
    if not evidence.is_dir() or evidence.resolve().is_relative_to(package.parent):
        raise RuntimeError("private-evidence-directory-required")
    checks = [
        ("build", ["npm", "run", "build"], 120),
        ("typecheck", ["npm", "run", "typecheck"], 120),
        ("unit", ["npm", "test"], 180),
        ("native-isolation-smoke", ["node", "ci/native-isolation-smoke.mjs"], 180),
        ("integration", ["npm", "run", "test:integration"], 900),
    ]
    for name, command, timeout in checks:
        result = subprocess.run(command, cwd=package, capture_output=True, text=True, timeout=timeout)
        output = result.stdout + result.stderr
        log = evidence / f"{name}.log"
        log.write_text(output)
        log.chmod(0o600)
        print(f"::group::{name}", flush=True)
        print(re.sub(r"(?i)(?<![a-f0-9])[a-f0-9]{64}(?![a-f0-9])", "[REDACTED]", output), flush=True)
        print("::endgroup::", flush=True)
        print(json.dumps({"check": name, "exit_code": result.returncode}), flush=True)
        if result.returncode:
            raise SystemExit(result.returncode)


if __name__ == "__main__":
    main()
