# Report Completion

## Read-only contract

Before inspection, freeze target identities, required dimensions, evidence boundaries, permitted reads, and the work budget.
Identify packages by version and artifact hash, images by digest and platform, and Git sources by repository and commit.
Trace only source-linked dependency, build, install, and runtime paths within that contract.
Record each relationship and its source evidence.
A shared registry, owner, or repository host does not establish a dependency relationship.
Keep unrelated artifacts and unapproved expansion in the follow-up list.
Account for required unresolved transitive components and child manifests without silent exclusion.
Use the [assessment](../templates/assessment.md) for each required result.
Keep the contract revision separate from result updates.
An adverse verdict never authorizes installation, execution, repair, quarantine, deletion, or deployment.

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

## Return conditions

Verify every required assessment against its evidence.
Do not restart discovery after the required results exist.
If all required assessments and evidence checks finish, return `COMPLETED` immediately.
Artifact verdicts can remain `failed` or `unverified` when the contract permits those assessment outcomes.
Those verdicts do not describe an unfinished repair task or establish artifact safety.
If a mandatory operation cannot finish within authority, controls, or budget, return `BLOCKED` with partial results.
A written evidence gap never substitutes for a mandatory successful verification.
Do not weaken required checks or enlarge access to obtain completion.
Treat a retry or resource limit as a stop guard, not a success criterion.
Report material risks without automatic scope expansion.
Follow-up items do not block an otherwise completed contract.
Record final identities, elapsed time, attempts, stop reason, unresolved trust evidence, and follow-up items.
