# Report Completion

## Frozen contract

Before inspection, record source boundaries, evidence limits, and the work budget.
Before application edits, freeze explicitly approved deliverables and their security, normal-use, resource, and activation criteria.
Record required checks in the [task report](../templates/task-report.md).
For review-only or design-only work, freeze document deliverables instead of application changes.
Keep the contract revision separate from result updates.
A report or reviewer cannot authorize new traps or production activation.

## Work budget

Start one task clock before initial inspection.
Unless the user sets different finite limits, allow 30 minutes of work and two attempts per required item.
The first attempt counts toward that limit.
A repair attempt contains one candidate patch and its required verification.
An assessment attempt contains one required check against one evidence snapshot.
Distinct mandatory checks are not retries.
Keep one budget across subagents, report updates, and task resumption.
Do not reset counters through new IDs for the same root cause and boundary.
Apply stricter host, approval, scenario, and operation limits.
Before each phase or attempt, verify the remaining time and permitted attempts.
Bound operation timeouts by the remaining work budget when the host supports them.
Reserve time for the report and authorized cleanup.
On expiry, stop new investigation, edits, and tests.
Complete only the report and authorized cleanup after that stop.
If a task token limit exists, enforce it through the host meter when available.
Without a token meter, report token use as unmeasured.
Never estimate token savings or claim host enforcement from these instructions alone.
Record unavailable clock or meter controls as limitations.
If a required budget cannot be verified, return `BLOCKED` before further dependent work.
Require explicit user approval for a larger budget.
A larger work budget does not expand execution authority.

## Progress and evidence reuse

Record each attempt, source identity, failed check, actual result, and next hypothesis.
If the same failure has no new evidence or distinct supported hypothesis, return `BLOCKED`.
If a prior source-and-failure state recurs, return `BLOCKED` for a repair-cycle review.
Do not alternate patches that restore previously failed security or normal-use behavior.
Keep both criteria in the same regression suite.
Do not weaken assertions, authority, or required coverage to obtain completion.
Identify the relevant source, configuration, dependencies, tools, rules, environment, and evidence for each result.
Reuse a result only when those inputs match and its authority and evidence remain valid.
Recheck changed inputs and affected boundaries, not unrelated completed items.
Do not present past observations as current live state.
Verify unchanged file identities instead of repeated full reads.
Give reviewers the complete diff, relevant source, required IDs, actual results, and changed assumptions.
Load only applicable references and relevant evidence sections.
Preserve independent pre-fix confirmation and post-change review.
Do not require a second successful review of unchanged inputs.

## Verification and return

Verify the complete diff against the frozen criteria and affected boundaries.
Treat introduced regressions as failures of the original normal-use criteria.
Require before-and-after evidence for a regression claim.
Keep unrelated defects, additional trap ideas, and optional improvements in the follow-up list.
Report material risks without automatic scope expansion.
Do not restart discovery to select further traps.
If all required deliverables and checks pass, return `COMPLETED` immediately.
Within the budget, continue only unresolved authorized items and related regressions.
If required authority, evidence, time, or a feasible action is absent, return `BLOCKED` with verified partial results.
Do not delete or defer required items to obtain completion.
Treat a retry or resource limit as a stop guard, not a success criterion.
Follow-up items do not block an otherwise completed contract.
Record final identities, verified deliverables, elapsed time, attempts, stop reason, follow-up items, and actual activation state.
Completion does not authorize production activation.
