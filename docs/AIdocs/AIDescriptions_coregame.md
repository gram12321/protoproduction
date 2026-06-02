# Core Game Mechanics — Implementation Orientation

Last updated: 2026-05-31
Status: Bootstrap — domain gameplay systems are not defined in this repo yet. This file describes **stack, architecture, and shared infrastructure** to preserve from the prior project workflow.

Use this to see what patterns exist, where shared code should live, and what is **not** authoritative until `docs/CONTEXT.md` and code confirm it.

Update note: the current implemented minimum loop status is tracked in this file as of 2026-05-31.

Design docs under `docs/superpowers/plans/` and `docs/superpowers/specs/` are history from prior work unless this file, `docs/CONTEXT.md`, `readme.md`, or the code says otherwise.

## Status Update (2026-05-31)

This update supersedes the earlier bootstrap note:

- The minimum runtime loop is implemented and test-covered.
- Existing planning sections below remain intentional and should be treated as future or deferred scope unless code confirms implementation.

## Current Architecture

- React, Vite, TypeScript, Tailwind, ShadCN UI, and Supabase single-player management game (resource production simulation — details TBD).
- Simulation advances manually through `processGameTick()` in `src/lib/services/core/gametick.ts`.
- Gameplay rules live in `src/lib/services/`; Supabase access lives in `src/lib/database/`; React components handle display, UI state, and interaction.
- **Company-scoped play** is the core persistence model. Database calls follow active-company / current-company flow, not global assumptions.
- Feature seams under `src/lib/features/` (e.g. `loanLender`, `researchUpgrade`) isolate optional subsystems.
- Domain vocabulary belongs in `docs/CONTEXT.md`. Do not assume winery-specific terms (`structureIndex`, `wineScore`, etc.) until defined there.

## Currently Implemented Baseline

- `GameLoopState` includes `tick`, `money`, `inventory`, and `buildings`.
- `src/lib/constants/gamestate.ts` defines `STARTING_BALANCE_EUR = 1000` and initial state.
- `src/lib/constants/recipeConst.ts` defines one recipe: `produce-grain` (1 tick -> 1 grain).
- `src/lib/constants/popConst.ts` defines per-resource base consumption values for city demand previews.
- `src/lib/services/core/gameinit.ts` creates fresh initial state copies.
- `src/lib/services/core/gametick.ts` runs building recipes and increments tick.
- `src/lib/services/inventory.ts` mutates resource totals via `addResource`.
- `src/lib/services/marketplace/marketplaceDemand.ts` derives base city demand from population and base consumption.
- `src/components/pages/GameShellPage.tsx` exposes a manual `Run 1 tick` action, simulation state readout, and a city marketplace preview panel.
- `tests/App.test.tsx` verifies tick progression, grain accumulation, and unchanged starting money.

## Database And Persistence

Supabase is the persistent store. Database modules are CRUD/mapper layers and should not contain business rules.

**Intended layout** (paths may not all exist yet):

| Area | Path | Role |
|---|---|---|
| Core | `src/lib/database/core/` | Companies, users, game state, staff, teams, transactions, notifications, achievements, highscores, settings, log, research unlocks, loans/lenders, metric history, share scaffolding |
| Activities / inventory | `src/lib/database/activities/` | Active activities, batch/inventory records, facility persistence |
| Customers / prestige | `src/lib/database/customers/` | Customers, sales orders, relationship boosts, prestige event ledger |
| Sales / markets | `src/lib/database/sales/` | Contracts, forward contracts, commodity markets, loyalty |
| Shared mapping | `src/lib/database/dbMapperUtils.ts` | Row ↔ domain mapping helpers, if needed |
| Migrations | `migrations/` | SQL for schema updates |

**Persistence rules** (carry forward):

- If prestige uses an event ledger (`prestige_events`), current prestige is **derived** from persisted events and decay — not invented in UI.
- Compact identity blobs (hidden product/batch identity) should document accepted keys in `CONTEXT.md`; unknown keys ignored at parse time unless explicitly requested otherwise.
- Services that mutate persisted state should trigger global or topic-scoped UI refresh via existing update hooks.
- Public-company / share-market tables may exist as scaffolding; treat as inactive until runtime is wired.

## Player Interface And UI

Primary router: `src/App.tsx` — pages and overlays after company selection.

