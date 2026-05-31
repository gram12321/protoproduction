# Project Information

Status update (2026-05-31): Early implementation is live. The repo now has a minimal React/Vite runtime and a baseline game-loop slice, while broader systems in this document remain planned unless marked otherwise.

Last updated: 2026-05-31
Status: **Bootstrap** — documentation and agent skills only. React/Vite app not installed yet.

Ownership map for **where code will live**. Behavior and shared-system patterns: `docs/AIdocs/AIDescriptions_coregame.md`. Domain terms: `docs/CONTEXT.md`. Variable flow (template): `docs/VariableRelationshipMap.md`.

## Stack (planned)

- React, Vite, TypeScript, Tailwind, ShadCN UI
- Supabase (company-scoped persistence)
- Vitest under `tests/`
- Optional dev server helpers under `server/` (test runner, etc.)

## Repo layout today

| Path | Role |
|---|---|
| `readme.md` | Entry point, quick start, doc map |
| `docs/` | Project docs (`CONTEXT.md`, `PROJECT_INFO.md`, `AIdocs/`, …) |
| `.agents/skills/` | Local agent skills (`webgamedev-gram`, superpowers, best-practices) |
| `src/` | App code (components, constants, services, types) |
| `tests/` | Vitest coverage (currently baseline app loop test) |
| `package.json` | App scripts and dependencies |
| `migrations/` | SQL migrations (when schema exists) |

The `src/` and `tests/` trees now exist with a minimal core loop baseline.

## Currently implemented slice (minimum loop)

| Area | Implemented files |
|---|---|
| Core constants | `src/lib/constants/gamestate.ts`, `src/lib/constants/recipeConst.ts` |
| Core services | `src/lib/services/core/gameinit.ts`, `src/lib/services/core/gametick.ts`, `src/lib/services/inventory.ts` |
| Core types | `src/lib/types/gamestateTypes.ts`, `src/lib/types/inventoryTypes.ts`, `src/lib/types/buildingTypes.ts`, `src/lib/types/recipeTypes.ts` |
| UI shell | `src/components/pages/GameShellPage.tsx` |
| Verification | `tests/App.test.tsx` |

## Planned app layout (`src/`)

Target structure from the shared workflow. Create folders as features land; names are conventions, not requirements on day one.

```
src/
  main.tsx              # React mount
  App.tsx               # Shell + page routing
  index.css             # Tailwind / global styles
  components/
    layout/             # Header, activity panel, notifications
    pages/              # Top-level game pages
    ui/                 # ShadCN wrappers, modals, shared game UI
    UItypes.ts          # Shared page/navigation props
  hooks/                # Game state, loading, reactive updates
  lib/
    services/           # Business logic (by domain subfolder)
      core/             # Game state, tick, starting conditions
      <domain>/         # Production, sales, finance, …
    database/           # Supabase CRUD/mappers only
      core/
    constants/          # Tunable gameplay numbers
    types/              # Shared domain types
    utils/              # Calculators, company helpers, UI helpers
    features/           # Optional feature seams (e.g. loanLender)
```

**Rules (unchanged intent):**

- Logic in `src/lib/services/`, not components
- Persistence in `src/lib/database/`
- Prefer barrels: `@/components/ui`, `@/hooks`, `@/lib/services`, `@/lib/constants`, `@/lib/utils`

## Other planned roots

| Path | Role |
|---|---|
| `tests/` | Vitest — mirror `src/lib/services/` domains |
| `migrations/` | Schema SQL after Supabase setup |
| `.env.local` | Supabase keys (gitignored) |
| `server/` | Dev-only API (e.g. `/api/test-run`) when needed |

## Domain ownership (future)

When gameplay is defined, add rows here — one line per domain: **services → UI → database/constants**.

Example row shape (do not treat as implemented):

| Domain | Services | UI | Persistence / constants |
|---|---|---|---|
| Core tick | `src/lib/services/core/` | `App.tsx`, layout | `database/core/`, `constants/time*` |

Until then, see the checklist in `AIDescriptions_coregame.md` § “Domain Systems — To Document When Implemented”.

## Documentation map

| Need | File |
|---|---|
| Setup and overview | `readme.md` |
| Domain glossary | `docs/CONTEXT.md` |
| Stack and shared systems | `docs/AIdocs/AIDescriptions_coregame.md` |
| Variable relationships | `docs/VariableRelationshipMap.md` |
| New session handoff | `docs/AIdocs/AIpromt_newpromt.md` |
| Agent rules | `docs/AIdocs/airules.mdc` |
| Version history | `docs/versionlog.md` |

Historical design under `docs/superpowers/` is from prior work — not current runtime unless code confirms it.
