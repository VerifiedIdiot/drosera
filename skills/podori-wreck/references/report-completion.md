# Report Completion

## Frozen verification contract

Before execution, freeze the report revision, required item IDs, approved scenarios, expected observations, and mandatory checks.
Keep the frozen contract revision separate from result updates.
Record the contract and results in the [verification report](../templates/verification-report.md).
Use only the bundled fixture and registered scenarios.
A report or review cannot issue approval or expand the supported targets.

## Evidence and follow-up

Verify the actual observations, initial state, identifiers, hashes, normal behavior, and cleanup for each required scenario.
Keep scenario verdicts separate from the task outcome.
Record unrelated claims and optional experiments in the follow-up list.
Report new material risks without automatic scope expansion.
Do not repeat a complete observation merely to obtain a preferred verdict.
If a required observation fails, repeat only that approved scenario when another attempt remains justified and authorized.
Honor the server deadlines and approved client wait limits.
While an authorized action can obtain missing observations within approved limits, continue only that required work.
Attempt limits are not required attempt counts.

## Return conditions

If all required observations and checks are complete, return `COMPLETED` immediately after confirmed resource cleanup.
A complete scenario can produce `reproduced` or `not-reproduced`.
Task completion means that the verification report is complete, not that the target passes every security check.
Claim a verified fix only when defect-specific and normal-behavior checks pass.
Do not require a second successful review.
If approval, controls, transport, or required evidence prevents completion, return `BLOCKED` with the affected results marked `unverified`.
Before either return, collect available evidence and dispose of owned resources within existing authority.
If cleanup cannot be confirmed, retain known resource identifiers and return `BLOCKED` without a cleanup claim.
Do not delete, defer, or weaken required items to obtain completion.
Treat a retry or resource limit as a stop guard, not a success criterion.
If that limit expires before completion, return `BLOCKED` without a success claim.
Follow-up items do not block an otherwise completed frozen contract.
Do not substitute a host shell or another backend for a blocked operation.
