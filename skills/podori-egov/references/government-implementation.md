# Government implementation criteria

Read the [baseline contract](government-baseline.md) before these criteria.
`I-category-item` identifies the corresponding implementation row in Appendix 3.
These identifiers belong to this skill, not the issuing authority.
Guide pages refer to printed pages in the pinned KISA guide, not PDF viewer positions.
The guide section is `4.category.item`.

Apply each check where its condition exists within the approved scope.
For absent or uncertain conditions, record the evidence or gap in the [coverage record](../templates/criteria-coverage.md).
Record actual verification evidence, not these expected results.
Use synthetic inputs and approved local services for executable checks.
Do not contact real external destinations or execute arbitrary payloads to demonstrate a weakness.

## 1. Input validation and representation

| ID | Criterion / guide page | Applies to | Required local check | Verification target |
|---|---|---|---|---|
| I-1-01 | SQL injection / 136 | SQL queries and mappers | Bind values as parameters. Allowlist dynamic identifiers and trace substituted fragments to query execution. | Verify hostile values remain data. Verify permitted filters, identifiers, and results. |
| I-1-02 | Code injection / 143 | Evaluators, templates, or executable expressions | Trace untrusted input to executable interpretation. Reject executable input outside the approved language contract. | Verify rejected input never reaches the evaluator. Verify permitted expressions with inert fixtures. |
| I-1-03 | Path manipulation and resource injection / 146 | Files, archives, or resource identifiers | Resolve identifiers within authorized resources. Check traversal, links, ownership, and archive expansion. | Verify escapes and foreign resources fail without side effects. Verify permitted resources. |
| I-1-04 | Cross-site scripting / 152 | HTML, script, attribute, or URL output | Encode output for its exact context. Apply the approved sanitizer to permitted markup. | Verify hostile text stays inert in each output context. Verify permitted content. |
| I-1-05 | OS command injection / 157 | Process execution | Use fixed executables and argument boundaries. Reject untrusted shell syntax and unauthorized operations. | Verify rejected input cannot alter the executable or operation. Verify authorized arguments. |
| I-1-06 | Dangerous file upload / 162 | Uploaded files | Verify file content, type, size, storage, execution permissions, and retrieval authorization. | Verify disallowed files cannot execute or escape storage. Verify authorized upload and retrieval. |
| I-1-07 | Untrusted URL redirects / 166 | Redirects or automatic navigation | Permit only approved destinations after canonicalization. Validate relative paths and scheme-relative URLs. | Verify unauthorized destinations fail. Verify legitimate redirects and return paths. |
| I-1-08 | Improper XML external entities / 170 | XML parsers or transformations | Disable untrusted external resources. Verify approved local schema resolution without remote fallback. | Verify hostile declarations fail without external access. Verify supported local XML. |
| I-1-09 | XML injection / 174 | XPath or XQuery construction | Separate query structure from untrusted values. Constrain dynamic expressions to approved forms. | Verify input cannot change query meaning. Verify expected XML results. |
| I-1-10 | LDAP injection / 183 | Directory filters or distinguished names | Use context-specific LDAP value encoding. Keep filter structure and permitted attributes under server control. | Verify filter manipulation fails. Verify valid filters and distinguished names. |
| I-1-11 | Cross-site request forgery / 188 | Browser state changes with automatically supplied credentials | Trace effective request-authenticity controls through the active filter chain and each mutation route. | Verify forged requests fail without mutation. Verify valid forms, AJAX, and uploads. |
| I-1-12 | Server-side request forgery / 191 | Server requests with influenced destinations | Restrict schemes and destinations. Recheck resolved addresses and redirects against the approved network policy. | Verify denied destinations cause no request. Verify approved local endpoints and redirect limits. |
| I-1-13 | HTTP response splitting / 193 | Response headers or cookies | Use structured header APIs. Reject CR, LF, and malformed values before response construction. | Verify invalid values cannot create additional headers or responses. Verify valid values. |
| I-1-14 | Integer overflow / 196 | Numeric sizes, indexes, counts, or arithmetic | Validate ranges before arithmetic and conversion. Detect overflow before allocation, authorization, or resource use. | Verify boundary arithmetic cannot wrap into an accepted value. Verify valid boundary values. |
| I-1-15 | Untrusted security-decision inputs / 200 | Identity, role, owner, tenant, or authorization inputs | Derive security decisions from trusted server state. Validate dependency results before any privileged action. | Verify forged claims and malformed results cannot grant access. Verify authorized actions. |
| I-1-16 | Memory buffer overflow / 205 | Native code, JNI, or explicit buffer operations | Trace bounds and length calculations before every buffer read or write. | Verify out-of-range access fails. Verify valid boundary access in an approved sandbox. |
| I-1-17 | Format string injection / 208 | Format APIs with influenced templates | Keep format templates under trusted control. Pass untrusted values only as data arguments. | Verify format tokens remain data. Verify normal formatting without disclosure or memory access. |

