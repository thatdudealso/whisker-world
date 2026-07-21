# Game Design - Whisker World

Phase 0 design brief. Details evolve; constraints in [AGENTS.md](../AGENTS.md) win on conflict.

## Pitch

Six cats. One secret syndicate. A semi-open 3D world of chapter-scale maps where you prowl, climb, scheme, and choose which trails to follow - not a fixed rail tour, not a 2D sidescroller.

## Six cats

Roster **LOCKED** (captain lavish board **WW-D1**). Do not rename without a needs-decision. Source of truth for stats and kits is [`src/content/cats.ts`](../src/content/cats.ts).

| id | Cat | Role | Kit language (wardrobe tags) |
|----|-----|------|------------------------------|
| `luna` | Luna | Explorer | calico, star scarf, bell, leaf satchel |
| `shadow` | Shadow | Stealth | gray tuxedo, charcoal scarf, utility pouch |
| `blaze` | Blaze | Tank | ginger tabby stocky, red bandana, satchel, armor bit |
| `misty` | Misty | Agile puzzle | siamese/snowshoe biped clay, teal scarf, shell, wave pouch |
| `willow` | Willow | Support | fluffy ragdoll, pastel knit scarf, herbal satchel |
| `dash` | Dash | Speed | bengal biped sprinter, boyish smirk, racing scarf, goggles, pouch |

All six share the locked locomotion feel; per-cat deltas stay small and data-driven (Dash sprints a touch faster, Blaze is a touch slower). Luna is the default starting cat.

## Syndicate

The cats are (or become) entangled with a **syndicate** - not pure cartoon villains, not pure heroes. The syndicate is the social spine: jobs, rival cells, loyalty tests, and shared goals that justify multi-cat play and chapter handoffs.

See [STORY_SYNDICATE.md](STORY_SYNDICATE.md) for the Rift frame and the chapter 1 villain landing (filled from the WW-D3 / WW-D4 lock).

## Semi-open chapters

- **Chapter** = a playable region with a hub, side routes, and a main objective chain.
- Movement is free within the chapter bounds (ground + vertical play later).
- **Not Orbital rails:** no exclusive fixed-camera on-rails locomotion as the core loop.
- Progress gates (story, abilities, keys) unlock new routes; backtracking is encouraged.
- Multi-chapter world map / select is later; Phase 0 includes a chapter-select stub alongside the greybox locomotion slice.
- **Chapter 1 greybox exists**: Whimsical Glowing Forest (Luna's home, biome locked WW-D2) - spawn clearing, terraced overlook, rift-crack shard, glowing mushrooms, starlight trails. Greybox primitives only (`src/world/chapters/`); clay/toon art comes later per [ART_BIBLE.md](ART_BIBLE.md).

## Out of scope (Phase 0)

- Final art, final story, multiplayer, full combat, full save cloud.
- Any 2D engine rewrite.
