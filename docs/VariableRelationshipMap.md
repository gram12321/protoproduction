# Variable Relationship Map

Date: 2026-06-03
Status: Current implemented production, retail demand, and base-price relationships are documented explicitly. Older template sections below remain for deferred systems.
Stable terminology, constants, parameters, and variable descriptions live in [CONTEXT.md](CONTEXT.md). This document describes **how** variables should relate to each other through gameflow once those terms exist.

## Current implemented baseline (2026-06-03)

The runtime currently has a concrete multi-building production and retail-preview chain:

- `GameLoopState.tick` increments by `+1` each manual tick.
- `Building(type, size, currentStaff, recipeType)` resolves to `ProductionRecipe` through `RECIPE_BY_TYPE`.
- Building creation uses `DEFAULT_RECIPE_BY_BUILDING_TYPE` and recipe switching is bounded by `AVAILABLE_RECIPE_TYPES_BY_BUILDING_TYPE`.
- Recipe change resets `currentRecipeWorkProgress` to `0`.
- `Building.size` drives staffing capacity (`maxStaff`) through `calculateMaxStaff(type, size)`.
- Manual staffing can be set from `0` up to `maxStaff`.
- Decreasing size does not auto-reduce `currentStaff`, so `currentStaff` may be above `maxStaff` temporarily.
- Recipe execution consumes required inputs at cycle start, then adds outputs at cycle completion.
- Recipes may require multiple input resources (for example cake requires flour and sugar).
- `RESOURCE_DEFINITIONS` is the source of truth for `ResourceType` and resource metadata.
- `water` is marked `isCycleDependentResource` and uses `fixedBaseCost = 16`.
- Intrinsic `baseResourceCost` is derived from the cheapest producing recipe path, except cycle-dependent resources use `fixedBaseCost`.
- `baseCityPrice` is derived as `baseResourceCost * (1 + city.wealth)`.
- `baseCityDemand` is derived as `city.population * city.wealth * BASE_CONSUMPTION_BY_RESOURCE[resource]`.
- The current city marketplace is a consumer retail preview, not a general input trading market.
- `GameLoopState.money` starts at `1000` and does not change in the baseline tick flow.

Important current constraints:

- `size` and `currentStaff` do not directly multiply output amount; they influence effective work and completion speed.
- `baseResourceCost` and `baseCityPrice` are reference values only; they do not yet consume inventory or change money.
- Price elasticity, price subsidies, product quality, education-based quality, and city-adjusted wage calculations are planned later.

Prestige or progression event sources may be inventoried separately when that subsystem is implemented (e.g. under `docs/superpowers/completed/`).

## 1) Purpose

This map answers:

- Which variables are produced at each stage of gameplay?
- Which subsystems consume each variable later (UI, economy, contracts, highscores, achievements)?
- Which global progression overlays (weather, research, prestige, ownership/finance rules) feed into production and market outcomes?

When adding a new variable, update this map **and** `CONTEXT.md` in the same change.


## 3) Top-Level Gameflow

### 3.1 Current concrete loop (implemented)

```mermaid
flowchart LR
  BLD["Building\n(type,size,staff,recipeType)"] --> RCP["Recipe"]
  INV["Inventory"] --> INCHK["Input check\n(single or multi-input)"]
  RCP --> INCHK
  INCHK -->|has input| START["Consume input(s) at cycle start"]
  INCHK -->|missing input| BLOCK["No cycle start"]
  START --> WORK["Accumulate recipe work progress"]
  WORK --> DONE["Cycle completion"]
  DONE --> OUT["Add output resource"]
  OUT --> INV
```

Current meaning:

- Building selects recipe execution context.
- Recipe defines required inputs, output resource, and work required.
- Inventory provides required inputs when a cycle starts.
- Output is added only when recipe work reaches completion.
- Inventory is the persisted sink and source for recipe chaining.

### 3.2 Expanded target loop (template)

Replace node labels when domain phases are named. Keep the same dependency idea: setup -> ongoing production -> transformation -> inventory -> sales/markets -> history/progression.

