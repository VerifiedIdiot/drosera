# Report Completion

## Frozen contract

Before application edits, freeze the explicitly approved trap deliverables, source boundaries, completion criteria, and required checks.
Record that contract in the [task report](../templates/task-report.md).
Keep the frozen contract revision separate from result updates.
Include normal-use exclusions, resource controls, and required activation state in the criteria.
For review-only or design-only requests, freeze document deliverables instead of application changes.
A report or reviewer cannot authorize new traps or production activation.

## Verification scope

Verify the complete diff against the frozen criteria and affected boundaries.
Reopen only required deliverables whose completion evidence fails or materially changes.
Treat introduced regressions as failures of the original normal-behavior criteria.
Require before-and-after evidence before you classify a regression.
Record unrelated defects, additional trap ideas, and optional improvements in the follow-up list.
Report new material risks without automatic scope expansion.
Do not restart discovery to select further traps.

## Return conditions

If all required deliverables and checks pass, return `COMPLETED` immediately.
Do not require a second successful review.
If authorized progress remains possible, address only unresolved required items and related regressions.
If required authority is absent, return `BLOCKED` with the dependent unresolved items.
If required evidence cannot be obtained through authorized actions, return `BLOCKED` with the missing evidence.
If no feasible authorized action remains, return `BLOCKED` with verified partial results.
Do not delete, defer, or weaken required items to obtain completion.
Treat a retry or resource limit as a stop guard, not a success criterion.
If that limit expires before completion, return `BLOCKED` without a success claim.
Follow-up items do not block an otherwise completed frozen contract.
Record the final source identity, outcome, verified deliverables, follow-up list, and actual activation state.
Completion does not authorize production activation.