## 2. Security functions

| ID | Criterion / guide page | Applies to | Required local check | Verification target |
|---|---|---|---|---|
| I-2-01 | Sensitive functions without authentication / 212 | Protected operations or information | Require effective server authentication before every sensitive action, including alternate routes. | Verify anonymous and bypass requests fail. Verify authenticated permitted access. |
| I-2-02 | Improper authorization / 215 | Protected objects or actions | Authorize the principal against the resource, operation, role, and tenant before access. | Verify other-user, other-tenant, and lower-role denial. Verify allowed access. |
| I-2-03 | Incorrect permissions on important resources / 219 | Files, directories, databases, or service accounts | Verify effective resource permissions and least privilege against the approved access policy. | Verify unauthorized reads and writes fail. Verify required service access. |
| I-2-04 | Weak cryptographic algorithms / 223 | Cryptographic operations | Compare actual algorithms, modes, and uses with approved local cryptographic policy. | Verify prohibited choices fail policy checks. Verify permitted operations and compatibility. |
| I-2-05 | Unencrypted sensitive information / 227 | Sensitive storage or transport | Trace sensitive values through storage, transport, logs, and caches. Enforce required protection at each boundary. | Verify prohibited plaintext exposure is absent within scope. Verify authorized retrieval and transport. |
| I-2-06 | Hardcoded sensitive information / 237 | Source, configuration, or packaged secrets | Identify embedded credentials and keys. Use the approved secret mechanism without a public fallback. | Verify unavailable secrets fail safely. Verify redaction and authorized secret access. |
| I-2-07 | Insufficient cryptographic key length / 245 | Cryptographic keys | Compare actual key sizes and algorithm parameters with approved local policy. | Verify undersized keys fail policy checks. Verify permitted keys and migration compatibility. |
| I-2-08 | Inappropriate random values / 248 | Security tokens, nonces, salts, or keys | Use an approved cryptographic random source with adequate entropy for the stated purpose. | Verify unsafe generators cannot supply security values. Verify required uniqueness and format properties. |
| I-2-09 | Weak passwords / 252 | Password creation, change, or reset | Enforce the approved password policy on every write path, including recovery and administration. | Verify weak choices fail and permitted choices work. Verify existing-user compatibility. |
| I-2-10 | Improper digital-signature verification / 255 | Signed artifacts, libraries, or code | Verify signatures against approved trust material before use. Reject invalid, absent, or unauthorized signatures where required. | Verify tampered and untrusted artifacts fail. Verify approved signed artifacts. |
| I-2-11 | Improper certificate validation / 257 | TLS or certificate-based trust | Verify certificate chain, endpoint identity, validity, and required revocation policy without trust bypass. | Verify invalid trust and endpoint mismatch fail. Verify approved local endpoints and trust material. |
| I-2-12 | Sensitive information in persistent cookies / 260 | Client-side cookies with security data | Keep secrets out of durable client storage. Constrain approved persistent tokens by scope, expiry, protection, and revocation. | Verify sensitive values are absent. Verify token expiry, revocation, and legitimate sessions. |
| I-2-13 | Sensitive information in comments / 263 | Source, templates, or distributed comments | Remove real secrets and sensitive deployment details from comments that enter the deliverable. | Verify delivered comments contain no scoped secrets. Preserve useful nonsensitive documentation. |
| I-2-14 | Unsalted one-way hashes / 266 | Password or secret-derived authentication hashes | Use the approved password-derivation scheme with per-record salts and configured work parameters. | Verify identical passwords produce distinct stored values. Verify valid and invalid authentication. |
| I-2-15 | Code downloads without integrity checks / 270 | Code, libraries, plugins, or artifact imports | Verify trusted origin and approved integrity evidence before use, including offline artifact imports. | Verify modified or unapproved artifacts fail. Verify approved artifacts without automatic downloads. |
| I-2-16 | Missing authentication attempt limits / 275 | Authentication or recovery attempts | Enforce configured attempt limits and failure records without unauthorized user lockout. | Verify bounded synthetic failures trigger controls. Verify recovery and legitimate access. |

## 3. Time and state