**UI patterns to preserve** (rename pages when domain exists):

| Category | Typical locations | Notes |
|---|---|---|
| Layout | `src/components/layout/` | Header, activity panel, notification center, global search |
| Pages | `src/components/pages/` | Overview, production, sales, finance, research, staff, reference/wiki, achievements, highscores, profile, settings |
| Sales sub-UI | `src/components/pages/sales/` | Orders, contracts, inventory/cellar tabs, assignment modals |
| Finance sub-UI | `src/components/finance/` | Statements, cash flow, wages, loan/lender surfaces, founder/ownership panel, research panel |
| Reference / wiki | `src/components/pages/<reference>/` | Static or semi-static game reference (economy, weather, scoring explainers) |
| Activity modals | `src/components/ui/activities/` | Search/results, hiring, processing steps, market buy/sell |
| Domain modals | `src/components/ui/` | Product/batch, facility, staff, prestige, quality breakdowns, constraints |

**UI rule:** pages orchestrate actions and presentation; calculations, validation, persistence, and progression belong in services and database modules.

## Utility And Shared Infrastructure

### Hooks

| Hook / pattern | Purpose |
|---|---|
| `useGameState()`, `useGameStateWithData()` | Reactive game state and async data loading |
| `useGameUpdates()` | Global and topic-scoped update subscriptions, debounced refresh |
| `useLoadingState()` | Shared loading UX |
| Table sorting, relationship/prestige update hooks | Reuse when present for the domain |

### Utilities

| Path | Purpose |
|---|---|
| `src/lib/utils/calculator.ts` | Shared game formulas |
| `src/lib/utils/companyUtils.ts` | Current-company helpers for DB/service flows |
| `src/lib/utils/colorMapping.ts`, `icons.tsx`, `toast.ts`, `modalState.ts`, `consistencyUtils.ts` | UI and presentation support |
| `src/lib/constants/` | Tunable gameplay definitions (time, economy, finance, staff, research, achievements, starting conditions, domain-specific constants as added) |
| Barrel exports | `src/lib/services/index.ts`, `src/lib/constants/index.ts`, `src/lib/database/index.ts`, `src/lib/utils/index.ts`, `src/components/ui/index.ts`, `src/hooks/index.ts` |

### Testing and dev support

- Vitest under `tests/` — mirror service domains (`tests/core/`, `tests/finance/`, `tests/sales/`, etc.).
- Dev-only `/api/test-run` and `server/test-runner.ts` for automated suite from Admin UI.
- Admin Test Lab: active-company fixtures, `testlab_...` run ids for durable cleanup.
- Admin Dashboard loopback-gated (`localhost` / dev mode only).

## Shared Runtime Systems (pattern-level)

These are **architectural intentions** from the prior stack. Mark implemented / deferred per repo when wiring Proto Production.

### Time, overlays, and economy

| System | Intended behavior |
|---|---|
| Game time | Week, season, year |
| Weekly tick | Activities, orders, contracts, forward contracts, overlay state, prestige decay, seasonal/yearly finance hooks |
| Economy phases | Influence finance, contracts, market pressure |
| Weather (if used) | State, intensity, forecast pattern/confidence, next-week forecast; bounded impact on production readiness and market volatility |
| Overlay UI | Dedicated page or tab summarizing impact per site/facility |

Deferred overlay layers (example): severe event chains, player mitigation actions, overlay-specific research, overlay achievements.

### Production domain (placeholder)

When defined in `CONTEXT.md`, document here:

- Facility/site setup and maintenance
- Resource extraction or harvest boundary (creates batch/lot + snapshots)
- Processing pipeline (steps, methods, progress)
- Inventory states (raw → WIP → finished)
- Quality layers and aggregate score (see `docs/VariableRelationshipMap.md`)
- Features / risks / lifecycle after completion
- Reference UI for types, economy, scoring math

**Do not** copy prior winery pipeline names into new code without updating `CONTEXT.md`.

### Sales, contracts, and commodity markets (placeholder)

| System | Intended behavior |
|---|---|
| Customer generation | Regional customers, traits, orders, relationships, partial fulfillment |
| Contracts | Requirements tied to documented quality/site/type/characteristic fields |
| Commodity markets | Buy/sell side, bulk fallback, seasonal rows, loyalty, economy/overlay pressure |
| Forward pre-sales | Generated by market/NPC rules; scale with company value/prestige; delivery/expiration/default handling |
| Finance linkage | Advance, settlement, penalty transaction categories |

