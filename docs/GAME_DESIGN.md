# Game Design - Whisker World

Phase 1 vertical-slice design brief. Details evolve; constraints in [AGENTS.md](../AGENTS.md) win on conflict.

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
- Multi-chapter world map / select is later; the current slice is a complete Chapter 1 loop and keeps Chapters 2-6 locked.
- **Chapter 1 vertical slice exists**: Whisperleaf Glowing Forest (Luna's home, biome locked WW-D2) - title and cat select, six-beat intro, spawn clearing, terraced overlook, Rift shard, glowing mushrooms, starlight trails, tracked objectives, and completion/replay flow. The code-built scene uses clay-toon forms and remains replaceable placeholder art under `src/world/chapters/`.

## Out of scope (Phase 1 slice)

- Chapters 2-6, final art, final story beyond the locked Chapter 1 beats, multiplayer, combat, saves, cloud identity, and Rapier physics.
- Any 2D engine rewrite.
