# Trap Budgets

Set an owner, measurement window, and limits before activation.
If production limits remain unresolved, keep new traps disabled.

| Resource | Limit |
|---|---|
| Requests | Per-subject/global admission, concurrency, queue, and body size |
| Responses | Bytes, links, depth, redirect hops, and egress |
| Compute | CPU, memory, handler time, and connection duration |
| State and telemetry | Cardinality, retention, expiry, logs, alerts, and access |
| Service | Reserved normal capacity and shutdown thresholds |

Enforce aggregate limits across replicas before expensive work or allocation.
Use prepared responses, caches, or cheap generation without per-request LLM or paid API calls.
At budget exhaustion, poor engagement, or service degradation, return a cheap terminal response.
Emergency disable stops deception and automatic trap restrictions, not primary defenses.
Test normal traffic during bounded load, identifier churn, storage failure, exhaustion, disable, and recovery.
Disabled traps must create no synthetic responses or trap-specific state writes.