```mermaid
flowchart LR
  SETUP["Setup / acquisition\n<facilities, sites, starting state>"] --> PROD["Production management"]
  OVERLAY["Weekly or tick overlays\n<weather, economy, events>"] --> PROD
  PROD --> EXTRACT["Extraction / harvest\n<batch or lot created>"]
  EXTRACT --> INV["Inventory / work-in-progress"]
  INV --> PROC["Processing\n<transform steps>"]
  PROC --> FINISH["Completion\n<bottling, packaging, final unit>"]
  FINISH --> POST["Post-completion evolution\n<aging, decay, features>"]
  POST --> MARKET["Sales, contracts, commodity markets"]
  FINISH --> LOG["Production log / history"]
  LOG --> PROG["Highscores and achievements"]
  MARKET --> ECO["Money, prestige, relationships"]
  PROG --> ECO
  OVERLAY --> MARKET
```

## 4) Main Variable Groups

Fill the “Produces” column when `CONTEXT.md` defines concrete variables.

| Group | Produced from | Produces (typical) |
|---|---|---|
| Site / facility factors | World generation, map choice, facility state | Suitability, static modifiers, contract eligibility |
| Intrinsic resource traits | Resource type constants | Base yields, risk sensitivity, identity bias |
| Identity / anchor layer | Site factors, traits, early process choices | Persisted compact identity used downstream |
| Process controls | Player actions during production and processing | Anchor deltas, characteristic deltas, feature/risk state |
| Quality layer A | Characteristics + identity-adjusted targets | `<qualityIndexA>` (player-facing channel balance) |
| Quality layer B | Identity, characteristics, features, time | `<qualityIndexB>` (second axis if design needs it) |
| Lifecycle modifiers | Features, time in storage, degradation, prestige | Current quality, price, risk |
| Overlay layer | Weather, economy phase, forecast | Production deviations, market pressure, UI context |
| Market layer | Product state, economy, relationships, research | Orders, contracts, commodity trades, revenue |
| Ownership layer | Staff roles, profit, company value | Wage rules, distributions, buyout or share seams |
| Outcome metrics | Quality layers, modifiers, markets | Aggregate score, price, contract validity, history |

## 5) Relationship Invariants

These rules should hold regardless of final variable names:

- **Site + trait identity** is largely fixed at the first major boundary (extraction/harvest/completion of raw lot). Later steps refine, not silently replace, that identity unless design explicitly allows retcon.
- **Process controls** modify identity through anchors, characteristics, features, or explicit snapshots — not through hidden unrelated side effects.
- **Multiple quality layers** stay distinct: document what each layer scores (e.g. physical balance vs flavor profile vs site static value).
- **Static/site quality** affects price and contracts as site or asset quality; it is not the same signal as product taste/quality unless design explicitly merges them.
- **Sales-channel or research unlocks** change access and pricing opportunities; they are not substitutes for quality formulas.
- **Overlays** (weather, economy) apply as explicit deviations to production or markets; do not bury them inside aggregate score math without documenting it.
- **Commodity / bulk markets** are overlays: they may read product or batch state but must not mutate historical snapshots.
- **Ownership/finance layers** affect cash flow and constraints; they do not replace archived share-market or public-company designs unless that runtime is active.
- **Completion snapshots** are the historical source for logs, highscores, and achievement checks tied to a finished unit.
- **Current inventory values** may evolve after completion; **historical snapshots must not drift**.
- **Research unlocks and permanent effects** alter upstream inputs or gates; they should not bypass documented quality computation layers.
- **Prestige (if used)** should be written through a single ledger API with explicit type, source id, decay rules, and metadata — document creators when adding write paths.

### 5.1 Progression Overlay Invariants

- Research gates control **option availability** and scaling boundaries, not score-formula shortcuts.
- Unlock-based gates should list what they affect (planting, methods, caps, contract channels, market access).
- Permanent research effects aggregate from completed research and apply through **named domain services**, not scattered in UI.
- New permanent-effect kinds should follow the same explicit, auditable pattern as existing ones.

## 6) Subsystem Diagrams

Replace placeholder labels with `CONTEXT.md` terms. Keep subgraph boundaries when implementing.

### 6.0 Building capacity and production mapping (current)

