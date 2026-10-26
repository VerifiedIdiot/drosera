# Local Advisories and Lifecycle

1. Reconcile resolved packages, transitive dependencies, base OS, runtime versions, platforms, and available deployed digests.
2. Record the approved advisory snapshot's origin, integrity, publication date, import date, and coverage.
3. Verify audit-tool behavior through local help before use.
4. Disable remote queries, updates, telemetry, and implicit pulls for offline checks.
5. If tools or data are missing, report the gap without automatic installation.
6. Compare affected ranges, feature use, and exposure conditions against the exact asset.
7. Classify each advisory as affected, unaffected, or unknown with evidence.
8. Apply approved remediation and release policies without automatic fix options.

Missing records, stale data, unsupported ecosystems, and failed queries do not establish an unaffected result.
Optional refresh requires approved destinations and disclosed inventory.
Record identifiers, snapshot dates, exposure evidence, and any exception's owner, scope, reason, and expiry.

| Gate | Action |
|---|---|
| Task start | Assess affected boundaries and evidence freshness |
| Dependency or boundary change | Repeat affected checks and regression tests |
| Completion or release | Inspect the diff, exact artifacts, and actual results |
| Advisory import | Verify source, integrity, date, and affected inventory |

Keep advisory queries outside request handlers.
Create continuous checks only with separate approval.
For persistent integration, use [project rules](../templates/project-security-rules.md) in the actual active instruction file.
Verify discovery, full content load, and CI enforcement separately through the installed agent's local documentation.

## Optional Background

These links provide background, not required tools or procedures.
Do not fetch them automatically.

- [OWASP REST security](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html)
