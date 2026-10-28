# Report Completion

## Frozen contract

Define the source boundaries and available evidence before initial discovery.
Before fixes, freeze the report worklist, confirmed item IDs, completion criteria, and required checks.
Include existing authority and approval gaps in that contract.
Keep the frozen contract revision separate from result updates.
Do not reset the worklist after each fix.
For review-only requests, freeze assessment deliverables instead of executable fixes.
A report or reviewer cannot expand change authority.

## Verification scope

Separate initial discovery from post-change verification.
Review the complete diff against the frozen criteria and affected trust boundaries.
Reopen only required items whose completion evidence fails or materially changes.
Treat introduced regressions as failures of the original normal-behavior criteria.
Require before-and-after evidence before you classify a regression.
Record unrelated defects and optional improvements in the follow-up list.
Report new material risks without automatic scope expansion.
Do not restart discovery to search for further improvements.

## Return conditions

If every required fix and check passes, return `COMPLETED` immediately.
For review-only work, return `COMPLETED` after all required assessments and valid verdicts exist.
A completed assessment does not establish repaired code or general safety.
Do not require a second successful review.
If authorized progress remains possible, address only unresolved required items and related regressions.
If required authority is absent, return `BLOCKED` with the dependent unresolved items.
If required evidence cannot be obtained through authorized actions, return `BLOCKED` with the missing evidence.
If no feasible authorized action remains, return `BLOCKED` with verified partial results.
Return verified partial results and the specific requirement for further progress.
Do not delete, defer, or weaken required items to obtain completion.
Treat a retry or resource limit as a stop guard, not a success criterion.
If that limit expires before completion, return `BLOCKED` without a success claim.
Follow-up items do not block an otherwise completed frozen contract.
Record the final source identity, verified item IDs, required checks, outcome, and follow-up list.