```mermaid
flowchart LR
  BT["Building type"] --> BS["Building size"]
  BS --> SR["Staff requirements / bounds\nmin workers, max staff"]
  SR --> CS["Current staff"]
  BT --> AR["Available recipe types"]
  BT --> DR["Default recipe type"]
  AR --> RCP["Active recipe"]
  DR --> RCP
  RCP --> RI["Recipe input requirements"]
  RI --> INV["Inventory"]
  INV --> STARTCHK["Can start cycle?"]
  STARTCHK --> PROG["Recipe work progress"]
  PROG --> PROD["Production output"]
  PROD --> INV
```

Current implementation note:

- Staff and size define staffing bounds and influence effective work speed through efficiency.

### 6.0.1 Current recipe chains: food and utility water

```mermaid
flowchart LR
  FARM["Farm"] --> GRAIN_R["Grow Grain"]
  FARM --> CANE_R["Grow Sugarcain"]
  UTIL["Utility Facility"] --> WATER_R["Pump Water"]

  GRAIN_R --> GRAIN_I["Inventory.grain"]
  CANE_R --> CANE_I["Inventory.sugarcain"]
  WATER_R --> WATER_I["Inventory.water"]

  GRAIN_I --> MILL_R["Mill: Produce Flour"]
  MILL_R --> FLOUR_I["Inventory.flour"]

  CANE_I --> SUGAR_R["Process Sugarcain"]
  SUGAR_R --> SUGAR_I["Inventory.sugar"]

  FLOUR_I --> BREAD_R["Bakery: Bake Bread"]
  BREAD_R --> BREAD_I["Inventory.bread"]

  FLOUR_I --> CAKE_R["Bakery: Bake Cake"]
  SUGAR_I --> CAKE_R
  CAKE_R --> CAKE_I["Inventory.cake"]
```

Food chain note:

- Bread path is fully in-chain: `grain -> flour -> bread`.
- Cake path is fully in-chain: `grain -> flour`, `sugarcain -> sugar`, then `flour + sugar -> cake`.
- Water is currently a no-input utility recipe and a cycle-dependent resource cost anchor.

### 6.0.2 Retail demand and base price flow (current)

```mermaid
flowchart LR
  BW["BASE_WAGE"] --> LAB["Recipe labor cost"]
  BWORK["BASE_WORK_PER_WORKER_PER_TICK"] --> LAB
  WR["recipe.workRequired"] --> LAB
  OUTAMT["recipe.output.amount"] --> LAB

  INPUTS["Recipe input resources"] --> INPCOST["Input base resource costs"]
  INPCOST --> RCOST["Recipe cost per output unit"]
  LAB --> RCOST
  RCOST --> MINCOST["Cheapest producing recipe path"]

  FIXED["fixedBaseCost\ncycle-dependent resources"] --> BASECOST["Base resource cost"]
  MINCOST --> BASECOST

  BASECOST --> CITYPRICE["Base city price"]
  WEALTH["city.wealth"] --> CITYPRICE

  POP["city.population"] --> DEMAND["Base city demand"]
  WEALTH --> DEMAND
  CONSUMPTION["BASE_CONSUMPTION_BY_RESOURCE"] --> DEMAND

  CITYPRICE --> RETAIL["City marketplace row"]
  DEMAND --> RETAIL
```

Current pricing formulas:

- `baseResourceCost(resource)` is the cheapest recursive recipe cost unless `resource.isCycleDependentResource` is true.
- `baseCityPrice(resource, city) = baseResourceCost(resource) * (1 + city.wealth)`.
- `baseCityDemand(resource, city) = city.population * city.wealth * BASE_CONSUMPTION_BY_RESOURCE[resource]`.
- Price elasticity, price subsidies, and product quality are planned second-pass modifiers and do not affect current demand.

### 6.1 Site, Resource, and First Boundary Identity

```mermaid
flowchart LR
  SF["Site / facility factors\n<location, terrain, capacity, health>"] --> SMOD["<siteModifier>"]
  SF --> SUIT["Resource suitability"]
  IRT["Intrinsic resource traits\n<yield, risk, base profile>"] --> ID["Identity at first boundary"]
  SUIT --> ID
  SMOD --> ID
  ID --> BATCH["<inventoryRecord.identity>"]
  SMOD --> SNAP1["<siteModifierSnapshot@boundary1>"]
  BATCH --> SNAP2["<qualitySnapshot@boundary1>"]
```

### 6.2 Process Controls and Transformation

