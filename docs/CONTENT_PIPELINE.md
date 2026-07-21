# Content Pipeline

How levels, cats, dialogue, and encounters enter the game. Chapter 1 is currently authored directly in typed source; external authoring tools remain future work.

## Planned sources

| Content | Likely home | Notes |
|---------|-------------|-------|
| Cat stats / kits | `src/content` or JSON under `assets` | Data-driven preferred |
| Chapter layouts | `src/world` + content tables | Code-built Three.js scene with pure layout data |
| Dialogue / cutscenes | `src/cutscenes` + content | Rift / syndicate lines |
| Art / audio | `assets/` | After WW-D0-art |

## Principles (draft)

1. Prefer data over hardcoded one-offs for roster and chapter tables.
2. Keep secrets and live service URLs out of content packs.
3. Validate content in CI when schemas exist.

## Current schemas

**Cats** - [`src/content/cats.ts`](../src/content/cats.ts), typed `CatDefinition`:
stable `id` (union type, save-safe), `name`, `role`, `blurb`, `bodyColor` /
`accentColor` (#rrggbb greybox tints), `accessories` (wardrobe label strings
only until WW-D0 assets), optional `locomotion` (small `Partial<PlayerTuning>`
deltas on the shared feel). Table order = UI cycle order. Validated by
`tests/content.test.ts` (six cats, unique ids, delta bounds).

**Chapters** - [`src/content/chapters.ts`](../src/content/chapters.ts), typed
`ChapterDefinition`: `id`, `title`, `biome` keyword, `homeCatId` (must be a
roster id), `locked`. Only chapter-1 (forest / Luna) is unlocked; the select
stub shows "coming soon" for the rest. Geometry stays in `src/world`, never
in content tables.

## TODO

- [x] Schema for cat definitions (`src/content/cats.ts`)
- [x] Chapter table format (`src/content/chapters.ts`; spawn tables later)
- [ ] Import path from external design tools (if any)
