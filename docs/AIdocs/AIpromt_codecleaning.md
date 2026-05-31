# AI Prompt: Code Cleanup And Refactoring

## Code Cleanup And Optimization

### Current Project Status

The repo may inherit a large service/UI surface from prior work. During bootstrap, prefer removing or isolating dead domain code over preserving unused winery-specific modules.

### Cleanup Targets

- **Illogical code placement:** functions/services in wrong directories or files
- **Duplicate code:** repeated functionality across files
- **Unnecessary code:** dead code, unused imports, placeholders
- **Redundant code:** multiple implementations of the same behavior
- **Inefficient code:** unnecessary database calls, poor algorithms
- **Excessive comments:** comments that restate the code; keep business logic and non-obvious technical detail only

### Specific Areas To Review

| Area | Path | Look for |
|---|---|---|
| Services | `src/lib/services/` | Duplicate logic across domains; domain folders that no longer match game design |
| Components | `src/components/` | Duplicate UI patterns, unused pages/modals from prior game |
| Hooks | `src/hooks/` | Consolidate similar state patterns |
| Utils | `src/lib/utils/` | Duplicate helpers |
| Types | `src/lib/types/` | Overlapping interfaces |
| Constants | `src/lib/constants/` | Unused tunables from retired mechanics |

### Cleanup Goals

- Improve readability and naming
- Reduce redundancy without breaking active features
- Keep business logic out of UI; keep persistence in `src/lib/database/`
- Align folder names with `docs/PROJECT_INFO.md` and `docs/CONTEXT.md`

### Cleanup Process

1. Identify issues (duplicate, unused, misplaced)
2. Plan refactoring without breaking active paths
3. Implement with targeted tests where behavior exists
4. Verify functionality
5. Update `docs/CONTEXT.md`, `docs/PROJECT_INFO.md`, and `AIDescriptions_coregame.md` when ownership or terms change

### Versionlog Governance Sync

- `docs/versionlog.md` is updated by a dedicated versionlog subagent only, after human-created commits (AI commits only if explicitly requested).

### Basic Cleanups (lowest priority)

1. Prefer barrel imports where `index.ts` exists
2. One import per module line
3. Use `index.ts` barrel exports (wildcard when safe) for module public surfaces

### Sanitary Checks (meaningful changes)

Before claiming cleanup done:

- No business logic in `src/components/` or `src/components/pages/`
- No CRUD outside `src/lib/database/`
- Tunable gameplay numbers in `src/lib/constants/`, not scattered magic numbers

See also `.agents/skills/webgamedev-gram/SKILL.md` completion sanitary gate.