```mermaid
flowchart LR
  BATCH["Inventory / batch"] --> PC["Process controls\n<methods, options, timing>"]
  PC --> AD["Identity deltas"]
  PC --> CD["Characteristic deltas"]
  PC --> FE["Feature / risk state"]
  AD --> CA["Current identity"]
  CD --> CH["Current characteristics"]
  FE --> CA
  FE --> CH
  CA --> PROF["Downstream profiles"]
  CA --> RANGES["Adjusted target ranges"]
  CH --> RANGES
```

### 6.3 Quality Layer A (example: structure-like balance)

```mermaid
flowchart LR
  A["Current identity"] --> R["Adjusted ideal ranges"]
  BC["Base balanced ranges"] --> R
  CH["Characteristics\n<channel1..n>"] --> BAL["Balance scoring"]
  R --> BAL
  RULES["Penalties and synergies"] --> BAL
  BAL --> QI["<qualityIndexA>"]
  QI --> SC["<aggregateScore>"]
  QI --> UI["Quality UI"]
  QI --> CR["Contract requirement"]
```

### 6.4 Quality Layer B (example: profile / wheel)

```mermaid
flowchart LR
  A["Current identity"] --> PF["Profile families / tags"]
  CH["Characteristics"] --> PF
  TYPE["Resource or product type"] --> PF
  FE["Features and time"] --> PF
  PF --> DESC["Display-only descriptors"]
  PF --> TQB["Family weights, ideals, compatibility"]
  TQB --> QI["<qualityIndexB>"]
  QI --> SC["<aggregateScore>"]
  QI --> UI["Profile / wheel UI"]
  QI --> CTR["Contract requirement"]
```

### 6.5 Score, Price, and Market Outcomes

```mermaid
flowchart LR
  QI_A["<qualityIndexA>"] --> SC["<aggregateScore>"]
  QI_B["<qualityIndexB>"] --> SC
  SC --> BASE["Base price = f(score, base rate)"]
  SC --> CURVE["Score curve multiplier"]
  SMOD["<siteModifier>"] --> SPM["Site price multiplier"]
  FE["Feature price effects"] --> FPM["Feature price multiplier"]
  CP["Company prestige"] --> CPM["Prestige multiplier"]
  FP["Facility / unit prestige"] --> FPM2["Local prestige multiplier"]
  BASE --> EP["<estimatedPrice>"]
  CURVE --> EP
  SPM --> EP
  FPM --> EP
  CPM --> EP
  FPM2 --> EP
  EP --> SALES["Offers and inventory value"]
```

### 6.6 Snapshots, History, and Progression

```mermaid
flowchart LR
  CUR["Current product state"] --> EVENT["Completion event"]
  EVENT --> SNAP_Q["<qualitySnapshots@completion>"]
  EVENT --> SNAP_S["<siteModifierSnapshot@completion>"]
  EVENT --> SNAP_SC["<aggregateScoreSnapshot@completion>"]
  SNAP_Q --> LOG["Production log entry"]
  SNAP_S --> LOG
  SNAP_SC --> LOG
  LOG --> HS["Highscores"]
  LOG --> ACH["Achievements"]
  LOG --> HIST["Historical analytics"]
```

### 6.7 Prestige Event Flow (when implemented)

```mermaid
flowchart LR
  START["Starting conditions"] --> PE["<prestigeLedger>"]
  VALUE["Company value"] --> PE
  ASSET["Asset age / site value"] --> PE
  STOCK["Aged inventory collection"] --> PE
  SALES["Sales and contracts"] --> PE
  FEAT["Feature manifestation"] --> PE
  ACH["Achievements"] --> PE
  RES["Research completion"] --> PE
  FIN["Finance penalties"] --> PE

  PE --> PERM["Permanent rows"]
  PE --> DECAY["Decaying rows"]
  PE --> AGG["<currentPrestige>"]
  AGG --> CP["Company prestige"]
  AGG --> FP["Facility prestige"]
  CP --> PRICE["Price multipliers"]
  FP --> PRICE
  CP --> GATES["Research, market, contract gates"]
```

### 6.8 Overlay and Finance Flow (when implemented)

