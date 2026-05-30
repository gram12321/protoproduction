# Simulus-Style Replatform Plan for `tradergame04` (UI + Core Service Migration)

## Summary
This plan replatforms `tradergame04` into a Simulus-style codebase and navigation model, while keeping Supabase/edge-function compatibility and leaving room for new-from-scratch multiplayer + P2P business logic.

The migration order is:
1. Adopt Simulus structure and routing style first.
2. Import UI framework and core shared services next.
3. Keep business-heavy logic modular and replaceable.
4. Implement feature UIs with capability-aware placeholders until new logic is ready.
5. Transition services to multiplayer/P2P semantics without rewriting UI again.

## Locked Decisions (from your latest direction + choices)
1. Routing model: Simulus behavior via central view store, not URL router as primary navigation.
2. Source structure: Simulus-style `src/components`, `src/lib`, `src/css` is adopted, while keeping tradergame Supabase/edge integration.
3. Service migration depth: UI framework first, then immediately port core shared services (session/player, display updates, notifications, tutorial).
4. Product direction: this is a Simulus iteration, with less resource-hierarchy dependency and future multiplayer + P2P market.
5. Business logic reality: UI must function before full business constants/content exist.

## Current-State Findings Incorporated
1. `tradergame04` currently has minimal framework shell and custom primitives in `src/shared/ui`.
2. Simulus has mature reusable UI patterns for topbar, account menu, badges, tutorial, toasts, profile/settings, and modal/tab workflows.
3. Simulus pages are tightly coupled to Simulus service layer; direct page copy without adapter/contracts will cause dead ends.
4. Simulus routing is in-app view state with optional custom event hooks; this will be translated to typed view store/context.
5. Supabase edge function in `tradergame04` is still important and must remain supported.

## Target File Structure (Decision Complete)
```text
src/
  App.tsx
  main.tsx
  vite-env.d.ts
  css/
    global.css
  components/
    layout/
      TopBar.tsx
      Console.tsx
      AppShell.tsx
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
        ...primitives...
        toast/
          toast.tsx
          toast-container.tsx
          use-toast.ts
      resources/
        emojiMap.ts
      building/
        ...reusable building UI sections...
      ViewHeader.tsx
  lib/
    gamemechanics/
      gameState.ts
      displayManager.ts
      viewStore.ts
      utils.ts
      gameTickBridge.ts
    player/
      playerService.ts
      sessionService.ts
    localStorage/
      storageService.ts
      notificationStorage.ts
      tutorialStorage.ts
    tutorial/
      tutorialTypes.ts
      tutorialData.ts
      tutorialService.ts
      tutorialInitService.ts
    notifications/
      toastPolicyService.ts
      consoleService.ts
    market/
      marketUiService.ts
    buildings/
      facilitiesUiService.ts
      productionUiService.ts
      buildingModalService.ts
      types.ts
    contracts/
      session.ts
      capabilities.ts
      notifications.ts
      tutorial.ts
      facilities.ts
      market.ts
      profile.ts
      settings.ts
    database/
      supabase/
        client.ts
        tickService.ts
        multiplayerGateway.ts
      types/
        tick.ts
        multiplayer.ts
olditeration/
  simulus01-ui/
    ...copied reference snapshots...
```

## Routing and View System Specification
1. Primary navigation is `ViewId` state in `lib/gamemechanics/viewStore.ts`.
2. `ViewId` union is fixed initially to:
`Login | Company | Buildings | Market | Inventory | Finance | Population | City | Tradepedia | Profile | Settings | Achievements | Highscore | AdminDashboard`.
3. `App.tsx` renders by `currentView` exactly like Simulus style, but no global `window` event dependency.
4. Cross-component navigation API is `setView(view: ViewId, reason?: string)`.
5. Optional URL sync is one-way mirror only:
query param `?view=...` can initialize/restore view, but URL is not canonical router.
6. `react-router-dom` is removed from runtime navigation usage in this phase.

