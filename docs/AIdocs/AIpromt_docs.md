# AI Prompt: Documentation Maintenance

Use this when updating project documentation after implementation work.

## Documentation Roles

| File | Role |
|---|---|
| `readme.md` | Short codebase introduction, setup commands, and doc map. |
| `docs/CONTEXT.md` | Stable domain vocabulary, parameters, constants, and naming policy. |
| `docs/AIdocs/AIDescriptions_coregame.md` | Stack, shared systems, UI/infra patterns, and implementation status (domain sections filled as gameplay lands). |
| `docs/PROJECT_INFO.md` | File structure, ownership map, and major module locations. |
| `docs/VariableRelationshipMap.md` | Variable relationships, diagrams, and game-flow dependencies (template until variables are defined). |
| `docs/superpowers/specs/` | Design specs and decisions for larger work. |
| `docs/superpowers/plans/` | Implementation plans and acceptance notes. |
| `docs/superpowers/completed/` | Completed or superseded implementation docs kept for traceability. |
| `docs/versionlog.md` | Version history. |

Historical plans under `docs/superpowers/plans/` from prior games are **not** current runtime unless confirmed in `AIDescriptions_coregame.md` or code.

## Update Rules

- Keep `readme.md` concise. Move system status, roadmap detail, and implementation history to dedicated docs.
- Update `docs/CONTEXT.md` when terminology, constants, parameters, variables, or naming policy changes.
- Update `docs/PROJECT_INFO.md` when files move, modules are renamed, or ownership boundaries change.
- Update `AIDescriptions_coregame.md` when shared infrastructure or domain implementation status changes.
- Update `docs/VariableRelationshipMap.md` when variable dependencies or game-flow relationships change (replace placeholders with real names).
- Update research/spec docs without deleting useful future ideas; mark them implemented, superseded, or deferred.
- Remove stale names instead of documenting compatibility branches that no longer exist.

## Verification

Before finishing a documentation pass:

```bash
git diff --check
```


