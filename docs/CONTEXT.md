# Project Context

Date: 2026-05-31

Canonical domain vocabulary for the currently implemented minimum game loop.

## Scope Status

The runtime currently implements a minimal production simulation:

- one resource (`grain`)
- one building (`farm`)
- one recipe (`produce-grain`)
- one inventory container (`inventory.grain`)
- one manual tick progression (`processGameTick`)

## Domain Vocabulary

| Term | Type | Definition |
|---|---|---|
| `ResourceType` | union | Resource enum, currently only `"grain"`. |
| `Inventory` | object | Resource amounts keyed by resource type; currently `{ grain: number }`. |
| `RecipeType` | union | Recipe enum, currently only `"produce-grain"`. |
| `ProductionRecipe` | object | Recipe metadata with `durationTicks` and `output`. |
| `BuildingType` | union | Building enum, currently only `"farm"`. |
| `NationType` | union | Nation enum: `"denmark"`, `"egypt"`, `"russia"`. |
| `CityType` | union | City enum: `"copenhagen"`, `"aarhus"`, `"cairo"`, `"moscow"`. |
| `NationDefinition` | object | Nation values with normalized `wealth` and `educationLevel` in range `0..1`. |
| `CityDefinition` | object | City values with `nation`, `population`, `wealth`, and `educationLevel` where wealth/education are anchored to the parent nation values. |
| `Building` | object | Building instance with `id`, `type`, `recipeType`, `city`, and derived `nation`. |
| `NATION_DATA` | record | Nation definitions for `"denmark"`, `"egypt"`, and `"russia"`. |
| `CITY_DATA` | record | City-to-definition map with each city's `nation`, `population`, `wealth`, and `educationLevel`. |
| `CITY_TO_NATION_MAP` | record | City-to-nation lookup map. |
| `CITY_TYPES` | array | Ordered list of selectable city ids for UI and creation flows. |
| `getNationForCity()` | function | Derives a building's nation from its selected city. |
| `NATION_TOTAL_POPULATION` | record | Nation-to-population totals derived from all city populations in that nation. |
| `GameLoopState` | object | Core runtime state: `tick`, `money`, `inventory`, `buildings`. |

## Implemented Constants

| Constant | Value | Source |
|---|---|---|
| `STARTING_BALANCE_EUR` | `1000` | `src/lib/constants/gamestate.ts` |
| `GRAIN_PER_PRODUCE_GRAIN_RECIPE` | `1` | `src/lib/constants/recipeConst.ts` |
| `PRODUCE_GRAIN_RECIPE_DURATION_TICKS` | `1` | `src/lib/constants/recipeConst.ts` |

## Naming Policy

- Keep business logic naming explicit and stable.
- Do not add fallback aliases for renamed fields.
- Keep timing-specific names explicit when snapshots/history are added later.