## Adapter/Contract Strategy (to avoid UI blocking)
1. Every view reads from typed contracts, not raw domain services.
2. Contract-first services live in `src/lib/contracts`.
3. Core contracts are mandatory before view ports:
`SessionContract`, `NotificationContract`, `TutorialContract`, `FacilitiesContract`, `MarketContract`, `ProfileContract`, `SettingsContract`, `UiCapabilities`.
4. `UiCapabilities` drives disabled actions and missing-data placeholders, so UI can ship before full business logic.
5. `gameState` starts as compatibility store and later becomes thin selector layer over new business logic.

## Detailed Migration Phases

## Phase 1: Structure Replatform
1. Move entrypoint shape to Simulus-style (`src/main.tsx`, `src/App.tsx`, `src/css/global.css`).
2. Create target directories exactly as above.
3. Stage source snapshots into `olditeration/simulus01-ui`.
4. Add migration inventory doc with file-by-file status tags:
`copy`, `adapt`, `defer`, `discard`.

Acceptance criteria:
1. Build passes with empty/skeleton views.
2. No business logic port yet.
3. Existing edge-function code untouched.

## Phase 2: UI Primitive Uplift
1. Replace minimal primitives with shadcn/Radix-compatible primitives needed by Simulus UI patterns.
2. Add missing primitives:
`navigation-menu`, `avatar`, `switch`, `checkbox`, `label`, `radio-group`, `accordion`, improved `dialog`, improved `tabs`, robust `dropdown-menu`, Radix toast.
3. Normalize all primitive imports through one local utility `cn`.
4. Align theme tokens and animation classes in global CSS to support imported components.

Acceptance criteria:
1. Primitive showcase page renders all components.
2. Keyboard/accessibility behaviors work for dialog/dropdown/tabs/toast.
3. No component imports from old `src/shared/ui`.

## Phase 3: View Store and Shell
1. Implement `viewStore` with typed `ViewId` and subscription API.
2. Build `AppShell` + `TopBar` from Simulus pattern, wired to view store and session contract.
3. Implement desktop/mobile nav, badges, account dropdown, and menu interactions.
4. Keep `Login` as gate view when no active session/company.

Acceptance criteria:
1. Navigation works across all view IDs.
2. Mobile menu and dropdown interactions are stable.
3. No React Router runtime dependency for view switching.

## Phase 4: Core Service Port (UI-Adjacent)
1. Port and adapt:
`displayManager`, player/session service, notification policy service, tutorial service.
2. Keep persistence temporary via local storage services to unblock behavior.
3. Keep interface seam for later Supabase replacement through `lib/database/multiplayerGateway.ts`.
4. Add strict typing to all service APIs to avoid Simulus `any` drift.

Acceptance criteria:
1. Session init, view refresh, notifications, and tutorial lifecycle run end-to-end.
2. App state rehydrates after reload.
3. Service modules are independent from heavy market/building simulation logic.

## Phase 5: Notification System + Console
1. Port toast architecture and structured message support.
2. Implement category and message-type filters in settings.
3. Add message history console panel.
4. Route all UI messages through one notification gateway.

Acceptance criteria:
1. Toasts can be enabled/disabled globally and per category/type.
2. Structured notification rendering works.
3. Console and toast stay consistent.

## Phase 6: Tutorial System
1. Port tutorial dialog + highlight overlay + tutorial data model.
2. Route-based/view-based tutorial triggers via view store transitions.
3. Add hard off switch and reset controls in settings.
4. Support missing target element gracefully with no crash.

Acceptance criteria:
1. Tutorial start/next/prev/end works.
2. Highlight follows target element and cleans up listeners.
3. Tutorial state persists.

## Phase 7: Profile/Settings/Player Menu
1. Port `ProfileView` and `SettingsView` UI and interactions.
2. Replace direct Simulus dependencies with contract services.
3. Keep stats panels and company switch UX, but back with capability-aware placeholders where data is absent.
4. Integrate account actions in topbar dropdown.

Acceptance criteria:
1. Profile edit flows and settings toggles persist.
2. Company switching flow works through session contract.
3. Empty-state UX is explicit and non-breaking.

## Phase 8: Facilities/Production/Market UI Shells
1. Port modal/tab/button workflows for facilities and market.
2. Build feature views around `FacilitiesContract` and `MarketContract`.
3. Implement disabled action states with reason codes when backend logic/constants are not ready.
4. Include reusable modal section components for create/build/upgrade/buy/sell actions.

