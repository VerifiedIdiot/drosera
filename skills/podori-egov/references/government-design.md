# Government design criteria

Read the [baseline contract](government-baseline.md) before these criteria.
`D-category-item` identifies the corresponding design row in Appendix 3.
These identifiers belong to this skill, not the issuing authority.
Guide pages refer to printed pages in the pinned KISA guide, not PDF viewer positions.
The guide section is `3.3.category.item`.

Apply each check where its condition exists within the approved scope.
For absent or uncertain conditions, record the evidence or gap in the [coverage record](../templates/criteria-coverage.md).
Record actual verification evidence, not these expected results.

## 1. Input validation and representation

| ID | Criterion / guide page | Applies to | Required local check | Verification target |
|---|---|---|---|---|
| D-1-01 | DBMS queries and results / 45 | Database queries | Define parameterized queries, permitted identifiers, result types, and invalid-result handling. | Verify hostile values remain data. Verify valid queries and malformed-result rejection. |
| D-1-02 | XML queries and results / 50 | XML, XPath, or XQuery | Define permitted query structure, typed values, result constraints, and rejection paths. | Verify input cannot change query meaning. Verify expected and malformed XML results. |
| D-1-03 | Directory queries and results / 53 | LDAP or directory services | Define filter construction, distinguished-name constraints, result validation, and failure behavior. | Verify rejected query manipulation and accepted legitimate directory results. |
| D-1-04 | System resources and commands / 55 | Files, resources, or process execution | Define authorized resources, fixed operations, argument constraints, and invalid-input rejection. | Verify unauthorized paths and operations fail before side effects. Verify permitted operations. |
| D-1-05 | Web requests and responses / 60 | Web input or rendered output | Define input schemas, output-context encoding, permitted markup, and invalid-result behavior. | Verify hostile content stays inert. Verify legitimate content and workflows. |
| D-1-06 | Sensitive web operations / 65 | Account, payment, or other sensitive state changes | Define request authenticity, server authorization, and approval boundaries before state changes. | Verify forged requests fail without mutation. Verify authorized requests. |
| D-1-07 | HTTP protocol validation / 69 | Headers, redirects, or HTTP response construction | Define accepted headers, response values, redirect destinations, and malformed-message rejection. | Verify header injection and unapproved redirects fail. Verify valid responses. |
| D-1-08 | Memory access boundaries / 73 | Native code, JNI, or explicit buffer operations | Define buffer limits, size arithmetic, index checks, and failure behavior. | Verify boundary violations fail without memory access. Verify valid boundary values. |
| D-1-09 | Security-function inputs / 76 | Authentication, authorization, or security-related functions | Define trusted identities, input contracts, dependency-result validation, and denial defaults. | Verify forged identities and malformed results cannot grant access. Verify authorized operations. |
| D-1-10 | File uploads and downloads / 80 | File transfer or retrieval | Define file integrity, type, size, storage, execution permissions, ownership, and rejection behavior. | Verify unauthorized or disallowed files fail. Verify permitted transfers and content integrity. |

## 2. Security functions

| ID | Criterion / guide page | Applies to | Required local check | Verification target |
|---|---|---|---|---|
| D-2-01 | Authentication targets and methods / 86 | Protected resources or operations | Define authentication requirements for every sensitive entry point, including alternate routes. | Verify unauthenticated and bypass attempts fail. Verify valid authentication. |
| D-2-02 | Authentication attempt limits / 91 | Authentication or account-recovery endpoints | Define bounded attempt controls and failure records without unauthorized user lockout. | Verify configured limits, recovery, and legitimate-user access with bounded synthetic attempts. |
| D-2-03 | Password management / 94 | Password authentication | Define password creation, storage, change, reset, and applicable lifecycle requirements. | Verify approved password policy and recovery controls. Verify secrets do not enter output or logs. |
| D-2-04 | Important-resource access control / 101 | Sensitive data, configuration, or actions | Define resource owners, tenants, privileges, trusted enforcement points, and denial behavior. | Verify cross-user, cross-tenant, and lower-role denial. Verify permitted access. |
| D-2-05 | Cryptographic key management / 108 | Cryptographic keys | Define key generation, distribution, access, rotation, revocation, and destruction. | Verify unauthorized access fails and retired keys follow policy. Verify authorized lifecycle operations. |
| D-2-06 | Cryptographic operations / 113 | Encryption, signatures, or password derivation | Define approved algorithms, modules, key sizes, salts, and random-value requirements. | Verify selected parameters against approved local policy. Verify valid and invalid cryptographic operations. |
| D-2-07 | Sensitive-data storage / 119 | Persistent sensitive data | Define protected data, storage controls, encryption requirements, and retention boundaries. | Verify unauthorized reads fail and required data protection exists. Verify permitted retrieval. |
| D-2-08 | Sensitive-data transmission / 123 | Sensitive data in transit | Define protected channels, endpoint authentication, certificate validation, and permitted destinations. | Verify failed trust checks stop transmission. Verify authorized transfers with controlled endpoints. |

## 3. Error handling

| ID | Criterion / guide page | Applies to | Required local check | Verification target |
|---|---|---|---|---|
| D-3-01 | Exception handling / 126 | Failure paths | Define safe errors, rollback, resource cleanup, and bounded recovery without secret disclosure. | Verify dependency failures preserve authorization and state consistency. Verify normal recovery. |

## 4. Session control

| ID | Criterion / guide page | Applies to | Required local check | Verification target |
|---|---|---|---|---|
| D-4-01 | Session control / 131 | Stateful authentication or sessions | Define session isolation, token secrecy, ID rotation, expiration, and logout. | Verify cross-session isolation and rejection of old or expired IDs. Verify legitimate sessions. |
