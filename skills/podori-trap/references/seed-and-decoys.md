# Routes and Decoy Assets

## Routes

Select unused candidates from local routes, callers, logs, and available advisories.
For real-route conversion, require migration approval, compatibility tests, and rollback.
Preserve standard endpoints, health checks, bookmarks, and integrations.
Match explicit hosts, paths, and methods after verified normalization.
Do not expose relocated real routes or proxy decoys to real management handlers.

## Seeds and Derivation

Apply this section only when selected assets need private derivation or reproducible generation.

1. Create a 32-byte seed with the runtime's verified OS-backed cryptographic random API.
2. Store it atomically with an explicit version per application and environment.
3. Separate test fixtures and real authentication keys from production seeds.
4. Preserve approved versions across restarts and replicas.
5. On entropy, retrieval, or version failure, stop unsafe issuance without an authentication bypass.

Never expose seeds in source control, client assets, build output, or logs.
Prefer independent cryptographic values and a bounded registry when deterministic derivation is unnecessary.
Otherwise, use verified HKDF with persisted salt policy and canonical application, environment, purpose, asset, issuance, and version context.
Keep attacker input outside key selection and use at least 16 output bytes for secret-like identifiers.
Specify encoding and verify collisions without custom cryptography or an invented API.
A separately seeded PRNG can reproduce non-security prose and layout, never secret-like identifiers.
Predictable document links are permitted, but public artifacts must not reveal private seeds or undisclosed credential-like identifiers.

## Registration and Tests

Register credential-like decoys with placement, environment, versions, creation time, and expiry.
Verify membership and appropriate constant-time comparisons before recognized-use claims.
Separate issued, served, submitted, and recognized-use events.
Keep decoys invalid at every real authentication verifier without provider credentials or external callbacks.
Bound issuance and graph validation, with independent challenge nonces, expiry, and replay limits.
On rotation, stop retired issuance. Preserve historical evidence.
Compromised-version matches are weak provenance, not stronger identity evidence.
Test seed failures, persistence, replicas, derivation fixtures, collisions, quotas, rotation, replay, and invalid/expired/copied/foreign decoys.

## Optional Background

These links provide background, not required tools or procedures.
Do not fetch them automatically.

- [HKDF: RFC 5869](https://www.rfc-editor.org/rfc/rfc5869.html)
