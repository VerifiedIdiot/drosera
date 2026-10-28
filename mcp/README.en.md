# podori sandbox MCP

[한국어 안내](README.md) | English

This optional local stdio package accompanies `0.5.0`. The four existing skills work without this package.

## Supported scope

The package runs only the bundled `synthetic-http-v1` app. One container runs the vulnerable and fixed variants on separate loopback ports. A fixed driver sends actual HTTP requests inside the same container.

- `authorization`: Compare synthetic account alice's own-document access with access to bob's document. The fixed variant rejects cross-account requests with 403.
- `input-validation`: Compare the valid quantity 2 with the invalid quantity -1. The fixed variant rejects -1 with 400 and preserves the valid quantity.

Inputs cannot specify arbitrary repositories, images, paths, code, shells, or external targets. Production data, real credentials, attack chains, code-execution vulnerability demonstrations, destructive tests, and resource-exhaustion tests are outside the supported scope. This implementation does not guarantee isolation of malicious code or protection against container escapes.

## Prerequisites

The host requires an approved local Docker Unix socket and a linux/arm64 image. It also requires cgroup v2, default seccomp, and CPU, memory, and PID limits. The package rejects remote TCP/SSH endpoints. It restricts the Docker CLI environment and explicitly selects the stored endpoint for every operation.

The declared host Node range is `>=24 <26`. Development tests use Node 25 and Docker Desktop on macOS arm64. The guest uses the fixed Node 24.22.0 image. Other hosts and architectures are outside the verified scope.

```sh
npm ci --ignore-scripts --no-audit --no-fund --registry=https://registry.npmjs.org
npm run build
npm run typecheck
```

Exact versions and `package-lock.json` pin dependencies. Install hooks do not run. The server/client SDK version is 2.4.0. Other versions are zod 4.6.7, TypeScript 7.0.2, and `@types/node` 24.19.2. The package does not automatically install separate scanners, Inspector, or telemetry tools.

The following user-approved base image must exist locally with its actual configuration and layers. `prepare` does not pull the base image.

```text
docker.io/library/node@sha256:a5f4366e834695d5f363b920c104953a535d3a9864d1bdf74566a0ebe01daee5
linux/arm64 manifest: sha256:156e9bc7a0a267cc6ca77b4283e32b123479342df684ce297455d7b95ff5a6b5
```

## Trusted host operator procedure

The following commands are not MCP tools. Before execution, the operator must review the target, report item, scenario, budget, and expiry. The operator must execute these commands directly. Do not give the MCP client write access to approval files or the state directory.

1. Select a state directory path outside the repository. Its parent directory must exist before creation.
2. Verify the Unix socket for the approved Docker context.
3. Prepare the fixture through that endpoint.

```sh
STATE=/absolute/private/podori-state
ENDPOINT="$(docker context inspect --format '{{.Endpoints.docker.Host}}')"
node dist/host.js prepare "$STATE" "$ENDPOINT"
```

`prepare` creates the directory with mode 0700 and state files with mode 0600. It verifies ownership and permissions for an existing state directory. It rejects symbolic links, multiple hard links, invalid paths, and excessive file sizes. The CLI also rejects attempts to overwrite an existing policy.

Builds use only `fixture/` as their context. The Dockerfile contains no installation step or `RUN`. It contains root-owned fixture files, a non-root user, and fixed independent processes with limits. The build uses the local base image without network access. The policy pins the final image identifier and fixture content hashes.

4. Specify the report ID, item ID, registered scenario, and a UTC expiry within 24 hours.

```sh
EXPIRY="$(node -p 'new Date(Date.now() + 600000).toISOString()')"
node dist/host.js approve "$STATE" report-1 auth-1 authorization "$EXPIRY"
```

For an input-validation item, specify `input-validation`. Output contains only the approval ID and the `capability-<UUID>.json` filename. That 0600 file stores the actual single-use capability. MCP exposes neither an approval tool nor an `approved: true` input.

5. Set the state path as a server argument in the local MCP client.

```json
{
  "command": "node",
  "args": ["/absolute/path/podori/mcp/dist/server.js", "/absolute/private/podori-state"]
}
```

Without a state argument, the server only reports whether the environment lacks configuration. STDOUT carries only MCP messages. The package exposes no HTTP MCP listener or public port.

## MCP use

Read `../skills/podori-wreck/references/tool-contract.md` for the complete input and tool contract.

