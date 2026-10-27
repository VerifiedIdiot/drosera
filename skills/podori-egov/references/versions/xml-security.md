# XML Security Rules

Use these rules for the configurations identified by the 3.x and 4.x profiles.

| ID | Condition and action | Required project tests |
|---|---|---|
| X01 | For cookie-authenticated mutations, trace effective CSRF protection. Enable protection and token transport where absent. | Reject missing/invalid tokens without mutation. Preserve valid forms, AJAX, uploads, login, and logout. |
| X02 | Trace excluded URLs, DB roles, rule order, and the actual matcher type through the active filter chain. | Reject unauthorized direct requests. Preserve allowed routes, queries, and approved path variants. |
| X03 | Trace `hash="plaintext"` and `ESNTL_ID AS PASSWORD` through the authentication service and stored credentials. | Verify real password storage and authentication. Do not infer plaintext storage from these configuration values alone. |
| X04 | Preserve the eGov namespace URI and application classes when runtime artifact/package names change. | Verify local schema resolution, active configuration, and authentication after any approved migration. |

The inspected configurations set `csrf="false"` and `requestMatcherType="regex"`.
Check equivalent existing protections before a finding or fix.
Do not substitute Ant patterns for regex rules or treat an XSD filename as the resolved library version.
An XML assertion alone does not verify a filter chain or a security fix.
