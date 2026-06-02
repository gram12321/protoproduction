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

Retail pricing is currently a reference display only. It is not yet connected to sales, inventory depletion, money, price elasticity, price subsidies, product quality, or city-specific wage/education effects.

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
| `getNationForCity()` | function | Derives a building's nation from its selected city. |
| `NATION_TOTAL_POPULATION` | record | Nation-to-population totals derived from all city populations in that nation. |
| `GameLoopState` | object | Core runtime state: `tick`, `money`, `inventory`, and `buildings`. |

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

- Add price elasticity after the current static demand preview is stable.
- Add price subsidies as a resource or market modifier after price behavior exists.
- Let product quality influence demand and price in a later pass.
- Keep education out of current retail pricing; use it later for product quality and wage calculations.
- Extend wage calculation beyond `BASE_WAGE` when finance and city labor effects are wired.

## Naming Policy

- Keep business logic naming explicit and stable.
- Do not add fallback aliases for renamed fields.
- Keep timing-specific names explicit when snapshots/history are added later.