```mermaid
flowchart LR
  TIME["Week / season / year"] --> OVL["Overlay state\n<weather, economy>"]
  OVL --> PIMP["Production impact"]
  SITE["Site response inputs"] --> PIMP
  PIMP --> PROD["Production health / readiness"]
  PROD --> EXTRACT["Output and identity at boundary"]

  OVL --> MKT["Market pressure"]
  ECO["Economy phase"] --> MKT
  REL["Relationship loyalty"] --> MKT
  RES["Research unlocks"] --> MKT
  STATE["Batch / product state"] --> MKT
  MKT --> CASH["Transactions"]

  STAFF["Special staff roles"] --> WAGE["Wage rules"]
  PROFIT["Yearly net profit"] --> DIST["Distributions"]
  COMPANY["Company value"] --> BUY["Buyout or conversion cost"]
  WAGE --> CASH
  DIST --> CASH
  BUY --> CASH
```

## 7) Contract Relationships

Deferred: add rows when contract requirement types exist.

| Contract requirement | Source variable | Notes |
|---|---|---|
| `<qualityRequirementA>` | Current `<qualityIndexA>` | Validates layer A only. |
| `<qualityRequirementB>` | Current `<qualityIndexB>` | Validates layer B only. |
| `<siteValueRequirement>` | Source facility `<siteValue>` | Absolute or normalized per design. |
| `<locationRequirement>` | Facility or origin fields | Region, biome, license, etc. |
| `<resourceTypeRequirement>` | Batch resource / product type | Type and category gates. |
| `<characteristicMin/Max/Deviation>` | Current characteristics | Channel thresholds or distance. |

## 8) Snapshot Relationship Rules

| Event | Snapshot fields (examples) | Consumers |
|---|---|---|
| First boundary | `<siteModifier@b1>`, `<qualityA@b1>`, `<qualityB@b1>` | UI comparison, batch history, debugging early decisions |
| Completion | Quality, site modifier, aggregate score at completion | Production log, highscores, achievements, analytics |
| Log insertion | Persisted fields on log row | Stats, achievements, long-term history |

Rule: name snapshots with explicit timing (`@harvest`, `@completion`, `@sale`) in code and `CONTEXT.md`.

## 9) UI Relationship Surfaces

Map each UI surface to which relationships it must explain (not just display a number).

| UI surface | Relationship shown |
|---|---|
| Product / batch overview | Current score, price, snapshot comparison across boundaries |
| Quality layer A tab | Channels, adjusted ranges, penalties, synergies |
| Quality layer B tab | Profile families, descriptors, weights and reasons |
| Site / facility tab | Inputs behind site modifier |
| Origins / changelog tab | Characteristic changes by source |
| Production log and analytics | Completion snapshots and trends |
| Overlay center | Current overlay, per-site impact, forecast if any |
| City marketplace | Consumer retail demand, intrinsic base resource cost, and city wealth adjusted base city price |
| Market modals | Price/limit factors, economy/overlay pressure, loyalty |
| Finance ownership panel | Special roles, distributions, conversion costs |

## 10) Implementation Checkpoints

Use as a checklist when wiring a new variable group. Replace placeholders with real names.

| Area | Verify |
|---|---|
| Identity model | Runtime and DB accept only documented keys; unknown keys ignored. |
| Quality layers | Each index has documented inputs, weights, and UI breakdown reasons. |
| Aggregate score | Formula documented; inputs listed in `CONTEXT.md`. |
| Production log | Uses completion snapshots for historical score fields. |
| Achievements | Threshold checks use persisted log scores; no silent fallbacks. |
| Contracts | Separate requirement types for distinct signals (do not overload one field). |
| Overlay integration | Bounded deviations via dedicated services; exposed in UI. |
| City retail marketplace | Keep `baseResourceCost`, `baseCityPrice`, and `baseCityDemand` separate until price elasticity and quality are wired. |
| Markets | Bulk/seasonal channels documented; research scaling explicit. |
| Ownership slice | Active rules documented separately from deferred share-market runtime. |
| Display-only data | Descriptors or tags marked display-only until gameplay consumes them. |

## 11) Main Game Variable Relationship Matrix

Fill each row when a game phase is defined. “Player-visible effect” should be one sentence a designer can sanity-check.

