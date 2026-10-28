# Common Rules

Apply these selected rules when their boundary exists.
Trace other plausible attacks through the base review procedure.
A framework label, login check, or hidden menu does not prove authorization.

| ID | Inspect and correct | Verify |
|---|---|---|
| C01 | Authorize each server action against the authenticated principal, resource, and tenant before access. | Deny anonymous, other-user, other-tenant, and lower-role access without side effects. Preserve allowed access. |
| C02 | Bind SQL values. Allowlist dynamic identifiers. Trace mapper substitutions and concatenation to actual query use. | Keep hostile input as data. Preserve valid filters and results. |
| C03 | Encode output for its destination context. Sanitize permitted HTML with the existing approved policy. | Render hostile text inert. Preserve permitted content. |
| C04 | Protect automatically authenticated browser state changes against CSRF. Verify the effective filter chain and request-authenticity controls. | Reject forged requests without mutation. Where token protection applies, reject absent or invalid tokens. Preserve valid requests. |
| C05 | Validate file type and size. Use server-selected names and non-executable storage outside the webroot. | Reject disallowed files. Preserve authorized upload and retrieval. |
| C06 | Resolve resource identifiers within an authorized storage boundary. Check traversal, links, ownership, and archive expansion limits. | Reject escape and cross-owner access. Preserve valid files. |
| C07 | Restrict outbound schemes and destinations. Recheck redirects and resolved addresses against the authorized network policy. | Reject unauthorized destinations without network contact. Preserve approved destinations. |
| C08 | Disable external XML resources. Reject untrusted native object deserialization unless constrained by an independently verified policy. | Reject external resolution and unauthorized types. Preserve supported data. |
| C09 | Exclude secrets from clients, code, and logs. Check password storage, transport verification, session rotation, and logout. | Verify failed authentication, expired sessions, and protected-data boundaries. |
| C10 | Bound work and resource use. Make shared-state authorization atomic. Fail closed without sensitive error details. | Verify limits, concurrent state changes, denied actions, and recovery. |

Use synthetic data and local tests within the execution controls.
For each finding, record the rule ID, applicability evidence, actual path, existing defenses, and expected allowed and denied results.
Missing controls alone do not prove a reachable defect.
These selected rules do not replace the complete [government criterion inventory](government-baseline.md).
Neither set establishes certification, legal compliance, or current vulnerability status.

## Sources

Links identify provenance, not required inputs.
The rules above contain the selected checks and expected results.

- [KISA Software Development Security Guide](https://www.kisa.or.kr/2060204/form?page=1&postSeq=5), revision 2021.11, attachment dated 2021.12.29.
  Chapter 4: SQL 136, paths 146, XSS 152, uploads 162, XML 170, CSRF 188, SSRF 191.
  Authentication 212, authorization 215, concurrency 279, resource bounds 285, errors 287, deserialization 311.
- [OWASP Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html): default denial and permission checks on every request.
- [OWASP File Upload](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html): file validation, controlled storage, and retrieval authorization.
- [OWASP SSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html): destination policies, redirects, and address checks.
