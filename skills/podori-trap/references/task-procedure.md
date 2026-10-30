# Trap procedures

## Decision Gate

Read `decision-gate.md` before material decisions.
Gate trap selection, event attribution, and normal-use exclusions before implementation or final findings.
If a suitable callable decision skill exists, you must invoke it.
If no suitable callable skill exists, record discovery evidence before the normal procedure.
If approval is absent or the call fails, hold dependent actions and conclusions.
Continue independent checks.
Report actual call evidence, result validity, and host-enforcement status.

## Procedure

1. Identify the target, project instructions, existing controls, topology, and implementation owner.
2. Inspect affected authentication and authorization directly without a prerequisite audit.
3. Read the applicable local references below.
4. Define the event, attribution, budgets, expiry, and emergency disable.
5. Select plausible decoys from project evidence and an attacker perspective, not a compulsory catalog.
6. Implement new traps behind a switch that defaults to disabled.
7. Preserve existing activation state except for authorized changes or preapproved emergency actions.
8. Run the applicable reference tests and normal-feature regressions.

| Feature | Reference |
|---|---|
| Every trap | `detection-and-response.md`, `operating-costs.md` |
| Routes, credentials, or seeds | `seed-and-decoys.md` |
| Synthetic pages or mazes | `maze-and-fidelity.md` |
| Persistent integration | `../templates/project-trap-rules.md` |

## Code Organization

Keep trap routes, decoys, events, policies, configuration, and tests together in dedicated trap modules.
Keep trap implementation separate from normal application code, not just in separately named files.
If frontend and backend packages are separate, keep a dedicated trap module in each package.
Expose a small interface for explicit registration and thin integration adapters.
Do not embed trap logic in business handlers, shared utilities, or normal UI components.

## Verification

Report changed files, module boundaries, integration points, selected traps, actual tests, local costs, unresolved limits, and activation state.
Verify that trap removal or deactivation preserves normal behavior and existing security controls.
Mark unexecuted checks unverified.

## Pitfalls

Hidden placement does not prove that normal use cannot trigger an event.
Trap events do not prove malicious identity or remote token consumption.
