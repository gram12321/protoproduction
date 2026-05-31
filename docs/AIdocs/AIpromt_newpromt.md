# AI Prompt: Starting A New Development Session

Use this as a short context handoff when opening a new AI coding session for this repo.

## Project Summary

Turn-based single-player **resource production simulation** (working title: Proto Production). Stack: React, Vite, TypeScript, Tailwind, ShadCN UI, Supabase.

The player manages production, processing, sales, staff, finance, prestige, and progression. Core simulation logic belongs in services; React components stay presentation-focused.

Domain mechanics are **not fully specified yet** — read `docs/CONTEXT.md` before inventing game terms.

## First Files To Read

1. `readme.md` — entry point and documentation map.
2. `docs/CONTEXT.md` — domain language (placeholder until design lands).
3. `docs/AIdocs/AIDescriptions_coregame.md` — stack, shared systems, UI/infra patterns.
4. `docs/PROJECT_INFO.md` — file structure and module locations.
5. `docs/VariableRelationshipMap.md` — how variables should relate once defined.

For architecture or large features, also check `docs/superpowers/specs/` and `docs/superpowers/plans/` — treat as non-authoritative unless code or `AIDescriptions_coregame.md` confirms.

Repo router skill (if using local skills): `.agents/skills/webgamedev-gram/SKILL.md`.

## Current System Snapshot (bootstrap)

- **Core architecture:** React/Vite/TypeScript, Supabase persistence, company-scoped data, week-based game tick pattern, global update hooks.
- **Shared UI:** layout, activity panel, notifications, page routing, finance/sales sub-surfaces, reference/wiki pattern, admin test tools (dev-only).
- **Cross-cutting:** transactions and reports, loans via feature seam, optional founder/ownership slice, research catalog pattern, prestige event ledger pattern, achievements/highscores on persisted history.
- **Domain gameplay:** TBD — do not assume prior winery modules (`vineyard/`, `wine/`, grape markets) exist until `PROJECT_INFO.md` and code show them.

Keep detailed status in `AIDescriptions_coregame.md` and path ownership in `PROJECT_INFO.md`; do not expand this prompt into a second README.

## Key File Locations (workflow)

| Area | Path |
|---|---|
| Core types | `src/lib/types/types.ts` |
| UI types | `src/components/UItypes.ts` |
| Core services | `src/lib/services/core/` |
| Domain services | `src/lib/services/<domain>/` |
| Sales services | `src/lib/services/sales/` |
| Finance / user | `src/lib/services/finance/`, `src/lib/services/user/` |
| Activity services | `src/lib/services/activity/` |
| Database layer | `src/lib/database/` |
| Game constants | `src/lib/constants/` |
| Pages | `src/components/pages/` |
| Shared UI | `src/components/ui/` |
| Hooks | `src/hooks/` |
| Tests | `tests/` |
| Migrations | `migrations/` |

## Development Rules

- Business logic in `src/lib/services/`.
- Supabase reads/writes in `src/lib/database/`.
- React components: UI state, display, interaction only.
- Prefer barrel exports: `@/components/ui`, `@/hooks`, `@/lib/services`, `@/lib/utils`, `@/lib/constants`.
- Shared types: `src/lib/types/`, `src/components/UItypes.ts`.
- Terminology from `docs/CONTEXT.md` once defined; no legacy data-shape support unless explicitly requested.
- Git: user commits by default; use MCP GitHub tools instead of terminal `git log` / `git show` when history is needed.

## Useful Commands

```bash
npm test
npm run build
git diff --check
```

Do not run `npm run dev` unless asked (user may already have a dev server).