| Game phase | Player / state inputs | Main variables produced | Main downstream consumers | Player-visible effect |
|---|---|---|---|---|
| Setup / acquisition | Location, facility choice, starting package | Site factors, eligibility | Suitability, contracts, modifiers | Starting position shapes what you can produce and sell. |
| Overlay tick | Season, calendar, forecast | Overlay state | Production readiness, markets, UI | External conditions shift outlook without rewriting history. |
| Maintenance | Upkeep actions, capacity, health | Updated site factors | Yield, identity bias, modifiers | Maintenance improves output and reduces penalties. |
| Resource identity | Type constants, planted or assigned resource | Intrinsic traits | Identity, characteristics, risk | Resource choice changes style, risk, and buyer fit. |
| First boundary | Timing, site state, traits | Identity, boundary snapshots, batch record | Processing, quality layers | Timing freezes starting identity of the lot. |
| Processing step 1..n | Methods, options, progress | Identity/characteristic deltas, features | Quality layers, completion readiness | Choices push style and risk. |
| Completion | Current state | Completion snapshots, log row | Highscores, achievements, history | Completion freezes public record; inventory may still evolve. |
| Post-completion | Features, time, degradation | Current quality, price, score | Cellar UI, live contract checks | Value can change after completion for live play. |
| Sales / contracts | Requirements, relationships, context | Validity, orders, revenue | Money, prestige, relationships | Market evaluates documented variables. |
| Commodity market | Batch state, market rows, overlays | Prices, limits, loyalty | Cash, inventory, gates | Liquidity outside direct unit sales. |
| Ownership / finance | Roles, profit, company value | Wages, distributions, conversions | Cash flow, finance UI | Early survival vs later conversion tradeoffs. |
| Progression | Log, sales, assets | Achievements, prestige events | Gates, reputation, opportunities | History feeds long-term progression. |

## 12) Main Variable Flow Display

Consolidated view — update labels when `CONTEXT.md` stabilizes.

```mermaid
flowchart TD
  SF["Site / facility factors"] --> ID["Identity at first boundary"]
  IRT["Intrinsic resource traits"] --> ID
  PC["Process controls"] --> CA["Current identity"]
  ID --> CA
  PC --> CH["Current characteristics"]
  CA --> CH

  CA --> AR["Adjusted target ranges"]
  CH --> QI_A["<qualityIndexA>"]
  AR --> QI_A

  CA --> PF["Profile / families"]
  CH --> PF
  PF --> QI_B["<qualityIndexB>"]

  QI_A --> SC["<aggregateScore>"]
  QI_B --> SC
  SMOD["<siteModifier>"] --> PRICE["<estimatedPrice>"]
  SC --> PRICE
  FE["Feature and prestige multipliers"] --> PRICE

  SC --> SNAP["Completion snapshots"]
  QI_A --> SNAP
  QI_B --> SNAP
  SMOD --> SNAP
  SNAP --> LOG["Production log"]
  LOG --> ACH["Achievements"]
  LOG --> HS["Highscores"]
  PRICE --> SALES["Sales / contracts"]
  SALES --> ECO["Money, prestige, relationships"]
  ACH --> ECO
  HS --> ECO
```

## 13) Remaining Alignment Work

- Route research permanent effects through named domain services so modifier origins stay auditable.
- Keep research benefit copy aligned with implementation (`unlocks` / `permanentEffects` authoritative over flavor text).
- Keep identity parsing strict: unknown keys ignored; new logic targets only the documented compact model.
- When adding prestige write paths, update any prestige source inventory doc in the same PR.
- Keep deferred systems (e.g. share market, descriptor-level scoring) framed as inactive until runtime is wired.
- When overlay mechanics expand (events, mitigation, research upgrades), update §6.8 and implementation checkpoints.
- When commodity market unlocks change, update §4 market row and contract table.
- Before wiring display-only descriptors into outcomes, update this map and `CONTEXT.md` first.

## Related docs

| Need | Document |
|---|---|
| Domain glossary (names and definitions) | [CONTEXT.md](CONTEXT.md) |
| Module ownership and paths | [docs/PROJECT_INFO.md](PROJECT_INFO.md) |
| What is actually implemented | [docs/AIdocs/AIDescriptions_coregame.md](AIdocs/AIDescriptions_coregame.md) |
