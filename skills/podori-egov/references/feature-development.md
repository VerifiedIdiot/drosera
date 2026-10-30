# Feature development

Keep the requested feature and its affected boundaries separate from a full security audit.
Before edits, record scope, existing conventions, acceptance criteria, required security checks, normal-use tests, and the task budget.
Use a concise task record, not a fabricated vulnerability report.
Implement only authorized behavior.
Preserve the entry document's approval, data, execution, and stop controls.
Use the project's configured format, lint, type, and test commands for the affected code.
Verify expected success, rejection, and failure behavior together.
Keep previously required security and normal-use assertions in the regression suite.
If authentication, authorization, sessions, or secret boundaries change, require independent affected review before completion.
Use an approved reviewer without implementation involvement.
If required review is unavailable or fails, block its dependent completion claim.
Do not require a full-project audit, a new provider, or another installed skill.
If evidence reveals a possible vulnerability, use the package's security assessment procedure for that candidate.
Preserve the same task clock, item attempts, and repair-round counter.
Do not rewrite passing code solely for optional style or design preferences.
If all required checks pass, return COMPLETED after required cleanup.
If a required blocker remains at the task limit, return BLOCKED with the evidence.

For eGovFrame work, select the applicable version profile and affected government criteria before edits.
Record their identifiers without an unsupported whole-baseline compliance claim.
