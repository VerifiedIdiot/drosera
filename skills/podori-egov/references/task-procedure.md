# Task procedures

## Security assessment and confirmed fixes

1. Complete the offline preflight and identify the target, exact versions, controls, and tests.
2. For security findings or application changes, read applicable [validation](security-validation.md) sections.
3. Read the government baseline and [version selection](versions.md) before eGov-specific analysis or changes.
4. Preserve explicitly required [external approvals or reviews](decision-gate.md).
5. Confirm source paths and required test assertions before fixes.
6. Map assets, attacker capabilities, entry points, trust boundaries, and conventions.
7. For full assessments, record every government criterion in the [coverage record](../templates/criteria-coverage.md).
   Record actual applicability and evidence.
   For scoped fixes, update affected criteria without another full assessment.
   Preserve valid unaffected coverage and unresolved required criteria.
8. Trace plausible attacks, weakness chains, and normal-feature abuse through actual code and configuration.
9. For advisories, dependency changes, or release gates, follow [lifecycle](lifecycle-and-cve.md).
10. Before application edits, prepare the report and convention baseline.
11. Apply only confirmed, report-linked fixes within change authority and conventions.
12. For application changes or required executable checks, verify security, normal behavior, and conventions through [project tests](test-verification.md).
13. Update the same report and affected coverage after material changes.

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
Include the criterion coverage record and explicit evidence gaps.
Require separate deployment approval.
Clean scans, absent advisories, obscure routes, and crawler notices do not establish safety or replace access controls.
