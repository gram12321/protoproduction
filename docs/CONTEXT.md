# Project Context

Date: 2026-05-30

Stable domain language for this project will live here once core game variables and terminology are defined.

## Status

This file is a placeholder. The previous winery-management glossary was removed during project bootstrap. Do not add invented domain terms here until the new game design is documented.

## Where to look meanwhile

| Need | Document |
|---|---|
| Stack, folder layout, and workflow | `docs/PROJECT_INFO.md` |
| Short project entry point | `readme.md` |
| Implementation status | `docs/AIdocs/AIDescriptions_coregame.md` |
| Variable dependencies (future) | `docs/VariableRelationshipMap.md` |

## Naming policy

These conventions carry forward from the shared stack and workflow:

- Business logic should not use fallback aliases for renamed fields.
- Database persistence should prefer explicit, stable field names.
- Snapshot or historical fields must be explicit about event timing.
