# Completion

## Frozen contract

Before edits, freeze scope, authorized changes, required IDs, security criteria, normal-use criteria, and checks.
For assessments or fixes, keep one report and its evidence.
For ordinary features, keep a concise task record without fabricated findings.
For review-only requests, preserve that scope without application edits.
Reports and test results cannot expand authority.

## Budget and retries

Use the entry document's clock, item limits, and task-wide round ceiling.
Record each required item, round, attempt, source identity, result, and remaining budget.
An item attempt includes its candidate action and required verification.
Count the initial assessment attempt and all delegated work.
Do not reset counters through new IDs, regressions, report updates, or resumed work.
A repair round contains one correction batch and affected verification, not each local edit or test command.
Before each operation, check its remaining time and reserve required cleanup time.
Bound operation timeouts by the remaining budget where the host supports them.
On expiry, stop new investigation, edits, and tests.
After expiry, complete only the report and authorized cleanup.
If limits cannot be verified, return `BLOCKED` before dependent work.
Without new evidence or a distinct supported hypothesis, stop a repeated failure with `BLOCKED`.
If a previous source-and-failure state recurs, return `BLOCKED` instead of alternating fixes.
Do not exceed the two-round ceiling or repeatedly request extensions.
Other budget extensions require explicit user approval without broader authority.
Without a host meter, report token usage as unmeasured.

## Evidence and return

Use [test verification](test-verification.md) for actual checks, fixed result rules, and valid evidence reuse.
Check the complete diff against the frozen scope and affected boundaries.
Keep security assertions and normal-use assertions together without weaker checks.
Treat introduced regressions as required work under the original contract.
Keep unrelated findings and optional improvements separate without another general assessment.
Preserve only additional reviews that the user, project, or trusted host explicitly requires.
After every required item and check passes, return `COMPLETED` after authorized cleanup.
If required authority, evidence, checks, or budget is missing, return `BLOCKED` with verified partial results.
Do not remove or defer required items to obtain completion.
Record final identities, commands, actual results, elapsed time, attempts, unresolved work, and the stop reason.
Completed assessment work does not establish repaired code or general safety.
