# Project Context

Date: 2026-06-03

Canonical domain vocabulary for the currently implemented production, retail demand, and base-price slice.

## Scope Status

The runtime currently implements a small production simulation with:

- seven resources: `grain`, `water`, `flour`, `sugarcain`, `sugar`, `bread`, and `cake`
- four building types: `farm`, `utilityfacility`, `foodprocessingfactory`, and `bakery`
- seven recipes covering raw production, processing, baking, and water pumping
- inventory totals for every current resource
- manual tick progression through `processGameTick`
- city demand previews for consumer retail resources
- intrinsic base resource cost and city-adjusted base retail price previews
- player retail offers (quantity and price) per resource in one selected marketplace city
- retail sell resolution each tick across `Player`, `Average NPC`, `Follower NPC`, and `Local Suppliers`
- cross-resource substitution, demand creation, and random per-resource demand shocks before seller settlement
- whole-unit retail sales allocation with seller caps and Local Supplier fallback fulfillment
- previous tick marketplace offer/sales snapshot storage for UI display, including per-resource shock reporting
- bounded recent marketplace tick history storage for multi-tick NPC smoothing

Retail phase flow is now implemented as: base demand -> substitution -> demand creation -> random demand shock -> sensitivity-weighted seller allocation.

## Domain Vocabulary

| Term | Type | Definition |
|---|---|---|
| `ResourceType` | union derived from `RESOURCE_DEFINITIONS` | Resource ids: `"grain"`, `"water"`, `"flour"`, `"sugarcain"`, `"sugar"`, `"bread"`, and `"cake"`. |
| `ResourceDefinition` | object | Resource metadata with `isCycleDependentResource` and optional `fixedBaseCost`. |
| `isCycleDependentResource` | boolean | Marks a resource whose intrinsic base cost is anchored by `fixedBaseCost` instead of recursively derived through recipes. |
| `fixedBaseCost` | number | Static base-cost anchor for a cycle-dependent resource. Current `water.fixedBaseCost` is `16`. |
| `Inventory` | object | Resource amounts keyed by every current `ResourceType`. |
| `RecipeType` | union | Recipe ids: `"produce-grain"`, `"pump-water"`, `"produce-flour"`, `"grow-sugarcain"`, `"process-sugarcain"`, `"bake-bread"`, and `"bake-cake"`. |
| `ProductionRecipe` | object | Recipe metadata with `type`, `name`, `workRequired`, optional `input`, and `output`. |
| `BuildingType` | union | Building ids: `"farm"`, `"utilityfacility"`, `"foodprocessingfactory"`, and `"bakery"`. |
| `Building` | object | Building instance with `id`, `type`, `size`, staff, efficiency, active recipe, selected city, and derived nation. |
| `BASE_WAGE` | number | Baseline wage value used by intrinsic resource cost calculations. |
| `BASE_WORK_PER_WORKER_PER_TICK` | number | Baseline work rate used to convert recipe work into intrinsic labor cost. |
| `Base resource cost` | number | City-agnostic intrinsic production reference cost for a resource. Non-cycle resources use the cheapest producing recipe path; cycle-dependent resources use `fixedBaseCost`. |
| `Base city price` | number | Retail reference price for one resource in one city: `baseResourceCost * (1 + city.wealth)`. |
| `NationType` | union | Nation enum: `"denmark"`, `"egypt"`, `"russia"`. |
| `CityType` | union | City enum: `"copenhagen"`, `"aarhus"`, `"cairo"`, `"moscow"`. |
| `NationDefinition` | object | Nation values with normalized `wealth` and `educationLevel` in range `0..1`. |
| `CityDefinition` | object | City values with `nation`, `population`, `wealth`, and `educationLevel` where wealth/education are anchored to the parent nation values. |
| `NATION_DATA` | record | Nation definitions for `"denmark"`, `"egypt"`, and `"russia"`. |
| `CITY_DATA` | record | City-to-definition map with each city's `nation`, `population`, `wealth`, and `educationLevel`. |
| `CITY_TO_NATION_MAP` | record | City-to-nation lookup map. |
| `CITY_TYPES` | array | Ordered list of selectable city ids for UI and creation flows. |
| `City marketplace` | UI/system | Consumer retail preview for one selected city. It shows resource rows with base cost, base city price, and base city demand. |
| `BASE_CONSUMPTION_BY_RESOURCE` | record | Resource-to-base-consumption map used as the per-population starting point for consumer retail demand calculations. |
| `Base city demand` | number | Derived per-resource demand for one city: `city.population * city.wealth * BASE_CONSUMPTION_BY_RESOURCE[resource]`. |
| `Average NPC` | seller role | Secondary seller with quantity `Math.round(baseCityDemand * AVERAGE_NPC_DEMAND_SHARE)` and price anchored to average of base city price and last tick player offer price for the same resource, capped so it never exceeds `baseCityPrice`. |
| `Follower NPC` | seller role | Adaptive seller with quantity based on smoothed recent player sold quantity for the same resource, bounded by a minimum quantity floor, and price anchored to smoothed recent player offer price with a `+/- 5%` adjustment based on follower sell-through across the recent smoothing window. |
| `Local Suppliers` | seller role | Fallback seller that offers at `baseCityPrice` with effectively unlimited quantity in current retail resolution. |
| `INTER_RETAILER_SENSITIVITY` | record | Per-resource exponent controlling seller demand-share responsiveness in weighted retailer competition. |
| `CROSS_LEVEL_ELASTICITY` | record | Elasticity matrix used for bidirectional demand substitution between resource market levels. |
| `Substitution adjusted demand` | number | `baseDemand - substitutionLosses + substitutionGains` after pairwise relative-price substitution pass. |
| `Created demand` | number | Additional demand added when seller prices are below resource average seller price, bounded by creation caps and dampening constants. |
| `Demand shock` | object/null | Per-resource random seller multiplier event (`DEMAND_SHOCK_CHANCE`, `DEMAND_SHOCK_NEGATIVE_MULTIPLIER`, `DEMAND_SHOCK_POSITIVE_MULTIPLIER`) applied before final target rounding. |
| `Rounded demand` | number | Whole-unit demand used for sales: `Math.round(finalDemand)`. |
| `Player sold units` | number | `min(floor(playerTargetDemand), floor(listedQuantity), floor(availableInventory), remainingDemand)`. |
| `NPC sold units` | number | Per-NPC whole-unit sales after weighted seller targeting, seller quantity caps, and remaining demand constraints. |
| `Local Supplier sold units` | number | Remaining whole-unit demand after Player and active NPC seller sales. |
| `MarketplaceDemandShockResult` | object | Snapshot payload for the shocked seller name, multiplier, and target-demand delta for one resource tick. |
| `MarketplaceTickResult` | object | Previous tick seller-level retail summary for one city, with per-resource offers, sold quantities, and optional shock details. |
| `Marketplace tick history` | array | Bounded recent `MarketplaceTickResult` history used by smoothing-based NPC strategies over the last `2..4` ticks. |
| `getNationForCity()` | function | Derives a building's nation from its selected city. |
| `NATION_TOTAL_POPULATION` | record | Nation-to-population totals derived from all city populations in that nation. |
| `GameLoopState` | object | Core runtime state: `tick`, `money`, `inventory`, `buildings`, `lastMarketplaceTick`, and `marketplaceTickHistory`. |

