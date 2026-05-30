# Replatform Plan v2: Simulus-Style App With Non-Negotiable Edge Tick Continuity

## Summary
This plan replatforms `tradergame04` to a Simulus-style structure and Simulus-style view routing while enforcing hard operational gates:

1. `supabase/functions/game-tick/index.ts` must remain functional.
2. Automatic hourly game tick via Supabase `pg_cron` must remain functional.
3. `supabase/functions/game-tick/game-bundle.js` must remain present and used by edge tick runtime.
4. Supabase persistence remains the source of truth (tables may change/adapt).
5. Replatform is not complete until automatic hourly tick is proven working in deployed environment.

## Ground Truth Incorporated
1. Current repo already has retained edge function and retained bundle artifact.
2. Current `index.ts` increments `tick_state` and writes `tick_runs`, but does not currently execute bundle logic.
3. Scheduler config is not stored in repo; auto tick depends on external Supabase job state.
4. You selected:
`Hourly cadence`, `Supabase pg_cron`, `DB lock table` for concurrency safety.
5. You want Simulus-style routing and Simulus-style source structure adopted.

## Hard Release Gates (No Phase Completion Without These)
1. Edge function deployable and invokable with success/error telemetry.
2. Bundle file exists and is runtime-referenced by edge logic path.
3. `pg_cron` job exists and invokes `game-tick` hourly.
4. Locking prevents concurrent state-advancing ticks.
5. Tick persistence tables support operational audit and recovery.
6. Post-replatform smoke confirms tick progression from scheduler without manual intervention.

## Target Source Structure (Simulus-Style + Supabase retained)
```text
src/
  App.tsx
  main.tsx
  vite-env.d.ts
  css/
    global.css
  components/
    layout/
      AppShell.tsx
      TopBar.tsx
      Console.tsx
    tutorial/
      SimuluciusDialog.tsx
      ElementHighlight.tsx
    views/
      LoginView.tsx
      CompanyView.tsx
      BuildingsView.tsx
      MarketView.tsx
      InventoryView.tsx
      FinanceView.tsx
      PopulationView.tsx
      CityView.tsx
      TradepediaView.tsx
      ProfileView.tsx
      SettingsView.tsx
      AchievementsView.tsx
      HighscoreView.tsx
      AdminDashboardView.tsx
    ui/
      Shadcn/
      resources/
      building/
      ViewHeader.tsx
  lib/
    gamemechanics/
      viewStore.ts
      displayManager.ts
      gameState.ts
      utils.ts
      gameTickBridge.ts
    player/
    tutorial/
    notifications/
    market/
    buildings/
    localStorage/
    contracts/
    database/
      supabase/
        client.ts
        tickPersistence.ts
        schedulerHealth.ts
      types/
        tick.ts
        multiplayer.ts

supabase/
  functions/
    game-tick/
      index.ts
      game-bundle.js
```

## Routing Model (Locked)
1. Adopt Simulus-style in-app view state.
2. Canonical navigation is typed `ViewId` store (`viewStore.ts`), not route URL.
3. React Router is removed from primary navigation path.
4. Optional URL mirror may be retained only for diagnostics/deep-link convenience.
5. Cross-component navigation uses typed store APIs, not global window custom events.

## Edge Tick Runtime Specification (Locked)
1. `index.ts` runtime flow:
`acquire lock` -> `read state` -> `run tick logic path (bundle-backed)` -> `persist state` -> `log run` -> `release lock`.
2. Bundle-backed path must be explicit:
`game-bundle.js` import retained and referenced by runtime execution path.
3. Persistence tables:
`tick_state`, `tick_runs`, `tick_lock` (new lease/lock table).
4. Lock behavior:
single active lease, bounded TTL, safe release on completion, stale-lock recovery.
5. Failure behavior:
failed runs logged to `tick_runs` with error payload and duration.

## Scheduler Specification (Locked)
1. Use Supabase `pg_cron` as scheduler source of truth.
2. Cadence: hourly.
3. Scheduler must invoke `game-tick` edge function with service role context.
4. Scheduler health check must be part of rollout:
verify last successful run timestamp and expected cadence tolerance.

## Migration Phases

## Phase 0: Tick Continuity Preflight
1. Baseline current deployed tick behavior and tables.
2. Capture current scheduler job metadata and invocation method.
3. Add migration checklist requiring “auto tick verified” before and after each major cutover.
4. Freeze any unrelated edge-function changes during app-structure migration.

Acceptance:
1. Manual invoke works.
2. Scheduler job identified and documented.
3. Baseline run history captured.

## Phase 1: Edge Runtime Hardening First
1. Reintroduce/confirm bundle-backed execution path in edge function.
2. Implement lock-table lease logic (`tick_lock`) for concurrency control.
3. Keep `tick_state` and `tick_runs` writes.
4. Add structured metadata fields for source and run mode.
5. Use Supabase MCP workflow for table/index changes (no raw SQL files in repo).

Acceptance:
1. Concurrent invocations cannot double-advance same tick.
2. Bundle file is runtime-touched by edge function path.
3. Failures produce durable run logs.

