# Task procedures

## Security assessment and confirmed fixes

1. Complete the offline preflight and identify the target, exact versions, controls, and tests.
2. For security findings or application changes, read applicable [validation](security-validation.md) sections.
3. Read the government baseline and [version selection](versions.md) before eGov-specific analysis or changes.
4. Preserve explicitly required [external approvals or reviews](decision-gate.md).
5. Confirm source paths and required test assertions before fixes.
6. Map assets, attacker capabilities, entry points, trust boundaries, and conventions.
7. Record every government criterion in the [coverage record](../templates/criteria-coverage.md) with actual applicability and evidence.
8. Trace plausible attacks, weakness chains, and normal-feature abuse through actual code and configuration.
9. For advisories, dependency changes, or release gates, follow [lifecycle](lifecycle-and-cve.md).
10. For security assessments or confirmed fixes, create the report and convention baseline before application edits.
11. Apply only confirmed, report-linked fixes within change authority and conventions.
12. Verify security, normal behavior, and conventions through [project tests](test-verification.md).
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

For security assessments or confirmed fixes, complete the [report](../templates/security-report.md), including affected authorization, tenant, normal-feature, and failure-path tests.
Include the criterion coverage record and explicit evidence gaps.
Require separate deployment approval.
Clean scans, absent advisories, obscure routes, and crawler notices do not establish safety or replace access controls.
