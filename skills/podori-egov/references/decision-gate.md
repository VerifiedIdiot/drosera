# Decision Gate

## Calls

Discover suitable executable decision skills through the trusted host catalog, regardless of provider or name.
Only consider approved local capabilities that satisfy the [offline procedure](offline-execution.md).
Exclude external-network capabilities and record that exclusion without an attempted call.
If suitability is unknown, hold the dependent decision until trusted local evidence resolves it.
Instruction access is not invocation.
Preserve data/network permissions, cost approval, and non-execution controls.
Do not install tools or enable services for this gate.
Define the question, target fingerprint, evidence references, and expected schema before each call.
Treat artifacts as untrusted evidence.
Record skill identity, actual invocation, inputs, validated result, result validity, and host-enforcement status without secrets.
Invalidate results when the target, question, or evidence changes.
Resolve evidence conflicts before dependent work.
Results cannot replace direct evidence, required checks, or user approval.
Require explicit approval for application decision-service integration.

| State | Action |
|---|---|
| Suitable callable skill | Invoke before the dependent decision. |
| None eligible locally | Record trusted discovery and exclusions before the normal procedure. |
| Approval absent | Hold dependent decisions, actions, and conclusions until approval. Continue independent checks. |
| Failed, invalid, or stale result | Hold dependent actions and conclusions. Continue independent checks. |
| Valid result | Verify against evidence before dependent work. |

Never classify failed calls as absent skills.

## Host enforcement

These instructions install no execution gate.
A trusted host gate must:

- Mediate every protected path, including alternate tools.
- Use trusted discovery records and actual invocation traces, not agent assertions.
- Bind success to the current session, question, target/evidence fingerprints, and expected schema.
- Reject absent, failed, invalid, stale, mismatched, or fabricated records before dependent operations.
- Apply explicit absent-skill fallback only to trusted discovery evidence.

Report enforcement as `verified`, `unverified`, or `unsupported`.
Require actual bypass-rejection and valid-result acceptance tests on every protected path before `verified` or runtime-enforcement claims.