Deferred (example): broad dynamic consumer demand, market saturation models.

### Finance, loans, ownership

| System | Intended behavior |
|---|---|
| Core finance | Transactions, income/balance/cash flow, asset valuation |
| Loans | `loanLender` feature seam when active |
| Founder / light ownership | Optional: zero-wage founders, yearly profit share, buyout to salaried staff |
| Share market | Scaffolding only until `boardShare` (or successor) is active; historical plans are reintroduction references, not current runtime |

### Staff and activities

| System | Intended behavior |
|---|---|
| Staff | Recruitment, teams, specializations, wages, assignment, search |
| Activities | Lifecycle via activity managers; `calculateTotalWork()` and domain work calculators |
| Research as activity | Shared work/cost pattern for research projects |
| Skills | Modify work completion through established calculator flow |

### Research (pattern)

| Area | Notes |
|---|---|
| Catalog | Categories, complexity, work profiles, prerequisites, prestige/company-value/loyalty/achievement gates |
| UI | Active effects, footprint, catalog tabs; locked/available/completed states |
| Starting conditions | Regional pre-unlocks where applicable |
| Enforcement | Document unlock targets in `CONTEXT.md` (`unlocks`, `permanentEffects` authoritative over flavor `benefits` text) |
| Permanent effects | Aggregated in a dedicated service; applied in named domain services only |

Deferred (example): equipment gameplay, advanced technique tracks, feature-unlock projects without enforcement.

### Prestige, achievements, highscores

| System | Intended behavior |
|---|---|
| Prestige ledger | Source of truth; permanent vs decaying rows; weekly decay |
| Writers | Sales, contracts, features, research, finance penalties, admin tools — via single insert/upsert API |
| Achievements | Thresholds on persisted log scores, not mutable live state fallbacks |
| Highscores | Historical persisted outputs |

## Domain Systems — To Document When Implemented

Use this checklist when gameplay lands. Copy rows from design into concrete file paths in `docs/PROJECT_INFO.md`.

| Domain | Status | Notes |
|---|---|---|
| Production sites / facilities | TBD | |
| Processing / quality / scoring | TBD | See `VariableRelationshipMap.md` |
| Sales & contracts | TBD | |
| Commodity markets | TBD | |
| Overlays (weather, economy) | TBD | |
| Research unlocks | TBD | |
| Domain reference UI | TBD | |

## Main File Map (workflow template)

Paths are **targets** from the shared repo layout; create or rename as Proto Production domains are defined.

| Area | Main locations |
|---|---|
| App routing / layout | `src/App.tsx`, `src/components/layout/` |
| Shared hooks | `src/hooks/` |
| Shared utilities | `src/lib/utils/` |
| Game constants | `src/lib/constants/` |
| Database layer | `src/lib/database/` |
| Core state / tick | `src/lib/services/core/` |
| Activity lifecycle / work | `src/lib/services/activity/`, `src/components/ui/activities/` |
| Domain services | `src/lib/services/<domain>/` |
| Domain pages | `src/components/pages/` |
| Sales UI | `src/lib/services/sales/`, `src/components/pages/sales/` |
| Finance / staff | `src/lib/services/finance/`, `src/lib/services/user/`, `src/components/finance/` |
| Feature seams | `src/lib/features/` (e.g. `loanLender/`, `researchUpgrade/`, `boardShare/`) |
| Research | `src/lib/constants/researchConstants.ts`, `src/lib/services/research/` |
| Prestige | `src/lib/services/prestige/`, prestige DB modules |
| Achievements / highscores | `src/lib/services/user/`, related DB and pages |
| Admin / test lab | `src/components/pages/admin/`, `src/lib/services/admin/testLab/`, `server/test-runner.ts` |
| Tests | `tests/` |

## Related docs

| Need | Document |
|---|---|
| Domain glossary | `docs/CONTEXT.md` |
| Variable relationships | `docs/VariableRelationshipMap.md` |
| Module ownership | `docs/PROJECT_INFO.md` |
| Session handoff prompt | `docs/AIdocs/AIpromt_newpromt.md` |
