# Report Completion

## Read-only contract

Before inspection, freeze the target identifiers, required assessment dimensions, evidence boundaries, and permitted read operations.
Keep the frozen contract revision separate from result updates.
Use the [assessment](../templates/assessment.md) to record each required result.
Do not turn failed or unverified findings into permission to install, execute, repair, quarantine, or deploy artifacts.

## Verification scope

Verify the requested assessment results against their evidence.
Reopen only required assessments whose evidence fails or materially changes.
Record newly discovered unrelated artifacts and optional investigations in the follow-up list.
Report new material risks without automatic scope expansion.
Do not restart discovery after the required assessment results exist.

## Return conditions

If all required assessments and evidence checks finish, return `COMPLETED` immediately.
Assessment results can remain `failed` or `unverified` with explicit evidence and limits.
Those statuses describe artifact trust, not an unfinished repair task.
A completed assessment does not approve an artifact or establish its safety.
Do not require a second successful review.
If a mandatory operation cannot finish within authority or controls, return `BLOCKED` with partial results.
Do not weaken required checks or enlarge access to obtain completion.
Treat a retry or resource limit as a stop guard, not a success criterion.
If that limit expires before completion, return `BLOCKED` without a success claim.
Follow-up items do not block an otherwise completed frozen contract.
Record the final artifact identities, outcome, unresolved trust evidence, and follow-up list.
