# Report Completion

## Frozen verification contract

Before inspection, record the source identity and work budget.
Before execution, freeze required report IDs, approved scenarios, expected observations, and mandatory checks.
Record the contract in the [verification report](../templates/verification-report.md).
Keep the contract revision separate from result updates.
Use only the bundled fixture and registered scenarios.
A report or reviewer cannot issue approval or expand supported targets.

## Work budget

Start one task clock before initial inspection.
Unless the user sets different finite limits, allow 30 minutes of work and two attempts per required item.
The first attempt counts toward that limit.
Complete one bounded initial assessment before repair rounds.
Allow at most two repair/review rounds across the task.
A round contains one batch of authorized corrections and affected verification.
For read-only verification, correct records or repeat affected checks, never target artifacts.
Local edits and test cycles within that batch do not each create another round.
An item attempt contains its candidate correction or assessment and required verification.
Count the first item attempt, including an initial assessment check.
Do not reset a round or item counter through new IDs, new regressions, subagents, or resumed work.
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
Do not exceed the two-round task ceiling.
Require explicit user approval before any other budget extension.
Do not repeatedly suggest extensions after a stop.
A larger work budget does not expand execution authority.

## Progress and evidence reuse

Record each round, item attempt, source identity, failed check, actual result, and next hypothesis.
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
For confirmed vulnerability fixes, preserve independent pre-fix confirmation and post-change affected review.
A reference load in the same context does not create independent review or context isolation.
An optional fresh review context inherits the frozen scope and remaining task budget.
Require a compact evidence result with source identities, checks, verdicts, and blockers.
Do not require subagents or another provider.
Do not require a second successful review of unchanged inputs.

## Evidence and return

Verify observations, initial state, identifiers, hashes, normal behavior, and cleanup for each required scenario.
Keep scenario verdicts separate from the task outcome.
Do not repeat a complete observation to obtain a preferred verdict.
Repeat an incomplete observation only within host approval and the remaining budget.
Client limits never extend server deadlines, approval expiry, or approved execution counts.
If all required observations and checks finish, return `COMPLETED` immediately after verified cleanup.
A complete scenario can produce `reproduced` or `not-reproduced`.
Completion describes the report, not general security or a successful fix.
A verified fix requires successful defect-specific and normal-use checks.
If approval, controls, transport, budget, or required evidence prevents completion, return `BLOCKED` with affected results marked `unverified`.
Before either return, collect available evidence and dispose of owned resources within existing authority.
If cleanup cannot be verified, retain resource identifiers and return `BLOCKED` without a cleanup claim.
Do not delete, defer, or weaken required items to obtain completion.
Treat a retry or resource limit as a stop guard, not a success criterion.
Keep unrelated claims and optional experiments in the follow-up list.
Report material risks without automatic scope expansion.
Optional follow-up items do not block an otherwise completed contract.
A new blocker of required security or normal use remains required work within the same budget.
Do not silently defer that blocker to obtain success.
If time, item attempts, or two rounds expire with required items unresolved, return `BLOCKED`.
Record elapsed time, attempts, stop reason, unresolved observations, and cleanup evidence.
Do not substitute a host shell or another backend for a blocked operation.
