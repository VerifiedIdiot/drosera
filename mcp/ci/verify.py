"""Run fixed checks and require complete native Node test evidence."""

import json
import math
import os
import re
import subprocess
from pathlib import Path

PACKAGE = Path(__file__).resolve().parents[1]
MANIFEST = Path(__file__).with_name("required-tests.json")


def test_status(output, required, package):
    """Accept only the flat native event shape used by this package."""
    try:
        identities = [(item["file"], item["name"]) for item in required]
        if not identities or len(set(identities)) != len(identities):
            return "BLOCKED"
        events = [json.loads(line) for line in output.splitlines()]
        if not events or any(not isinstance(event, dict) or
                             not isinstance(event.get("data"), dict) or
                             not isinstance(event.get("type"), str) for event in events):
            return "BLOCKED"
        summaries = [event for event in events if event["type"] == "test:summary"
                     and "file" not in event["data"]]
        if len(summaries) != 1 or events[-1] != summaries[0]:
            return "BLOCKED"
        summary = summaries[0]["data"]
        counts = summary["counts"]
        keys = ("tests", "passed", "failed", "cancelled", "skipped", "todo", "suites", "topLevel")
        if any(type(counts[key]) is not int or counts[key] < 0 for key in keys):
            return "BLOCKED"
        if any(counts[key] for key in ("cancelled", "skipped", "todo", "suites")):
            return "BLOCKED"
        outcomes = {}
        failed = 0
        for event in events:
            if event["type"] not in ("test:pass", "test:fail"):
                continue
            data = event["data"]
            identity = (Path(data["file"]).resolve().relative_to(package.resolve()).as_posix(), data["name"])
            if identity in outcomes or type(data["nesting"]) is not int or data["nesting"] != 0 or data["details"]["type"] != "test":
                return "BLOCKED"
            duration = data["details"]["duration_ms"]
            if type(duration) not in (int, float) or not math.isfinite(duration) or duration < 0:
                return "BLOCKED"
            if "skip" in data or "todo" in data:
                return "BLOCKED"
            if event["type"] == "test:fail":
                if data["details"]["error"]["failureType"] != "testCodeFailure":
                    return "BLOCKED"
                failed += 1
            outcomes[identity] = event["type"]
        if set(outcomes) != set(identities):
            return "BLOCKED"
        if counts["tests"] != len(outcomes) or counts["topLevel"] != len(outcomes):
            return "BLOCKED"
        if counts["failed"] != failed or counts["passed"] != len(outcomes) - failed:
            return "BLOCKED"
        if type(summary["success"]) is not bool or summary["success"] != (failed == 0):
            return "BLOCKED"
        return "FAIL" if failed else "PASS"
    except (ValueError, TypeError, KeyError, AttributeError):
        return "BLOCKED"


def main():
    package = PACKAGE
    evidence = Path(os.environ["PODORI_EVIDENCE_DIR"])
    if not evidence.is_dir() or evidence.resolve().is_relative_to(package.parent):
        raise RuntimeError("private-evidence-directory-required")
    # Freeze identities before execution. Never derive requirements from results.
    try:
        required = json.loads(MANIFEST.read_text())
        if not isinstance(required, dict):
            raise ValueError("invalid-required-manifest")
    except (OSError, ValueError):
        print(json.dumps({"check": "required-manifest", "status": "BLOCKED"}), flush=True)
        raise SystemExit(2)
    runner = ["node", "--test", "--test-concurrency=1", "--test-reporter=./ci/node-report.mjs"]
    checks = [
        ("build", ["npm", "run", "build"], 120),
        ("typecheck", ["npm", "run", "typecheck"], 120),
        ("unit", runner + ["test/*.test.mjs"], 180),
        ("native-isolation-smoke", ["node", "ci/native-isolation-smoke.mjs"], 180),
        ("integration", runner + ["test/integration/*.test.mjs"], 900),
    ]
    for name, command, timeout in checks:
        timed_out = False
        try:
            result = subprocess.run(command, cwd=package, capture_output=True, text=True, timeout=timeout)
        except subprocess.TimeoutExpired as error:
            timed_out = True
            result = subprocess.CompletedProcess(command, 2, error.stdout, error.stderr)
        # TimeoutExpired may retain bytes even when text=True, or no stream at all.
        raw = b''.join(stream if isinstance(stream, bytes) else (stream or '').encode('utf-8')
                       for stream in (result.stdout, result.stderr))
        output = raw.decode('utf-8', errors='replace')
        log = evidence / f"{name}.log"
        with os.fdopen(os.open(log, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600), 'wb') as handle:
            os.fchmod(handle.fileno(), 0o600)
            handle.write(raw)
        print(f"::group::{name}", flush=True)
        print(re.sub(r"(?i)(?<![a-f0-9])[a-f0-9]{64}(?![a-f0-9])", "[REDACTED]", output), flush=True)
        print("::endgroup::", flush=True)
        if timed_out:
            print(json.dumps({"check": name, "exit_code": 2, "status": "BLOCKED"}), flush=True)
            raise SystemExit(2)
        # Only this command's stdout can establish freshness. Old logs are not inputs.
        status = test_status(result.stdout, required.get(name, []), package) if name in ("unit", "integration") else "PASS"
        if name == "native-isolation-smoke":
            try:
                stdout_records = [json.loads(line) for line in result.stdout.splitlines()]
                stderr_records = [json.loads(line) for line in result.stderr.splitlines()]
                completion = [record for record in stdout_records + stderr_records
                              if record.get("check") == name]
                passed = {"check": name, "status": "passed"}
                failed = {"check": name, "status": "failed"}
                status = "BLOCKED"
                if completion == [passed] and passed in stdout_records and result.returncode == 0:
                    status = "PASS"
                elif completion == [failed] and failed in stderr_records and result.returncode != 0:
                    status = "FAIL"
            except (ValueError, AttributeError):
                status = "BLOCKED"
        if status == "PASS" and result.returncode:
            status = "FAIL"
        print(json.dumps({"check": name, "exit_code": result.returncode, "status": status}), flush=True)
        if status == "BLOCKED":
            raise SystemExit(2)
        if status == "FAIL":
            raise SystemExit(result.returncode or 1)


if __name__ == "__main__":
    main()
