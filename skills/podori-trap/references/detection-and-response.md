# Events and Response

## Event Contract

Define an exact registered route, method, or server-verifiable decoy action.
Check collisions, normalization, proxies, static files, and historical callers.
On collisions or uncertain ownership, keep new candidates disabled.
For existing traps, require operator approval or a preapproved emergency policy before disable.
Page delivery, DOM inspection, element presence, and client flags alone are not trap events.
For hidden elements, test pointer input, keyboard focus, screen readers, autofill, prefetch, previews, and legitimate integrations.
Reject candidates that normal workflows trigger.

## Immediate Registration

A confirmed trap event immediately registers attributable subjects as observations, not automatic restrictions.

| Subject | Evidence |
|---|---|
| IP | Direct peer or verified trusted proxy chain |
| Session | Server-validated session associated with the request |
| Real token | Verified non-secret identifier or keyed fingerprint |
| Decoy | Artifact evidence, never its original recipient's identity |

1. Verify the event and subject without arbitrary submitted identities.
2. Deduplicate evidence and enforce state limits before allocation.
3. Create `observed` records with subject, scope, reason, evidence, policy version, creation time, and absolute expiry.
4. For existing records, append evidence without changes to state, creation time, or expiry.
5. Under approved evidence policy, transition to `restricted` with bounded scope, duration, renewals, and manual release.
6. Enforce only unexpired restrictions and retain released or expired history within the audit policy.

Never store raw tokens, cookies, passwords, or seeds.
One GET, HEAD, forced link, or prefetch must not trigger an automatic IP-wide or session penalty.
Before any session or account penalty, require independently attributable evidence that forced cross-site requests cannot produce.
A valid cookie or session does not establish request intent.
Require corroboration before restrictions against unrelated users, including shared IP users.
Do not count fields from one request as independent evidence or renew restrictions from replayed or already-rejected requests.
Scanner exceptions require verified identity, scope, and expiry without an authorization bypass.
On storage failure, report the failure and preserve primary controls.

## Tests

Test immediate registration, forged identities, copied/expired/foreign decoys, state preservation, release, expiry, and victim protection.
Test authorized scanners, extensions, direct inspection, forced links, trusted-proxy sanitization, alternate chains, direct-origin access, and IPv4/IPv6 normalization.
Test forced cross-site POSTs and navigations with valid victim sessions without a session penalty.
Test hidden-event exclusions, route collisions, cache isolation, replicas, restart, and storage failure.
Verify output encoding, bounded private evidence, and absence of command or path interpolation.
