# Version Log Guide For AI Agents

This file tracks meaningful project changes for **Proto Production** (`protoproduction`).

## Goal

Write clear, factual release notes that explain what changed, where, and why it matters.

## Core Principles

- **ALWAYS use MCP GitHub tools** (`mcp_github_get_commit`, `mcp_github_list_commits`) — do not rely on terminal git commands for log evidence.
- **ALWAYS retrieve actual commit data** before writing.
- **Never infer mechanics from commit message text alone**.
- **Verify behavior claims against actual changed files**.

## Scope Rules

- Log meaningful changes only: features, balancing/mechanics changes, architecture changes, major bug fixes, test infrastructure changes, and substantial docs restructures.
- Skip trivial noise unless bundled inside a meaningful commit.
- Group related commits into one entry when they are one logical change set.

## Evidence Rules

- Use commit-level evidence with `mcp_github_get_commit` and `include_diff: true`.
- For grouped entries, review each commit included in the group.
- Do not claim player-visible impact unless it is visible in the reviewed diffs.
- Always list exact commit hash(es), date range, and stats for grouped entries.

## Entry Format (Required)

Use this structure for every new entry:

```md
## Version <tag> - <short title>
**Date:** YYYY-MM-DD or YYYY-MM-DD to YYYY-MM-DD | **Commit(s):** <hash or comma-separated hashes> | **Stats:** <summary>

### Summary
- 1-3 bullets describing intent and outcome.

### Changes
- `path/to/file.ts` (+A/-D) - what changed and why it matters.
- `path/to/file.tsx` (+A/-D) - mechanic or architecture impact.
- **NEW FILE:** `path/to/newFile.ts` (<line count> lines) - purpose.
- **REMOVED:** `path/to/oldFile.ts` - why removed/replaced.

### Notes
- Migration, compatibility impact, balancing notes, follow-up tasks, or known limitations.
```

## Writing Rules

- Keep entries concrete and technical.
- Prefer file paths over vague statements.
- Use `NEW FILE` and `REMOVED` markers exactly.
- Explain meaningful mechanic/behavior impact, not just file creation.
- Keep entry length proportional to change size.
- Practical heuristic: commits with <250 added lines usually need <10 versionlog lines unless behavior impact is broad.

## Ordering

- Newest entry goes at the top, below this guide.
- Keep entries in reverse chronological order.

## Repository Info

- **Owner:** gram12321
- **Repository:** protoproduction
- **Full URL:** https://github.com/gram12321/protoproduction.git

---

## Version 0.001 - Starting Docs (initial repository push)

**Date:** 2026-05-31 | **Commit(s):** 278cecf | **Stats:** 16 files changed, 771 insertions(+), 1,997 deletions(-)

### Summary

- Replaced winemaker-specific documentation with Proto Production bootstrap docs and generic variable-map template.
- Removed legacy `.cursor` replatform plans from the tree.
- Aligned agent skills (`webgamedev-gram`, architecture, js-ts) with `docs/CONTEXT.md` paths.

### Changes

- `docs/CONTEXT.md` (+/-) - placeholder glossary; removed winery variable tables.
- `docs/VariableRelationshipMap.md` (+/-) - generic relationship template (placeholders, invariants, diagrams).
- `docs/PROJECT_INFO.md` (+/-) - bootstrap repo map; planned `src/` layout, no app code yet.
- `docs/AIdocs/AIDescriptions_coregame.md` (+/-) - stack/shared-systems orientation, not winery runtime.
- `docs/AIdocs/AIpromt_newpromt.md`, `AIpromt_docs.md`, `AIpromt_codecleaning.md`, `airules.mdc`, `copilot-instructions.md` (+/-) - session/cleanup prompts for this repo.
- `skills/webgamedev-gram/SKILL.md` (+/-) - router skill paths and doc maintenance.
- `skills/best-practices/js-ts-best-practices/SKILL.md`, `skills/superpowers/improve-codebase-architecture/SKILL.md` (+/-) - `docs/CONTEXT.md` references.
- **REMOVED:** `.cursor/plans/Replatform Plan v2 Simulus-Style App With Non-Negotiable Edge Tick Continuity.md` - legacy tradergame replatform plan.
- **REMOVED:** `.cursor/plans/simulus-style replatform plan for tradergame04.md` - legacy UI migration plan.

### Notes

- First meaningful project commit for Proto Production; suitable as the public **initial push** to `gram12321/protoproduction`.
- No `src/`, `package.json`, or gameplay code in repo yet — documentation and skills only.

---

## Version 0.000 - Template Docs (not a release)

**Date:** 2026-05-30 | **Commit(s):** 1561bb5 | **Stats:** 199 files changed, 18,798 insertions(+)

> **Not a gameplay or app release.** This commit imported documentation templates, agent skills, and Cursor config from prior projects. Use it only as provenance for file origins — do not treat version `0.000` as shipped product state.

### Summary

- Seeded repo with `readme.md`, full `docs/` tree (including legacy winemaker-oriented content), `skills/`, and `.cursor/` config.
- Established `docs/versionlog.md` guide format (since rewritten for Proto Production).

### Changes

- **NEW FILE:** `readme.md` (94 lines) - project entry point.
- **NEW FILE:** `docs/versionlog.md` (123 lines) - version log guide (winemaker-oriented at import time).
- **NEW FILE:** `docs/CONTEXT.md`, `docs/PROJECT_INFO.md`, `docs/VariableRelationshipMap.md`, `docs/AIdocs/*` - imported templates.
- **NEW FILE:** `skills/` tree - `webgamedev-gram`, superpowers, best-practices bundles.
- **NEW FILE:** `.cursor/mcp.json`, `.cursor/rules/`, `.cursor/plans/` (since removed or superseded).

### Notes

- Superseded for product meaning by **0.001**; retained in git history only.
