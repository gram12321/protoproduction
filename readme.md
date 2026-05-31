# Proto Production

Turn-based single-player resource production simulation built on the planned React, TypeScript, Vite, Tailwind, ShadCN UI, Supabase, and Vitest stack.

The project is currently in bootstrap: documentation, local agent skills, Cursor configuration, and planning files exist; the app runtime folders may not exist yet. Core simulation logic should live in services once implementation starts, while React components should stay focused on presentation and interaction.

## Quick Start

Use these commands once the app package is installed:

```bash
npm install
npm run dev
```

Useful checks once package scripts exist:

```bash
npm test
npm run build
```

## Planned Codebase Map

| Area | Path | Notes |
|---|---|---|
| App shell and routing | `src/App.tsx`, `src/main.tsx` | React entry point and page selection. |
| Pages | `src/components/pages/` | Top-level game pages. |
| Shared UI | `src/components/ui/` | ShadCN wrappers, modals, and reusable game UI. |
| Hooks | `src/hooks/` | Game state, loading, sorting, mobile detection, and reactive updates. |
| Services | `src/lib/services/` | Domain logic for core game systems and resource production workflows. |
| Database | `src/lib/database/` | Supabase access grouped by domain. |
| Types | `src/lib/types/` | Shared TypeScript domain and UI interfaces. |
| Constants | `src/lib/constants/` | Tunable gameplay numbers and labels. |
| Automated tests | `tests/` | Vitest coverage for services and gameplay calculations. |
| Admin Test Systems | `src/components/pages/AdminDashboard.tsx`, `src/components/pages/admin/TestLabPage.tsx`, `src/lib/services/admin/testLab/`, `server/` | Dev-only UI that separates the shared automated suite from the separate interactive Gameflow Lab. |
| Dev-only server helpers | `server/` | Optional local API helpers such as a test runner. |
| Migrations | `migrations/` | SQL used for database updates. |

## Admin Test Systems

This section is intentionally kept in `readme.md` because the admin test surface is part of the active workflow, not just background documentation.

- The admin-facing menu entry should be visible only in local development mode and only on loopback hosts.
- Automated tests should run the shared Vitest suite through a dev-only route such as `/api/test-run`.
- Manual test tooling should run against the active company by design so fixtures reflect real state, with cleanup based on durable run IDs.
- Keep the automated suite and the manual gameflow lab separate so they can evolve independently.
- `test-viewer/` remains legacy reference material if it exists, not the primary testing surface.

## Architecture Rules

- Put business logic in `src/lib/services/`, not React components.
- Put Supabase reads and writes in `src/lib/database/`.
- Prefer existing barrel exports from `@/components/ui`, `@/hooks`, `@/lib/services`, `@/lib/utils`, and `@/lib/constants`.
- Use shared types from `src/lib/types/` and `src/components/UItypes.ts` when those files exist.
- Use domain terminology from `docs/CONTEXT.md` once it is defined.
- Do not reintroduce copied prior-project domain terms, paths, or examples without explicit approval.
- The project is in active development. Do not add backwards-compatibility branches or data migrations unless explicitly requested.

## Documentation Entry Points

| Need | Start here |
|---|---|
| Stable domain vocabulary | `docs/CONTEXT.md` |
| Current implemented game systems | `docs/AIdocs/AIDescriptions_coregame.md` |
| File structure and ownership map | `docs/PROJECT_INFO.md` |
| Game variable flow and diagrams | `docs/VariableRelationshipMap.md` |
| Development prompt guidance | `docs/AIdocs/AIpromt_newpromt.md` |
| Documentation maintenance guidance | `docs/AIdocs/AIpromt_docs.md` |
| Cleanup/refactor guidance | `docs/AIdocs/AIpromt_codecleaning.md` |
| Agent rules | `docs/AIdocs/airules.mdc` |
| Version history | `docs/versionlog.md` |

## Agent Rules

The canonical docs-side agent rules live in `docs/AIdocs/airules.mdc`.

Cursor keeps a mirrored copy at `.cursor/rules/ai-agent-rule.mdc/airulesVS.instructions.md`.

VS Code Copilot keeps its default always-on copy at `.github/copilot-instructions.md`.

Codex and other compatible agents can use `AGENTS.md` as the repo-level always-on instruction file.

The detailed repo routing skill lives in `.agents/skills/webgamedev-gram/SKILL.md`.

## Version Log Workflow

Use `docs/versionlog.md` as the canonical running change history for meaningful releases and merged feature trains.

- Keep entries in reverse chronological order, newest first.
- Every entry should use the same structure:
  - Header with `Version`, `Date`, `Commit(s)`, and `Stats`
  - `Summary` for intent and outcome
  - `Changes` for file-level impact with `NEW FILE` or `REMOVED` markers when relevant
  - `Notes` for migration, balancing, compatibility, or follow-up context
- Group related commits into one entry when they represent one logical release slice.
- Archive older entries in `docs/versionlog_legacy.md` when `docs/versionlog.md` becomes too large.

## Database Notes

The app is planned to use Supabase. Local environment variables live in `.env.local`, which is gitignored.

Apply database changes to the development database first, then update the appropriate SQL file under `migrations/` for staging or deployment workflows.

## Current System Status

This README is intentionally a short entry point. Detailed implementation status belongs in:

- `docs/AIdocs/AIDescriptions_coregame.md`
- `docs/PROJECT_INFO.md`
- `docs/CONTEXT.md`
- `docs/VariableRelationshipMap.md`
