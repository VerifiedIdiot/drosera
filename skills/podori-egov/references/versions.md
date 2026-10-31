# Version Selection

1. Record each module's resolved runtime, common-component, Spring, Spring Security, Servlet, JDK, and container versions separately.
2. Record authentication mode, configuration source, overrides, active filters, and available local evidence.
3. Retain affected government criterion IDs in the task record.
4. For shared controls, read applicable [common rules](common.md).
5. For version-specific behavior, read the matching profile below.
6. Match a rule's conditions against actual source and configuration, not the major label alone.
7. Record rule IDs and version evidence in the applicable task record or security report.

| Runtime major | Profile | Source baseline |
|---|---|---|
| 3.x | [3.x](versions/3.x/rules.md) | Runtime 3.10.0 and common components 3.10.0 |
| 4.x | [4.x](versions/4.x/rules.md) | Runtime 4.0.0 and common components 4.0.0 |
| 5.x | [5.x](versions/5.x/rules.md) | Runtime 5.0.2 and common components 5.0.7 |

These source baselines are not recommended versions or whole-major support claims.
For other versions or mixed modules, prove each rule's applicability from local evidence.
Mark unresolved version-specific conclusions unverified without blocking supported common checks.
Do not exclude government criteria merely because an eGovFrame profile lacks a matching rule.
Do not infer LTS, current vulnerabilities, patch completion, or deployment state from these profiles.

Each profile contains local code cases.
Treat case checks as examples, not proof of the target application's behavior.
Use only existing approved tools and dependencies for optional case tests.
Do not install dependencies or fetch source links to complete this procedure.
