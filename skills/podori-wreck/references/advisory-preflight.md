# Advisory Preflight

## Entry and authority

Use this preflight when component or release evidence needs a current vulnerability check.
Keep this preparation separate from the frozen review and repair phases.
Network availability alone does not grant network permission.
Use only approved destinations, disclosed inventory, and prepared tools.
Do not install a scanner, MCP server, package, or replacement tool for this preflight.
Without approved access, use approved imported records and state their dates and coverage.
A missing required freshness check blocks its dependent verdict, not unrelated authorized work.

## Bounded collection

1. Record the exact resolved components, versions, OS release, image identity, and affected task boundaries.
2. Define approved sources and a finite request budget before queries.
3. Unless stricter limits apply, use eight requests, ten seconds per request, and sixty seconds total.
4. Include this time and these requests within the existing task budget.
5. Send only approved public component coordinates, versions, platforms, and selected advisory identifiers.
6. Keep private package names, source code, repository paths, credentials, and unrelated inventory local.
7. Prefer structured official APIs or vendor feeds over general web searches.
8. Parse and filter responses with prepared tools before model context receives the result.
9. Preserve source identifiers, publication dates, modification dates, observation times, and exact target matches.
10. Freeze the collected snapshot before review or repairs.

Perform one bounded collection pass per task.
Do not repeat the collection after each edit or reviewer response.
Changed components require a separately identified affected check within the same budget.
No new identifier, context, or source query resets the budget.
If a required response exceeds the budget, record incomplete coverage and block its dependent verdict.
Network failures, empty responses, stale records, and unsupported sources do not establish absence of vulnerabilities.
Do not switch providers, tools, or destinations automatically after a failure.

## Source selection

| Question | Preferred evidence |
|---|---|
| CVE identity, state, and original disclosure | CVE Program record and its responsible CNA |
| Affected distribution packages and available fixes | The distribution or product vendor advisory |
| Cross-product CVE details and published severity | NVD, with the record status and metric source |
| Resolved open-source package and version matches | OSV ecosystem-specific package queries |

No single source proves complete or immediate coverage.
Do not treat missing NVD analysis as absence of a vulnerability.
For distribution backports, use vendor package versions and release-specific status rather than upstream version text alone.
Preserve conflicting source claims and unresolved applicability instead of silent agreement.
A CVE identifier does not prove that the target asset is affected.
Preserve each published CVSS version and source without conversion to another version.
Treat rejected records as rejected, not active findings.

Context7 supplies library documentation, not the vulnerability authority for this procedure.
General web search is optional source discovery, not evidence for an affected verdict by itself.
If an approved search tool is needed, verify the located official record before a verdict.
Do not require Context7, a specific agent, or a new MCP service.

## Compact evidence

Return the exact component, version, advisory identifiers, affected status, fix status, dates, and official source references.
Use affected, unaffected, or unknown with the source evidence.
Retain pagination state, incomplete counts, unsupported ecosystems, and query failures.
Do not hide relevant records merely to shorten model context.
Keep complete responses in the approved local evidence area rather than the conversation.
A prepared parser can collect and filter records without an LLM call.
Model interpretation still consumes tokens.
Do not claim zero-token operation or measured savings without actual measurements.

## Optional source documentation

- CVE record format: https://www.cve.org/AllResources/CveServices
- NVD API: https://nvd.nist.gov/developers/vulnerabilities
- OSV package API: https://google.github.io/osv.dev/post-v1-querybatch/
- Ubuntu security data: https://ubuntu.com/security/cves

These links identify source interfaces, not mandatory network prerequisites.
