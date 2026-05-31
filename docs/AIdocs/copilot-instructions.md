# AI Agent Instructions

Turn-based resource production simulation. Stack: **React, TypeScript, Vite, Tailwind, ShadCN UI, Supabase**.

Layering: **Services** (`src/lib/services/`) → **Database** (`src/lib/database/`) → **UI** (`src/components/`).  
Full orientation: `readme.md`, `docs/AIdocs/AIDescriptions_coregame.md`, `docs/PROJECT_INFO.md`.

## Session start

Read `readme.md` and `docs/AIdocs/AIpromt_newpromt.md` before non-trivial work.

Optional acknowledgment (when using Copilot-style flows):

```text
[AI Agent Instructions] — read copilot-instructions.md and readme.md.
```

## AI check message

Start user-facing work with:

```text
AI check: <1-5> - <brief reason>
```

## Game tick order (when `gameTick.ts` exists)

When adding systems to the weekly tick, keep ordering explicit and document new steps in `AIDescriptions_coregame.md`. Typical pattern from prior stack:

1. Advance time (week / season / year)
2. Prestige decay (if ledger-based)
3. Achievement checks (if scheduled on tick)
4. economy) and production impacts
5. 
8. Seasonal or yearly finance hooks
9. Notifications and global UI refresh triggers

Adjust order to match actual dependencies — do not hide cross-system side effects inside unrelated services.

## Type and module conventions

- Shared types: `src/lib/types/types.ts`, `src/components/UItypes.ts`
- Prefer barrel imports from `@/lib/services`, `@/lib/constants`, `@/lib/database`, `@/components/ui`, `@/hooks`
- Tunable gameplay values in `src/lib/constants/`, not magic numbers in UI
- Company-scoped persistence for all gameplay tables

## State and updates

- `useGameState()` / `useGameStateWithData()` for loaded company state
- `useGameUpdates()` for topic-scoped or global refresh after service mutations
- Services trigger updates after writes; components do not recalculate domain state locally

## Critical hooks (patterns)

| Concern | Pattern |
|---|---|
| Work / activities | `calculateTotalWork()`, domain activity managers |
| Loading UX | `useLoadingState()` |
| Prestige | Ledger writes through prestige service; derive display totals |
| Finance | Transaction categories; reports from `financeService` |
| Research | Gates from `unlocks` / `permanentEffects`, not flavor text alone |

## Developer workflows

**Adding a domain service:**

1. Add types in `src/lib/types/` if shape is shared
2. Add constants in `src/lib/constants/<domain>/`
3. Implement logic in `src/lib/services/<domain>/`
4. Add DB module in `src/lib/database/` if persisted
5. Wire page/modal in `src/components/pages/` or `src/components/ui/`
6. Update `docs/CONTEXT.md` and `docs/VariableRelationshipMap.md` when variables are introduced

**Adding a page:**

- Orchestration only; call services for data and mutations
- Reuse layout, hooks, and shadcn primitives from `src/components/ui/`

**Schema change:**

1. Dev Supabase first
2. SQL under `migrations/`
3. Update DB mapper and types

## Testing

- `npm test` — Vitest under `tests/`
- Admin automated runner: dev-only `/api/test-run`
- Gameflow Lab: active-company fixtures, `testlab_...` cleanup ids

## Common pitfalls

- Do not call Supabase from components
- Do not invent prestige or score values in UI without service derivation
- Do not add legacy field aliases unless user explicitly requests compatibility
- Do not assume anything excist in  `src/lib/services/ `  — check PROJECT_INFO.md` and code

## Key files (template)

| File | Purpose |
|---|---|
| `src/App.tsx` | Routing and shell |
| `src/lib/services/core/gameTick.ts` | Weekly simulation tick |
| `src/lib/services/core/` | Game state, starting conditions |
| `src/lib/database/core/` | Company, game state, transactions |
| `src/lib/services/prestige/` | Prestige ledger |
| `src/lib/services/finance/` | Economy and finance |
| `src/components/layout/Header.tsx` | Main chrome |
| `docs/CONTEXT.md` | Domain glossary |
| `docs/VariableRelationshipMap.md` | Variable dependency template |
