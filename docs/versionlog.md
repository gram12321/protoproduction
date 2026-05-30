# Version Log Guide For AI Agents

This file tracks meaningful project changes for **winemaker04**.

## Goal
Write clear, factual release notes that explain what changed, where, and why it matters.

## Core Principles
- **ALWAYS use MCP GitHub tools** (`mcp_github_get_commit`, `mcp_github_list_commits`) - do not rely on terminal git commands for log evidence.
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
- **Repository:** winemaker04
- **Full URL:** https://github.com/gram12321/winemaker04.git

---
## Version 0.281a - Documentation Sync For Research/Founder Updates
**Date:** 2026-05-25 | **Commit(s):** 4621f07 | **Stats:** 10 insertions(+), 6 deletions(-)

### Summary
- Synced top-level project docs after the research presentation and founder revenue changes landed.
- Kept terminology and status summaries aligned across the main onboarding docs.

### Changes
- `CONTEXT.md` (+2/-2) - small context/status alignment update.
- `docs/AIdocs/AIDescriptions_coregame.md` (+3/-1) - refreshed implemented-status wording.
- `docs/PROJECT_INFO.md` (+2/-2) - updated project info to match the current research/founder surfaces.
- `readme.md` (+3/-1) - aligned README summaries with the latest systems state.

### Notes
- Despite the label, `0.281a` is the newest commit in this sequence and comes after `0.29` in actual chronology.

---

## Version 0.28, 0.29, 0.281 - Research Presentation Completion and Founder Revenue Integration
**Date:** 2026-05-25 | **Commit(s):** 12647fd, 203306a, eb262df | **Stats:** 4,350 insertions(+), 2,559 deletions(-)

### Summary
- Reworked research presentation into a larger service-driven UI split with dedicated presentation constants, view shaping, and tab-level orchestration.
- Added founder revenue support through staff/state/migration changes plus a dedicated finance panel.
- Finished the research UI pass with a large cleanup/rewrite that reduced spec drift between design docs and shipped screen structure.

### Changes
- **NEW FILE:** `src/lib/services/research/researchPresentationService.ts` (514 lines, later expanded) - centralizes research panel/view presentation shaping instead of leaving display logic scattered across UI components.
- **NEW FILE:** `src/lib/constants/researchPresentationConstants.ts` (25 lines) - shared presentation labels/config for the new research UI layout.
- `src/components/finance/ResearchPanel.tsx` (+1628/-771 in `12647fd`, +353/-367 in `203306a`, +1087/-1421 in `eb262df`) - major UI refactor that reorganizes research display, then trims/finalizes the structure in the follow-up finish commit.
- `src/components/pages/Research.tsx` (+154/-1, then +110/-55) - page-level orchestration updates for the revised research UI flow and view separation.
- `src/lib/constants/researchConstants.ts` and `src/lib/services/activity/workcalculators/researchWorkCalculator.ts` - rebalance research definitions and calculation behavior around the new presentation and progression pass.
- **NEW FILE:** `src/components/finance/FounderPanel.tsx` (115 lines) and **NEW FILE:** `migrations/20260525000000_add_is_founder_to_staff.sql` (9 lines) - founder revenue surface and persistence support.
- `src/lib/services/finance/wageService.ts`, `src/lib/services/user/staffService.ts`, `src/lib/database/core/staffDB.ts`, `src/lib/constants/staffConstants.ts`, and `src/lib/constants/startingConditions.ts` - founder-related staffing and startup behavior updates.
- **NEW FILE:** `tests/research/researchPresentationService.test.ts` (70 lines, then expanded), **NEW FILE:** `tests/activity/staffResearchSpeed.test.ts` (56 lines), and updates to `tests/user/researchPanelVisibility.test.ts` / `tests/user/researchCalculations.test.ts` - regression coverage for the reworked research presentation and staffing interactions.
- **NEW FILE:** `docs/superpowers/specs/reserachui.md` (343 lines, later heavily revised) and updates to `docs/superpowers/specs/2026-05-21-research-mechanic-design.md` - design docs brought closer to the shipped research UI.

### Notes
- These commits are now pushed on `main` and were verified against GitHub commit diffs.
- The dominant change is UI/service restructuring around research presentation, with founder revenue added as a parallel finance/staff feature.
- Version tags are not strictly monotonic here: `0.29` is followed by `0.281` in commit chronology, so ordering in this log follows actual commit order rather than numeric sorting.

---

---
## Version 0.06 - Storyline Documentation Expansion
**Date:** 2025-11-08 | **Commit(s):** 77eaf92f | **Stats:** 2,191 insertions(+), 9 deletions(-)

### Summary
- Added a large narrative documentation pack defining story background and family arcs.
- Included reference screenshots and minor UI adjustments supporting documentation visibility.

### Changes
- **NEW FILE:** `docs/Story/STORY-BACKGROUND.md` (235 lines), **NEW FILE:** `docs/Story/The_De_Luca_Family_Italy.md` (368 lines), **NEW FILE:** `docs/Story/The_Latosha_Family_France.md` (546 lines), **NEW FILE:** `docs/Story/The_Mondavi_Family_US.md` (289 lines), **NEW FILE:** `docs/Story/The_Torres_Family_Spain.md` (293 lines), **NEW FILE:** `docs/Story/The_Weissburg_Family_Germany.md` (426 lines) - storyline corpus.
- Added screenshots under `docs/screenshots/` including `Companyview.png`, `Loginpage.png`, `staff.png`, `vineyards.png`, and `winebalance.png`.
- `src/components/ui/shadCN/sidebar.tsx` (+33/-8) and `src/components/ui/shadCN/tooltip.tsx` (+1/-1) - UI tweaks to support updated docs/navigation context.

### Notes
- Documentation-centric milestone with minimal gameplay code impact.

For older versions see `docs/versionlog_legacy.md`.
