![podori: inspect vulnerabilities, question dependencies, and set traps](podori.png?rev=6b3a03a5d6ee)

# podori

**Security reviews, fixes, and tests with the AI agent you already use.**

[한국어 안내](README.md) | English · `1.0.0`

podori is a set of security skills for AI coding agents. It provides criteria and procedures for reviews, repairs, and checks after a change.

For a review-only request, the agent examines the source and evidence. For a repair request, the instructions cover both security and normal behavior. You can start with a skill invocation instead of a long security prompt.

[Start here](#start-here) · [Choose a skill](#choose-a-skill) · [Verification](#verification)

## Start here

Copy the complete `skills/podori/` folder into your agent's skill directory. Include `references/` and `templates/` with `SKILL.md`. Follow your agent's installation guide for the directory location.

For an agent that supports slash commands, invoke the skill in the target project:

```text
/podori
```

The agent reads code, configuration, and existing tests to determine the scope. Repairs and tests stay within authorized boundaries. It asks when the target or required approval is unclear.

For a review without file changes, add this request:

```text
이번에는 보안 문제만 점검하고 파일은 수정하지 마세요.
```

This means: "Review security only. Do not modify files."

## What can you ask podori to do?

### Find problems and check the evidence

A hidden admin button does not lock the API behind it. The review traces authentication and authorization along actual request paths. It also covers input validation, file uploads, and secrets. Source-supported problems stay separate from items that need more environment evidence.

### Repair the problem and preserve normal behavior

An authorization fix must reject unauthorized requests and preserve valid user requests. The instructions cover project conventions and actual project tests for both security and normal behavior. Unrelated improvements stay outside the repair scope.

### Explain completed work and remaining gaps

Reports summarize findings, repair and verification results, and next steps. A review-only request ends after source review and the report. For repairs, the report also explains the test results.

## Choose a skill

Each skill works independently. Install only the skills that you need. One skill does not invoke the others.

| Task | Skill | Example |
|---|---|---|
| Application security reviews, vulnerability fixes, and regression tests | [podori · Security](skills/podori/SKILL.md) | `/podori` |
| eGovFrame secure coding and government security criteria | [podori-egov · eGovFrame security](skills/podori-egov/SKILL.md) | `/podori-egov` |
| Package and container image provenance and supply-chain checks | [podori-doubt · Doubt](skills/podori-doubt/SKILL.md) | `/podori-doubt` |
| Decoys, traps, and evidence of unauthorized exploration | [podori-trap · Traps](skills/podori-trap/SKILL.md) | `/podori-trap` |
| Sandbox comparison of the bundled synthetic app before and after fixes | [podori-wreck · Sandbox verification](skills/podori-wreck/SKILL.md) | `/podori-wreck` |

The first four skills work without MCP. `podori-wreck` requires a separate local MCP server and execution approval from the host operator.

<details>
<summary>Scope of each specialist skill</summary>

- **eGovFrame security:** The skill distinguishes the runtime, common components, and actual dependencies for 3.x, 4.x, and 5.x. It includes 20 design criteria and 49 implementation criteria from MOIS Notice 2025-1, Appendix 3. Use the [criterion record](skills/podori-egov/templates/criteria-coverage.md), [guide](skills/podori-egov/README.en.md), and [baseline sources](skills/podori-egov/references/government-baseline.md).
- **Dependencies:** Read-only checks cover install scripts, startup commands, image layers, signatures, and build records. Approved queries also trace artifact use. The skill does not install or execute suspect artifacts for inspection.
- **Decoys and traps:** Decoy keys, fake APIs, and document mazes stay separate from real data and privileges. The server verifies access events. Ordinary page views do not count as attacks. New traps start disabled. Production activation requires separate approval.
- **Sandbox verification:** Identical requests compare responses, state, and normal behavior between vulnerable and fixed variants of the bundled synthetic app. Arbitrary repositories, images, shell commands, production targets, and external targets are excluded. Destructive and resource-exhaustion tests are also excluded. The MCP verifies native Linux ARM64 or AMD64 and the selected Docker runtime. It can use gVisor (`runsc`). Follow the [MCP guide](mcp/README.en.md) for preparation, approval, isolation, and cleanup. gVisor does not replace host security updates.

</details>

## Verification

Internal evaluations used source excerpts from a large enterprise business system and a synthetic Next.js sample. Model source reviews, package checks, and synthetic app execution tests remain separate evidence categories.

## Why I built podori

My team recently patched vulnerabilities in Node.js, Python, Java, and nginx across dozens of repositories. I share the checklists and repair procedures from that work so other developers can use them.

## Scope and safety

- **Stay within the request.** Ordinary feature work does not start a full security audit. Valid evidence remains reusable. Changed parts and affected boundaries need another check.
- **Bound retries.** Defaults are 30 minutes, two attempts per required item, and two repair/review rounds across the task. The first attempt counts. User-specified finite budgets or stricter host limits take precedence. Delegation and report edits do not reset the budget. Repeated failures without new evidence or exhausted limits stop new work. The report explains remaining items.
- **Respect execution authority.** Missing approval or isolation stops the dependent execution. Independent authorized checks continue. Production changes require separate approval.
- **Use prepared evidence on isolated networks.** Prepare the agent, model, tools, and dependencies before the task. Tasks do not install or replace them automatically. Advisory collection and updates require separate approval. Missing or stale evidence remains unverified.

`podori`, `podori-egov`, and `podori-doubt` use CVSS v4.0. Unsupported scores remain unrated. Severity does not grant execution approval. Skills provide agent instructions. Hard time and token limits or context isolation require host controls.

## Update an installation

For an update, select release tag `v1.0.0`. Back up the current installation. Replace the complete selected skill folder. Verify the `SKILL.md` version and the package files.

The 1.x contract preserves the five skill names, independent use, and the meaning of approval, isolation, and completion criteria. Report prose, detection results, and internal reference paths are not stable interfaces. The optional MCP follows its [tool, input, and approval contract](mcp/README.en.md#1x-compatibility-contract). Incompatible contract changes require a new major version.

Apply security controls in the target project, then verify them in its execution environment.

[Changelog](CHANGELOG.md) · [MIT](LICENSE) · VerifiedIdiot
