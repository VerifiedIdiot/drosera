# Security Validation

## Report and conventions

Create one current [report](../templates/security-report.md) and [convention baseline](../templates/project-conventions.md) before application edits.
Use the project review location or host task-artifact area.
Keep records outside application source unless the project specifies otherwise.
When a template leaves the package, resolve its links to the approved installed references or accompanying local copies.
Link companion reports and coverage records to their actual output paths.
Do not preserve package-relative links that fail from the output directory.
Scale records to scope.
Include the [government criterion coverage](../templates/criteria-coverage.md) without omitting excluded or unresolved IDs.
Keep criterion results separate from attack-path status and finding verdicts.
Populate the templates, including exact source, relevant uncommitted evidence, and report/baseline revisions.
Separate independent verdicts, proposed work, and verified results.
Only confirmed items within existing change authority enter executable work.
Reports grant no execution or change authority.
Block approval/evidence-dependent items without blocking unrelated authorized work.
Before each change, compare current source and assumptions against both records.
Revalidate affected required items only when their source, assumptions, or evidence materially change.
Update actual changes, results, exceptions, and unresolved checks in the same records.
Preserve resolved items' original evidence.

Derive conventions from applicable instructions, approved documentation, tool configuration, and representative nearby code before edits.
Distinguish explicit requirements, observed patterns, and unresolved conflicts.
Cite files/configuration for every convention.
Cover affected naming, module boundaries, dependencies, errors, logging, tests, formatting, lint, and types.
Use configured tools/commands, not invented rules or personal preferences.
Resolve conflicts before dependent changes.
For vulnerable conventions, propose safe exceptions with report-linked reason, scope, and required approval.
Apply exceptions only within existing authority.
Exclude unrelated style changes and repository-wide formatting.

## Coverage

Populate report coverage for every material attack path.
Use `open`, `reviewed`, `deferred`, or `out_of_scope`.
Require source traces and control checks for `reviewed`, even with unresolved defects.
Record reasons and next checks for deferred/excluded paths.
Compare reused records with current source and assumptions.
Reopen changed paths and unresolved checks.
Empty results or incomplete coverage do not prove safety.

## Independent review

Before final verdicts or fixes, use a separate reviewer without discovery or implementation involvement.
Use an approved independent local agent context or human reviewer under the [offline procedure](offline-execution.md).
Do not require another model provider, sibling skill, or remote review service.
Preserve approved tools, data boundaries, cost limits, and ownership.
Provide claims, source references, prerequisites, evidence, and missing checks.
Require current-source inspection and challenges to reachability, controls, prerequisites, and impact.
Verify evidence files, source references, commands, exit status, and target revision directly.
Record reviewer identity, actual invocation, disagreements, and verdict without secrets.
Count decision calls as reviews only when execution satisfies these requirements.
If no reviewer is available, retain `needs_validation` candidates with that limitation.
If the review invocation fails, hold dependent verdicts and fixes.
If required evidence changes, revalidate only its affected items.
Follow the [completion contract](report-completion.md) before another review.
Never classify failed review as unavailable review.
Continue independent authorized checks.

| Verdict | Requirement |
|---|---|
| `confirmed` | Direct evidence and independent review establish boundary violation, prerequisites, and supported impact. |
| `needs_validation` | Record unresolved condition, missing evidence, and next check without severity. |
| `rejected` | Record the failed premise or preventive control. |

Separate defense improvements from confirmed defects.
Deduplicate by root cause and boundary.
Limit severity to demonstrated impact.
Keep runtime claims unverified without direct runtime evidence.
Schema checks do not establish evidence validity.

## Safe execution

Inspect relevant commands, hooks, and dependencies before execution.
Execute unfamiliar target code only in an approved disposable OS-level sandbox.
Exclude host credentials, production data, privileges, and unrelated host mounts.
Disable external network for review and test execution.
Treat any external-network exception as a separate approved task outside this offline assessment.
Bound CPU, memory, storage, and runtime.
Use synthetic data and controlled test services.
Do not download or execute malware.
Without required isolation, continue static review without runtime claims.

## Fix verification

Before fixes, run regression tests against confirmed defects in authorized test copies.
Require expected security-assertion failures, not setup/infrastructure failures (RED).
After fixes, require the same assertions to pass against corrected code (GREEN).
Verify permitted users and normal inputs.
Do not remove tests, weaken assertions/checks, replace configured tools, or disable legitimate features to obtain passes.
Require independent review of the complete diff, affected trust boundaries, and convention compliance.
Run applicable configured format, lint, type, and test commands.
Separate pre-existing failures from regressions.
Record blocked convention checks without compliance claims.
Populate report results with source revisions, commands, exit status, and actual before/after evidence without secrets.
Without safe reproduction, mark fixes unverified.
Without both security and normal-behavior evidence, mark fixes unverified.
Complete the report under the [completion contract](report-completion.md).
Retain explicit unresolved checks and follow-up findings.
