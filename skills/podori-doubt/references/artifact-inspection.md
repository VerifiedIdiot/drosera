# Static Artifact Inspection

## Isolation

Use approved patched tools with CPU, memory, file-count, and expanded-size limits.
Inspect metadata before extraction and reject traversal, absolute paths, unsafe links, devices, and decompression bombs.
Keep extraction inside a disposable directory without credentials, host mounts, automatic previews, or native-library loads.
For suspicious parser inputs, use approved isolation or stop the affected check.
Preserve original bytes and copy provenance.
Dynamic execution belongs to a separately approved investigation, not this skill.
Require disposable isolation without credentials, host integration, or uncontrolled egress.
A container alone does not establish that isolation.

## Identity and Trust

1. Preserve the supplied reference and record its resolved immutable identifier separately.
2. Hash actual bytes, with archive, package, index, and manifest digests distinguished.
3. Verify signatures against preapproved keys or certificate identities and issuers.
4. Bind signatures and provenance to the exact artifact digest.
5. Compare source revision, builder, parameters, and materials against approved expectations.
6. For offline verification, use available signature bundles, trust roots, and required proof material.
7. Report stale roots, unavailable revocation updates, incomplete proofs, and unsupported schemes.

Keys supplied only by the suspect artifact do not establish trust.
An intentional internal rebuild needs an independently approved baseline.
A signed build can still contain malicious code.

## Package Surfaces

| Surface | Inspect statically |
|---|---|
| Resolution | Namespace, registry origin, lockfile integrity, exact versions, and transitive inventory |
| JavaScript | Lifecycle hooks, executables, loaders, package-manager configuration, and native addons |
| Python | Build backends, `setup.py`, `.pth`, import hooks, entrypoints, and native modules |
| OS packages | Install/removal scripts, services, scheduled tasks, ownership, and capabilities |
| Other ecosystems | Build plugins, compiler hooks, native components, and runtime initialization |
| Changes | New executables, encoded code, unexpected destinations, credential access, and unexplained differences |

Avoid package-manager resolution or metadata commands that can execute build hooks.
Trace signals to their activation path and purpose before allegations of infection.
Record opaque content and unsafe-to-resolve dependencies as coverage gaps.

## Images and Registries

1. Record the index and requested platform-child manifest digests separately.
2. Verify manifest, configuration, and layer descriptors against actual digests and sizes.
3. Inspect raw layers and final filesystem state with correct whiteout and replacement semantics.
4. Inspect entrypoint, command, healthcheck, user, startup files, and privilege-related metadata without execution.
5. Compare base-image, inventory, SBOM, and history claims against actual content.
6. For approved registry reads, enumerate all requested pages and relevant untagged children.
7. Bind existing scans to exact digests, platforms, scanner versions, and database dates.

Do not run/build images or mount a host runtime socket.
Later deletion does not remove sensitive bytes from earlier layers.
Investigate representation changes before a tampering claim.
Missing reports or scanner errors are unavailable evidence, not zero vulnerabilities.

## Approved Environment Tracing

Confirm approved endpoints, cluster contexts, namespaces, repository/workload selectors, time window, and allowed read operations.
Credentials and the current context do not establish authorization.
Pin approved kubeconfig, context, namespace, endpoint, and selectors for every cluster query.
Never rely on mutable current-context defaults.
On configuration or destination drift, stop and reconfirm scope.
If scope is absent, report the gap without environment queries.
Read-only tracing excludes secret reads, pod execution, registry scan jobs, restarts, artifact changes, and policy changes.

1. Use bounded metadata queries within scope, or approved exports with their observation times.
2. Match supplied IOCs and trusted hashes against inspected files, entrypoints, configuration, and layers.
3. Trace base-to-derived relationships through available provenance, build records, and verified content evidence.
4. Treat shared layers and names as clues, not proof of a dependency or infection.
5. Map workload owners and requested image references to observed runtime image identifiers.
6. Include regular, init, and ephemeral containers within scope.
7. Resolve index/platform relationships before digest comparison and retain unsupported identifiers as unverified.
8. For recovery review, compare observed workloads against the independently approved replacement artifacts.
9. Report each relationship with its evidence, observation time, confidence, and unresolved coverage.

Do not claim cluster-wide cleanup from samples, tag overwrites, pull policy, or restarts alone.
If live access is unavailable, distinguish historical exports from current state.
Keep runtime investigation and containment separate from this non-execution procedure.

## Offline Scanners

Verify local databases, baselines, signatures, and rule sets for origin, integrity, date, and schema compatibility.
Use local help to verify tool-specific offline controls, not assumed universal flags.
Use independently approved scanner configuration, not artifact-supplied configuration or ignore files.
Record effective settings and exclusions as coverage gaps.
Disable downloads, update checks, language lookups, plugins, remote verification, telemetry, and implicit pulls as applicable.
Use local artifact inputs with enforced network denial, or omit the scanner and report the gap.
Vulnerability databases do not cover all malicious behavior.

## Findings

Record digest, file/layer, line/byte range, activation path, behavior, baseline difference, and confidence.
Redact secret values without loss of location evidence.
For suspected exfiltration or persistence, inspect code without execution or contact with its destination.

## Optional Background

These links provide background, not required tools or procedures.
Do not fetch them automatically.

- [OCI image manifests](https://github.com/opencontainers/image-spec/blob/main/manifest.md)
- [Sigstore offline verification](https://sigstore.github.io/sigstore-python/advanced/offline/)
