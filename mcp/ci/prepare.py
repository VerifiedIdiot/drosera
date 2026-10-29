"""Prepare the fixed native runtime on a disposable GitHub runner."""

import hashlib
import json
import os
import platform
import subprocess
import tarfile
from pathlib import Path

RELEASE = "release-20261026.0"
PINS = {
    "amd64": ("x86_64", "096589d2d6078ba4caa26aa0200932f571aa5da9d08a5156b98ab1d93fa54468"),
    "arm64": ("aarch64", "6b03c9d53f46b5ac56fd32522f38f108645e9f80a26a335e86ad1e09dcdaefda"),
}
BASE_IMAGE = "docker.io/library/node@sha256:a5f4366e834695d5f363b920c104953a535d3a9864d1bdf74566a0ebe01daee5"
MEMBERS = {
    "containerd-shim-runsc-v1", "runsc", "gvisor-bin",
    "gvisor-bin/checkpointgofer", "gvisor-bin/gvisor-proc-umounter",
    "gvisor-bin/gvisor-sentry-prewarmer", "gvisor-bin/gvisor_sentry",
    "gvisor-bin/runsc-fd-parking", "gvisor-bin/runsc-metric-server",
}


def run(args, timeout=60):
    return subprocess.run(args, check=True, capture_output=True, text=True, timeout=timeout).stdout.strip()


def main():
    if os.environ.get("GITHUB_ACTIONS") != "true" or platform.system() != "Linux":
        raise RuntimeError("disposable-github-linux-runner-required")
    arch = {"x86_64": "amd64", "aarch64": "arm64"}.get(platform.machine())
    if arch != os.environ["PODORI_EXPECTED_ARCH"] or arch not in PINS:
        raise RuntimeError("native-architecture-mismatch")
    runtime = os.environ["PODORI_TEST_RUNTIME"]
    if runtime not in {"runc", "runsc"}:
        raise RuntimeError("unsupported-runtime")
    temporary = Path(os.environ["RUNNER_TEMP"])
    evidence = Path(os.environ["PODORI_EVIDENCE_DIR"])
    if evidence.parent.resolve() != temporary.resolve():
        raise RuntimeError("private-runner-evidence-required")
    evidence.mkdir(mode=0o700)
    if runtime == "runsc":
        release_arch, expected = PINS[arch]
        archive = temporary / "podori-gvisor.tar.bz2"
        url = f"https://github.com/google/gvisor/releases/download/{RELEASE}/gvisor-{release_arch}.tar.bz2"
        run(["curl", "--fail", "--silent", "--show-error", "--location", "--proto", "=https", "--proto-redir", "=https", "--max-time", "120", "--max-filesize", "150000000", url, "--output", str(archive)], 130)
        if hashlib.sha256(archive.read_bytes()).hexdigest() != expected:
            raise RuntimeError("runtime-archive-digest-mismatch")
        with tarfile.open(archive, "r:bz2") as bundle:
            members = bundle.getmembers()
            if len(members) != len(MEMBERS) or {item.name for item in members} != MEMBERS:
                raise RuntimeError("runtime-archive-members-mismatch")
            if any(not (item.isfile() or item.isdir()) for item in members):
                raise RuntimeError("runtime-archive-type-mismatch")
            if any((Path("/usr/local/bin") / item.name).exists() for item in members):
                raise RuntimeError("runtime-destination-already-exists")
        run(["sudo", "tar", "--no-same-owner", "-xjf", str(archive), "-C", "/usr/local/bin"])
        print(run(["/usr/local/bin/runsc", "--version"]))
        run(["sudo", "/usr/local/bin/runsc", "install"])
        run(["sudo", "systemctl", "reload", "docker"])
    info = json.loads(run(["docker", "info", "--format", "{{json .}} "]))
    if runtime not in info["Runtimes"]:
        raise RuntimeError("selected-runtime-not-registered")
    print(json.dumps({"architecture": arch, "runtime": runtime, "registered_runtime": info["Runtimes"][runtime]}))
    run(["docker", "pull", "--platform", f"linux/{arch}", BASE_IMAGE], 180)


if __name__ == "__main__":
    main()