| ID | Criterion / guide page | Applies to | Required local check | Verification target |
|---|---|---|---|---|
| I-3-01 | Time-of-check/time-of-use races / 279 | Shared resources or concurrent state changes | Bind authorization and resource identity to the actual operation. Use appropriate atomicity or synchronization. | Verify concurrent changes cannot substitute resources or bypass policy. Verify valid concurrent operations. |
| I-3-02 | Nonterminating loops or recursion / 285 | Input-dependent iteration or recursion | Require progress, termination, and bounded resource use. Propagate cancellation and dependency timeouts. | Verify bounded edge cases terminate or stop safely. Verify normal results without exhaustion tests. |

## 4. Error handling

| ID | Criterion / guide page | Applies to | Required local check | Verification target |
|---|---|---|---|---|
| I-4-01 | Error-message information exposure / 287 | Errors, logs, or debug output | Return safe errors without secrets, internal paths, or stack disclosure to unauthorized readers. | Verify failure responses and logs respect their access boundaries. Verify useful nonsensitive diagnostics. |
| I-4-02 | Missing error response / 290 | Failed dependencies or operations | Handle failures explicitly with bounded recovery, cleanup, and safe state transitions. | Verify controlled failures cannot bypass checks or leave unauthorized partial effects. Verify recovery. |
| I-4-03 | Improper exception handling / 293 | Exception handlers or error propagation | Handle expected failures at the correct boundary. Preserve denial, rollback, and cleanup without false success. | Verify relevant exception paths preserve controls and consistent state. Verify normal execution. |

## 5. Code errors

| ID | Criterion / guide page | Applies to | Required local check | Verification target |
|---|---|---|---|---|
| I-5-01 | Null-pointer dereference / 296 | Nullable inputs, lookups, or dependency results | Validate nullable values before use. Preserve authorization failures when a required value is absent. | Verify absent values fail safely. Verify valid values and required defaults. |
| I-5-02 | Improper resource release / 301 | Files, connections, locks, or other bounded resources | Release resources on success, failure, cancellation, and timeout through the established ownership model. | Verify repeated bounded operations return resources. Verify normal completion and failure cleanup. |
| I-5-03 | Use after release / 306 | Explicit resource lifetimes or native memory | Prevent access after release. Keep ownership, aliases, and concurrent operations consistent with the resource lifetime. | Verify released handles cannot be reused. Verify valid resource use before release. |
| I-5-04 | Uninitialized variables / 309 | Variables or state with conditional initialization | Initialize values before use on every reachable path. Reject missing security state instead of permissive defaults. | Verify alternate paths cannot use stale or undefined values. Verify expected initialized state. |
| I-5-05 | Untrusted-data deserialization / 311 | Object restoration from untrusted data | Avoid untrusted native deserialization. Enforce approved type, size, depth, and object-graph constraints where restoration remains necessary. | Verify disallowed types and malformed data fail without side effects. Verify permitted data. |

## 6. Encapsulation

| ID | Criterion / guide page | Applies to | Required local check | Verification target |
|---|---|---|---|---|
| I-6-01 | Data exposure through incorrect sessions / 316 | Sessions, shared beans, or identity-keyed caches | Bind user data to the correct session and tenant. Prevent shared mutable state from crossing identities. | Verify concurrent users cannot read or overwrite each other's data. Verify legitimate session access. |
| I-6-02 | Residual debug code / 321 | Debug routes, flags, logs, or build variants | Exclude unauthorized debug interfaces and sensitive debug output from the deployed configuration. | Verify production-mode debug access fails. Verify required operations and approved diagnostics. |
| I-6-03 | Private arrays returned by public methods / 324 | Public accessors for mutable internal arrays | Return defensive copies or approved immutable views without mutable element aliases. | Verify caller mutation cannot change private state. Verify valid read behavior. |
| I-6-04 | Public data assigned to private arrays / 328 | Mutable caller data stored internally | Copy untrusted mutable data at the ownership boundary. Preserve necessary isolation for nested mutable elements. | Verify later caller mutation cannot change private state. Verify intended internal updates. |

## 7. API misuse

| ID | Criterion / guide page | Applies to | Required local check | Verification target |
|---|---|---|---|---|
| I-7-01 | Security decisions based on DNS lookup / 332 | DNS-derived trust or destination decisions | Do not use DNS names as authentication. Bind destination controls to verified endpoints and permitted addresses. | Verify spoofed names and changed addresses cannot grant trust. Verify authorized endpoint access. |
| I-7-02 | Vulnerable API use / 336 | APIs with unsafe contracts or approved vulnerability evidence | Trace actual API behavior and local advisory evidence. Use compatible approved alternatives when the unsafe condition exists. | Verify the specific unsafe behavior is absent. Verify required normal behavior without remote advisory queries. |
