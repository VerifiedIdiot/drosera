# Synthetic verification procedures

## Procedure

1. Call `sandbox_environment`.
2. Verify the platform, runtime identity, fixture revision, image digest, and fixed budget against the approval.
3. Call `sandbox_create` with the one-use approval capability.
4. Keep the returned experiment token in the current authorized client session.
5. Call `sandbox_status` within the approved wait limit until the experiment is ready or terminal.
6. Call `sandbox_run` with the approved scenario.
7. Treat its immediate result as `unverified`.
8. Call `sandbox_status` within the approved wait limit until the attempt is terminal.
9. Call `sandbox_evidence`.
10. Verify identifiers, hashes, initial data, actual responses, and normal behavior.
11. If another approved attempt is necessary, call `sandbox_reset`.
12. Verify the reset observations before the next attempt.
13. Export evidence without capabilities or tokens.
14. Call `sandbox_dispose`.
15. Verify the terminal status and confirmed resource removal.
16. Return under the completion contract without another general review.

If a user cancels, call `sandbox_cancel`.
After cancellation, collect evidence and dispose of the experiment.
Approval expiry does not prevent status, evidence, cancellation, or disposal.

## Verdicts

Use `reproduced` only when actual observations demonstrate the report claim.
Use `not-reproduced` only after a complete observation that does not demonstrate the claim.
Use `unverified` for exclusions, refusals, missing prerequisites, failures, timeouts, or incomplete output.
A `not-reproduced` result does not establish general safety.
A fix requires both defect-specific evidence and normal-behavior evidence.
A scenario success flag is not evidence.

## Limits

The backend supports a reviewed synthetic fixture, not hostile code.
The guest deadline limits its lifetime if the controller stops.
A stopped container can remain until the controller restarts.
A damaged state directory or unavailable Docker daemon can prevent automatic cleanup.
Report unresolved resource identifiers without a cleanup claim.
Do not delete unrelated containers, images, networks, or volumes.
Do not use broad prune commands.
For a claimed fix, require independent affected review and separate release approval.