| Step | Tool | Behavior |
|---|---|---|
| 1 | `sandbox_environment` | Verify the image, revision, budgets, and host controls |
| 2 | `sandbox_create` | Consume single-use approval with `approvalId` and `claimToken` |
| 3 | `sandbox_status` | Verify readiness with `experimentId` and `accessToken` |
| 4 | `sandbox_run` | Start the comparison with access fields and the approved `scenario` |
| 5 | `sandbox_evidence` | Read actual HTTP observations, hashes, and verdicts |
| 6 | `sandbox_reset` | Restore actual app data and verify the HTTP response |
| 7 | `sandbox_cancel` | Stop only the requested experiment |
| 8 | `sandbox_dispose` | Remove the owned resources and preserve evidence |

Creation returns the experiment token only once. Subsequent access requires both the ID and token. The server stores only the token hash. Do not copy tokens into logs, public reports, or other agents.

The immediate `run` response is `unverified`. Do not infer a successful fix from completion status alone. Verify normal requests, defect requests, before/after state, identifiers, and hashes in the evidence. `not-reproduced` is not a general safety guarantee. Exclusions, rejections, timeouts, truncated output, and environment errors remain unverified.

## Report-based completion

Before execution, fix the required report items, approved scenarios, and observation and verification criteria. Finish the task after the required observations and resource cleanup pass verification. A successful review does not require repetition or exhaustion of the attempt limit.

Keep experiment verdicts (`reproduced`, `not-reproduced`, `unverified`) separate from task outcomes (`COMPLETED`, `BLOCKED`). Completion of verification does not establish that the target code passes every security check. A successful fix requires evidence for both the defect and normal behavior.

Keep separate new claims and optional experiments on a follow-up list. Do not execute them automatically. If approval, controls, transport, or required evidence fail, record unresolved items and known resources. Return `BLOCKED`. If cleanup lacks verification, use the same blocked outcome. Do not bypass these limits through the host shell or another backend.

## Controls and cleanup

- Each container uses network none, non-root 1000:1000, cap-drop ALL, no-new-privileges, and a read-only rootfs.
- Containers have no host bind mounts, Docker socket, user credentials, or published ports.
- Each container has CPU 0.5, combined memory/swap 128 MiB, PID 64, and `/tmp` tmpfs 4 MiB limits.
- Each state directory permits 2 concurrent experiments and 20 total records. Each experiment permits 4 attempts and 4 resets.
- Comparisons and resets have an 8-second limit. Ordinary Docker calls have a 10-second limit. Combined output cannot exceed 32 KiB. Host-only builds have a 120-second limit.
- The independent fixed `/usr/bin/timeout` terminates the guest after 45 seconds. This limit remains effective if SIGKILL terminates the controller.
- The controller saves state before creation. It verifies resource names and controller/experiment ownership labels before removal of exact container IDs.
- Cancellation and timeout invalidate the active operation generation. The controller waits for delayed creation and observations, then verifies removal again.
- Restart cleanup recovers only resources that belong to the same state. Incomplete attempts remain `unverified`.
- After approval expires, the server rejects new runs and resets. The owner retains access to status, evidence, cancellation, and disposal.
- Cleanup does not broadly delete images, existing containers, networks, or volumes. Fixture images remain intact.

If Docker stops, the controller cannot verify resource removal. If the controller stops, terminated container objects can remain until restart. Preserve state and labels during recovery. Deletion of state while owned resources remain removes the basis for automatic recovery.

`server.guard` prevents concurrent takeover of a stale lock. If the host process exits during lock acquisition, manual checks can be necessary. The operator must verify that the recorded PID no longer runs. The operator must verify the exact state path. MCP exposes no lock-deletion or approval-recovery tool.

## Tests

Set the test artifact path outside the repository. Docker integration tests create actual fixture containers and remove only their exact owned resources.

```sh
export PODORI_EVIDENCE_DIR=/absolute/private/podori-evidence
npm run build
npm run typecheck
npm test
npm run test:integration
```

Tests cover the actual SDK stdio Client, HTTP requests, isolation probes, and loopback separation between experiments. They also cover reset, cancellation, delayed completion, timeout, process failure, and restart. The independent deadline test waits the actual 45 seconds without the controller. Tests verify internal links, independent use without MCP, and the doubt non-execution boundary for the four existing skills.

Separate unit policy tests and injected delays or errors from evidence of actual isolation. Operational fault injection exists only in the test adapter, not in MCP inputs. Egress probes use only the reserved addresses `192.0.2.1` and `2001:db8::1`.

## Verification limits

Lockfile integrity and inspection of actual package metadata and install hooks do not prove the absence of malicious code. Independent signature and build provenance verification, current CVE databases, and other-platform binaries require separate work. Complete audits of transitive source code and Node OS layers also remain outside this scope. Do not reuse older fixture revisions or unexecuted results as evidence that the current source passed.