## Phase 2: Simulus Structure Skeleton
1. Move to Simulus-style `src/components`, `src/lib`, `src/css`.
2. Keep Supabase/tick modules under `src/lib/database/supabase`.
3. Stage Simulus reference code under `olditeration/simulus01-ui`.
4. Keep app minimal but compiling with new structure.

Acceptance:
1. Build passes with new skeleton.
2. Edge-related modules compile and remain callable.

## Phase 3: View-Store Routing Cutover
1. Replace router-driven shell with Simulus-style `ViewId` store.
2. Implement centralized `AppShell` and view renderer.
3. Keep existing edge invoke UI reachable from at least one view during migration.
4. Add guard view for no-session fallback.

Acceptance:
1. All view transitions run through typed store.
2. No regression in edge invoke capability.

## Phase 4: UI Framework Port
1. Port required shadcn/Radix primitives from Simulus patterns.
2. Port topbar, nav, badges, account/player menu, modal and tabs framework.
3. Port notifications and console framework.
4. Port tutorial dialog + highlight overlay.

Acceptance:
1. Desktop/mobile nav parity works.
2. Toast policy toggles work.
3. Tutorial lifecycle works without service crashes.

## Phase 5: Core Service Port (UI-adjacent)
1. Port display manager, session/player service, tutorial service, notification service.
2. Keep these behind explicit contracts so new logic can replace internals later.
3. Persist temporary UI/session prefs in local storage as needed.
4. Ensure contracts do not encode single-player-only assumptions.

Acceptance:
1. Services initialize reliably on app load.
2. Views function with partial data/capability flags.

## Phase 6: Feature View Shells
1. Port Profile/Settings/Buildings/Market/Inventory/Finance/Population/City/Tradepedia shells.
2. Keep business actions capability-aware with disabled reasons.
3. Provide placeholder adapters where new constants/content are missing.
4. Preserve modal workflows and button behavior patterns from Simulus.

Acceptance:
1. Feature shells render and interact without complete business logic.
2. No hard crashes on missing datasets.

## Phase 7: New Business Logic Integration
1. Build new-from-scratch logic modules and bind via contracts.
2. Keep less resource-hierarchy dependence by simplifying required input models.
3. Add multiplayer/P2P-ready market contracts:
order placement, cancellation, matching state, partial fill, settlement status.
4. Keep UI stable while services are swapped.

Acceptance:
1. Core gameplay actions function through new logic contracts.
2. UI does not require rewrites for multiplayer transition.

## Phase 8: Final Operational Certification
1. Verify deployed scheduler triggers hourly and advances tick.
2. Verify lock table prevents overlapping advances.
3. Verify run history and error telemetry are visible in persistence.
4. Verify bundle is still present and loaded by runtime path.
5. Verify app replatform changes did not break edge invocation from UI.

Acceptance:
1. End-to-end automatic hourly tick confirmed in production-like environment.
2. Non-negotiables pass checklist.

## Public APIs / Interfaces / Types
1. `src/lib/contracts/tickRuntime.ts`
`TickInvocationPayload`, `TickInvocationResult`, `TickRunStatus`.
2. `src/lib/contracts/session.ts`
`ViewId`, `SessionState`, `SessionActions`.
3. `src/lib/contracts/capabilities.ts`
`CapabilityFlag`, `UnavailableReason`.
4. `src/lib/contracts/market.ts`
`MarketMode = p2p`, `OrderBookEntry`, `TradeExecutionState`.
5. `src/lib/database/types/tick.ts`
`TickStateRow`, `TickRunRow`, `TickLockRow`.
6. `src/lib/database/supabase/tickPersistence.ts`
`readTick`, `advanceTick`, `appendRunLog`, `acquireLock`, `releaseLock`, `recoverStaleLock`.
7. `supabase/functions/game-tick/index.ts`
contract-stable response fields for success/error and tick progression.

## Test Cases and Scenarios
1. Unit:
lock acquire/release semantics, stale lock recovery, tick increment idempotency.
2. Integration:
manual function invoke increments exactly once under concurrent requests.
3. Scheduler:
hourly cron triggers successfully for at least one full interval in test environment.
4. Failure path:
forced error run logs status `error` and does not leave lock stuck.
5. Bundle path:
edge function startup and run path asserts bundle import usage.
6. UI:
navigation/view store transitions, topbar/menu/modal/tabs/toast/tutorial interactions.
7. Compatibility:
edge invoke action remains available from UI after routing/style cutover.
8. Build/quality:
TypeScript build clean at each phase.

## Rollout and Safety Controls
1. Phase-gated rollout with explicit operational checks.
2. Keep old and new UI shells in parallel until each feature is validated.
3. Do not deploy structure/routing changes without pre/post tick verification.
4. Keep a rollback branch with known-good edge runtime and scheduler metadata.
5. Record scheduler and table validation in release notes each deployment.

## Assumptions and Defaults
1. Hourly cadence is the required automatic tick schedule.
2. Supabase `pg_cron` remains scheduler authority.
3. DB lock table is mandatory for concurrency safety.
4. Supabase table adaptation uses approved MCP/database tooling workflow.
5. App navigation style will follow Simulus in-app view state.
6. Replatform is considered incomplete until automatic hourly tick is proven functional after deployment.