## Implemented Resource And Recipe Chain

| Resource | Current source |
|---|---|
| `grain` | `produce-grain` from `farm` |
| `water` | `pump-water` from `utilityfacility`; marked cycle-dependent with fixed base cost |
| `flour` | `produce-flour` from `foodprocessingfactory`, consuming `grain` |
| `sugarcain` | `grow-sugarcain` from `farm` |
| `sugar` | `process-sugarcain` from `foodprocessingfactory`, consuming `sugarcain` |
| `bread` | `bake-bread` from `bakery`, consuming `flour` |
| `cake` | `bake-cake` from `bakery`, consuming `flour` and `sugar` |

## Implemented Constants And Reference Values

| Constant / value | Current value | Source |
|---|---:|---|
| `STARTING_BALANCE_EUR` | `1000` | `src/lib/constants/gamestate.ts` |
| `BASE_WAGE` | `10` | `src/lib/constants/buildingConst.ts` |
| `BASE_WORK_PER_WORKER_PER_TICK` | `50` | `src/lib/constants/buildingConst.ts` |
| `STAFF_GROWTH_BASE` | `2` | `src/lib/constants/buildingConst.ts` |
| `water.fixedBaseCost` | `16` | `src/lib/types/resourceTypes.ts` |
| `BASE_CONSUMPTION_BY_RESOURCE` | resource-specific values from `0.0001` to `0.1` | `src/lib/constants/popConst.ts` |
| `AVERAGE_NPC_DEMAND_SHARE` | `0.2` | `src/lib/constants/marketplaceConst.ts` |
| `SUBSTITUTION_DEVIATION_THRESHOLD` | `0.02` | `src/lib/constants/marketplaceConst.ts` |
| `SUBSTITUTION_DAMPENING` | `0.5` | `src/lib/constants/marketplaceConst.ts` |
| `DEMAND_CREATION_SENSITIVITY_MULTIPLIER` | `0.8` | `src/lib/constants/marketplaceConst.ts` |
| `DEMAND_CREATION_MAX_ADDITIONAL_MULTIPLIER` | `0.5` | `src/lib/constants/marketplaceConst.ts` |
| `DEMAND_CREATION_DAMPENING` | `0.3` | `src/lib/constants/marketplaceConst.ts` |
| `DEMAND_SHOCK_CHANCE` | `0.05` | `src/lib/constants/marketplaceConst.ts` |
| `DEMAND_SHOCK_NEGATIVE_MULTIPLIER` | `0.85` | `src/lib/constants/marketplaceConst.ts` |
| `DEMAND_SHOCK_POSITIVE_MULTIPLIER` | `1.15` | `src/lib/constants/marketplaceConst.ts` |
| `FOLLOWER_NPC_PRICE_ADJUSTMENT_MULTIPLIER` | `0.05` | `src/lib/constants/marketplaceConst.ts` |
| `FOLLOWER_NPC_LOW_SELL_THROUGH_THRESHOLD` | `0.1` | `src/lib/constants/marketplaceConst.ts` |
| `FOLLOWER_NPC_MIN_QUANTITY_FLOOR` | `1` | `src/lib/constants/marketplaceConst.ts` |
| `FOLLOWER_NPC_SMOOTHING_TICK_WINDOW` | `4` | `src/lib/constants/marketplaceConst.ts` |

Current intrinsic base resource costs:

| Resource | Base resource cost |
|---|---:|
| `grain` | `20` |
| `water` | `16` |
| `flour` | `40` |
| `sugarcain` | `24` |
| `sugar` | `44` |
| `bread` | `64` |
| `cake` | `160` |

## Future Design Intentions

- Tune and expand the current elasticity model after balancing passes on live gameplay data.
- Add price subsidies as a resource or market modifier after price behavior exists.
- Let product quality influence demand and price in a later pass.
- Keep education out of current retail pricing; use it later for product quality and wage calculations.
- Extend wage calculation beyond `BASE_WAGE` when finance and city labor effects are wired.

## Naming Policy

- Keep business logic naming explicit and stable.
- Do not add fallback aliases for renamed fields.
- Keep timing-specific names explicit when snapshots/history are added later.
