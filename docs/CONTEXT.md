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
| `Building` | object | Building instance with `id`, `type`, and `recipeType`. |
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
