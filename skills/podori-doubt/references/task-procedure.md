# Read-only assessment

## Decision Gate

Before material trust decisions, read [decision gates](decision-gate.md).
Gate suspicious-behavior classification and unresolved trust evidence before final findings.
If a suitable callable decision skill exists, you must invoke it.
If no suitable callable skill exists, record discovery evidence before the normal procedure.
If approval is absent or the call fails, hold dependent actions and conclusions.
Continue independent checks.
Report actual call evidence, result validity, and host-enforcement status.

## Procedure

1. Record target identifiers, origin, acquisition time, approved policy, and available evidence.
2. For artifact inspection, read [artifact inspection](artifact-inspection.md).
3. Compute actual hashes and verify applicable descriptor chains.
4. Compare independent approved baselines, signatures, trusted identities, and digest-bound provenance.
5. Inventory transitive components, base images, hooks, entrypoints, and unexplained changes.
6. Inspect suspicious behavior statically with exact file, layer, and activation-path evidence.
7. Run available offline scanners only after verified non-execution and network controls.
8. If authorized, trace artifact origin, derived images, and actual workloads through the reference procedure.
9. Report each dimension below through [assessment](../templates/assessment.md) without registry or deployment changes.

| Dimension | Evidence |
|---|---|
| Identity | Bytes, coordinates, version, platform, and digests |
| Integrity and origin | Independent baseline, approved trust roots, signatures, and provenance |
| Behavior | Hooks, startup paths, concealed code, destinations, and credential access |
| Vulnerabilities | Local database freshness, coverage, and exact-artifact scan results |
| Coverage | Examined components, unsupported formats, opaque content, and missing evidence |

## Verification

Mark checks `verified`, `failed`, or `unverified` with evidence, or `not-applicable` with a scope reason.
A demonstrated mismatch or policy violation is `failed`, not automatically malware.
Missing, stale, unreadable, or unsupported required evidence is `unverified`.
Recommend a hold for required failures and no unconditional approval for unresolved required evidence.
Otherwise, report conformity only to the stated policy and inspected scope, never a malware-free guarantee.
Account for every requested artifact, unresolved dependency, and child manifest.
Record commands, tool versions, exit status, evidence dates, and exact digests without secrets.
Separate suspicion from confirmed compromise and static review from runtime observation.
Require separate approval for quarantine, deletion, rescans, incident response actions, or deployment changes.

## Pitfalls

Internal storage, valid signatures, and clean CVE scans do not prove harmless content.
A checksum from the same suspect source does not establish independent trust.
Script suppression does not make imports or every package-manager command safe.
Registry contents do not prove production state.
