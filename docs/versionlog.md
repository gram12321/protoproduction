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

## Version 0.0021 - First Game Loop (production + inventory)

**Date:** 2026-05-31 | **Commit(s):** 002369e | **Stats:** 14 files changed, 167 insertions(+), 53 deletions(-)

### Summary

- Replaced static bootstrap UI with first interactive game tick loop.
- Added typed state, recipe, building, and inventory model for minimal production flow.
- Wired page interaction to service-layer tick processing and updated test coverage.

### Changes

- `src/components/pages/GameShellPage.tsx` (+23/-44) - switched from static stack summary to live simulation panel and `Run 1 tick` action.
- **NEW FILE:** `src/lib/constants/gamestate.ts` (18 lines) - seed game loop state.
- **NEW FILE:** `src/lib/constants/recipeConst.ts` (18 lines) - recipe constants and lookup.
- **NEW FILE:** `src/lib/services/core/gameinit.ts` (14 lines) - initial state factory.
- **NEW FILE:** `src/lib/services/core/gametick.ts` (22 lines) - production tick processor.
- **NEW FILE:** `src/lib/services/inventory.ts` (12 lines) - inventory resource accumulator.
- **NEW FILE:** `src/lib/types/buildingTypes.ts`, `src/lib/types/gamestateTypes.ts`, `src/lib/types/inventoryTypes.ts`, `src/lib/types/recipeTypes.ts` - first typed domain loop primitives.
- `tests/App.test.tsx` (+13/-6) - asserts tick increment and grain production behavior.

### Notes

- Scope stays intentionally minimal: one building (`farm`), one recipe (`produce-grain`), one resource (`grain`).
- Service separation kept: page orchestrates; domain logic sits in `src/lib/services/`.

---

## Version 0.002 - React+Vite+Tailwind+ShadCN Baseline

**Date:** 2026-05-31 | **Commit(s):** f25813d | **Stats:** 29 files changed, 3,821 insertions(+), 2 deletions(-)

### Summary

- Introduced runnable frontend stack with Vite, React 19, TypeScript, Tailwind, and ShadCN setup.
- Added initial UI shell, alias wiring, and first shared button primitive.
- Added Vitest + Testing Library baseline with first render test.

### Changes

- `package.json` (+34/-1), `package-lock.json` (+3391/-1) - app scripts and dependency baseline.
- **NEW FILE:** `components.json` (20 lines) - ShadCN registry/config.
- **NEW FILE:** `index.html`, `src/main.tsx`, `src/App.tsx` - Vite entry and React mount.
- **NEW FILE:** `tailwind.config.ts`, `postcss.config.js`, `src/index.css` - Tailwind theme/config pipeline.
- **NEW FILE:** `src/components/ui/button.tsx`, `src/components/ui/index.ts` - first reusable UI primitive.
- **NEW FILE:** `src/components/pages/GameShellPage.tsx`, `src/components/pages/index.ts` - initial bootstrap page.
- **NEW FILE:** `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` - build/test/tooling config.
- **NEW FILE:** `tests/App.test.tsx`, `tests/setup.ts` - testing baseline.
- `.gitignore` (+1/-0) - ignores `*.tsbuildinfo`.

### Notes

- First commit adding runtime source tree under `src/`.
- Readme updated with Vite dev-server launch guidance.

---

## Version 0.001a-d - Documentation, Skill Routing, and Repo Bootstrap Prep

**Date:** 2026-05-31 | **Commit(s):** b1a4c09, b433b34, a7e1734, 00922c7, 6385cf0 | **Stats:** 5 commits grouped (docs/rules sync, skill routing updates, bootstrap prep)

### Summary

- Standardized project-facing agent rule documents across `AGENTS.md`, docs, Cursor, and Copilot mirrors.
- Moved local skills into `.agents/skills/` and aligned routing references to repo-local precedence.
- Added `small-steps` skill and updated router matrix to pair minimal-change requests with `caveman` style.

### Changes

- `AGENTS.md`, `.github/copilot-instructions.md`, `docs/AIdocs/airules.mdc`, `docs/AIdocs/copilot-instructions.md`, `.cursor/rules/ai-agent-rule.mdc/airulesVS.instructions.md` (+/-) - synchronized canonical rules, path fixes, and plugin-vs-skill precedence.
- `docs/versionlog.md` (+47/-47) - rewrote guide for Proto Production and corrected 0.000/0.001 commit references.
- **NEW FILE:** `.cursor/mcp.json.example` (17 lines) - local MCP template without committed secrets.
- **NEW FILE:** `.gitignore` (11 lines at introduction) - excludes `.cursor/mcp.json`, env files, and build outputs.
- `.agents/skills/webgamedev-gram/SKILL.md` (+/-) - precedence rules and routing updates.
- **NEW FILE:** `.agents/skills/toolsskills/small-steps/SKILL.md` (103 lines), `.agents/skills/toolsskills/small-steps/agents/openai.yaml` - minimal-change workflow skill.

### Notes

- Group headline reflects labeled sequence `0.001a` to `0.001d`; grouped body also includes adjacent supporting docs commit `b1a4c09`.
- This grouped slice is mostly docs/routing hygiene; no persisted gameplay data or migrations changed.

---

## Version 0.001 - Starting Docs (initial repository push)

**Date:** 2026-05-31 | **Commit(s):** 04eaaa7 | **Stats:** 16 files changed, 771 insertions(+), 1,997 deletions(-)

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

**Date:** 2026-05-30 | **Commit(s):** fa4ffdd | **Stats:** 199 files changed, 18,798 insertions(+) (`.cursor/mcp.json` removed from history — contained secrets)

> **Not a gameplay or app release.** This commit imported documentation templates, agent skills, and Cursor config from prior projects. Use it only as provenance for file origins — do not treat version `0.000` as shipped product state.

### Summary

- Seeded repo with `readme.md`, full `docs/` tree (including legacy winemaker-oriented content), `skills/`, and `.cursor/` config.
- Established `docs/versionlog.md` guide format (since rewritten for Proto Production).

### Changes

- **NEW FILE:** `readme.md` (94 lines) - project entry point.
- **NEW FILE:** `docs/versionlog.md` (123 lines) - version log guide (winemaker-oriented at import time).
- **NEW FILE:** `docs/CONTEXT.md`, `docs/PROJECT_INFO.md`, `docs/VariableRelationshipMap.md`, `docs/AIdocs/*` - imported templates.
- **NEW FILE:** `skills/` tree - `webgamedev-gram`, superpowers, best-practices bundles.
- **NEW FILE:** `.cursor/rules/`, `.cursor/plans/` (plans since removed in 0.001).
- MCP config is **not** tracked — use **NEW FILE:** `.cursor/mcp.json.example` (added after initial push) locally copied to gitignored `.cursor/mcp.json`.

### Notes

- Superseded for product meaning by **0.001**; retained in git history only.
