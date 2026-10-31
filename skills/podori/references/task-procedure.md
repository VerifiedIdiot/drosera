# Task procedures

## Security assessment and confirmed fixes

1. Identify the target, exact versions, controls, and tests.
2. For security findings or application changes, read applicable [validation](security-validation.md) sections.
3. Preserve explicitly required [external approvals or reviews](decision-gate.md).
4. Confirm source paths and required test assertions before fixes.
5. Map assets, attacker capabilities, entry points, trust boundaries, and conventions.
6. Trace plausible attacks, weakness chains, and normal-feature abuse through actual code and configuration.
7. For advisories, dependency changes, or release gates, follow [lifecycle](lifecycle-and-cve.md).
8. Before application edits, prepare the report and convention baseline.
9. Apply only confirmed, report-linked fixes within change authority and conventions.
10. For application changes or required executable checks, verify security, normal behavior, and conventions through [project tests](test-verification.md).
11. Update the same report and affected coverage after material changes.

Consider stolen credentials, insiders, dependency substitution, configuration drift, and resource abuse within scope.
Examples, not an exhaustive checklist:

| Boundary | Controls |
|---|---|
| Identity/data | Server authorization, ownership, tenant isolation, sessions, response fields |
| Input/output | Injection, XSS, CSRF, uploads, validation, encoding |
| External operations | SSRF, destinations, credentials, timeouts, paid API abuse |
| Client/deployment | Secret exposure, secure storage, platform permissions, proxy trust, CORS, headers, routes, configuration |
| Supply chain/operations | Dependency trust, build/release, infrastructure, human approvals |
| Availability | Request limits, bounded work, failures, recovery |

Analysis does not authorize live attacks, credential use, social engineering, or broader access.
Preserve normal users, accessibility, approved automation, and existing controls.
Require compatibility and approval before established-route changes.
Exclude unrelated fixes, services, and dependencies.

## Completion

Complete the [report](../templates/security-report.md) with evidence for the checks required by the task.
For excluded runtime checks, report `unverified` without runtime claims.
Require separate deployment approval.
Clean scans, absent advisories, obscure routes, and crawler notices do not establish safety or replace access controls.
