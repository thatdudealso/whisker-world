# Content Pipeline (stub)

How levels, cats, dialogue, and encounters will enter the game. Phase 0: empty process - fill as tools appear.

## Planned sources

| Content | Likely home | Notes |
|---------|-------------|-------|
| Cat stats / kits | `src/content` or JSON under `assets` | Data-driven preferred |
| Chapter layouts | `src/world` + content tables | Greybox first |
| Dialogue / cutscenes | `src/cutscenes` + content | Rift / syndicate lines |
| Art / audio | `assets/` | After WW-D0-art |

## Principles (draft)

1. Prefer data over hardcoded one-offs for roster and chapter tables.
2. Keep secrets and live service URLs out of content packs.
3. Validate content in CI when schemas exist.

## TODO

- [ ] Schema for cat definitions
- [ ] Chapter / spawn table format
- [ ] Import path from external design tools (if any)