Acceptance criteria:
1. All major action buttons render with enabled/disabled logic.
2. Modal and tab flows are fully navigable.
3. No hard dependency on completed business simulation.

## Phase 9: Business Logic and Multiplayer/P2P Transition
1. Introduce new-from-scratch tradergame logic modules behind contracts.
2. Add multiplayer-aware session semantics:
player identity, active company, shared world context, peer activity placeholders.
3. Redefine market contract to P2P/orderbook semantics:
`placeOrder`, `cancelOrder`, `acceptTrade`, `partialFill`, `tradeHistory`.
4. Gradually retire Simulus-compat behavior while preserving UI contracts.

Acceptance criteria:
1. UI remains stable while services are swapped.
2. P2P trade states are visible and testable.
3. No UI rewrite required for final multiplayer migration.

## Public APIs / Interfaces / Types to Add
1. `lib/contracts/session.ts`:
`ViewId`, `PlayerSummary`, `CompanySummary`, `SessionState`, `SessionContract`.
2. `lib/contracts/capabilities.ts`:
`CapabilityFlag`, `ActionReason`, `UiCapabilities`.
3. `lib/contracts/notifications.ts`:
`UiNotification`, `NotificationCategory`, `NotificationPolicy`, `NotificationContract`.
4. `lib/contracts/tutorial.ts`:
`Tutorial`, `TutorialStep`, `TutorialState`, `TutorialContract`.
5. `lib/contracts/facilities.ts`:
`FacilityVM`, `FacilityAction`, `FacilityModalVM`, `FacilitiesContract`.
6. `lib/contracts/market.ts`:
`MarketMode`, `OrderBookEntry`, `TradeIntent`, `TradeExecution`, `MarketContract`.
7. `lib/contracts/profile.ts`:
`ProfileData`, `PortfolioEntry`, `ProfileContract`.
8. `lib/contracts/settings.ts`:
`SettingsState`, `SettingsContract`.
9. `lib/database/types/multiplayer.ts`:
types for peer/session/order/trade records.

## Data Flow Specification
1. `main.tsx` mounts `App`.
2. `App` bootstraps session and tutorial systems, then renders `AppShell`.
3. `TopBar` reads view/session summaries and emits `setView`.
4. Active view reads its contract service selectors.
5. Actions call contract service commands.
6. Service commands emit display updates and notifications.
7. Persistence layer writes to local storage initially, then to Supabase/multiplayer gateway.

## Test Cases and Scenarios
1. App bootstrap:
no player, existing player, corrupted persisted state.
2. Navigation:
all `ViewId` transitions from topbar and programmatic action.
3. Mobile:
menu open/close, badge cluster responsiveness, account actions.
4. Notifications:
global toggle, category/type filtering, structured message expansion, dismiss/timeout.
5. Tutorial:
start, step transitions, skip, reset, highlight target missing, highlight on scroll/resize.
6. Profile/settings:
edit profile, change toggles, persistence after reload, company switch.
7. Facilities/market shells:
modal opening, tab switching, capability-driven disabled states with clear reasons.
8. Contract integrity:
all view services satisfy contracts and return valid fallback models.
9. Build quality:
strict TypeScript compile passes at each phase.
10. Regression:
edge-function invocation panel remains available until equivalent shell view replaces it.

## Rollout and Migration Safety
1. Keep migration branch with phase-by-phase checkpoints.
2. Maintain `olditeration/simulus01-ui` references until full contract replacement stabilizes.
3. Preserve edge function and Supabase tick path during UI replatform.
4. Introduce one feature domain at a time to avoid broad breakage.
5. Keep a temporary compatibility view (`Framework` or `Diagnostics`) until core shell is stable.

## Assumptions and Defaults
1. Temporary persistence for core UI services uses local storage compatibility first.
2. Supabase integration remains authoritative for edge tick and future multiplayer gateway, not for immediate UI bootstrapping.
3. Resource hierarchy-heavy views/components are not required to block initial shell migration.
4. React Router URL routing is not primary in target architecture.
5. All missing business constants/data are represented through typed placeholders and capability flags.
6. Simulus files are copied aggressively, but runtime imports are only from adapted `src/components` and `src/lib` modules in this repo.
