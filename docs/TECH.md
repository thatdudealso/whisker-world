# Tech - Whisker World

## Stack (Phase 0)

| Layer | Choice |
|-------|--------|
| Language | TypeScript |
| Bundler / dev | Vite |
| Render | Three.js (WebGL) |
| Physics | Rapier (planned next; not in Phase 0) |
| Identity (later host) | Cognito - identity only |
| Game data (later) | Postgres DB `whisker_world` (separate from other 5432wire apps) |

**Not in stack:** Phaser, Orbital rails runtime, 2D primary camera.

## Motion / input

- Desktop: keyboard (WASD / arrows) locomotion, Space jump, Shift sprint, Q / E camera orbit; mouse look / gamepad later.
- Mobile: on-screen stick / touch later; document in [PLAYTEST.md](PLAYTEST.md).
- Motion / device orientation: optional later; must degrade gracefully and stay opt-in.

Locomotion slice (Phase 0 greybox, kinematic - Rapier can replace later):

- `src/input/keyboard.ts` owns key state and emits a per-frame snapshot (normalized move vector, sprint held, edge-triggered jump, orbit direction). Clears on window blur.
- `src/entities/cats/locomotion.ts` is the pure motion model (no three.js): horizontal velocity approaches input * speed cap at a constant rate (`acceleration` when input held, `deceleration` when released - the "not ice-skating, not tank-sticky" band); yaw turns toward travel direction; single jump from grounded under gravity; circular world-bounds clamp (radius 19, matching the chapter ground disc); AABB blocks push the cat out sideways while feet are below the block top and act as landable platforms at/above it. Tuning lives in `DEFAULT_TUNING`. Chapters hand the player a `SpawnPose` (position + yaw) that seeds the locomotion state.
- `src/systems/cameraRig.ts` is the third-person camera: exponential-damped follow of player + offset (position stiffness ~5, look-target ~9) plus slow Q / E orbit; snaps once on first frame instead of swooping in.
- Unit tests for the pure model: `tests/` (vitest, `npm test`).

## World / chapters

Chapter 1 greybox (Whimsical Glowing Forest, biome locked on WW-D2) replaces the Phase 0 flat greybox:

- `src/world/chapters/forestLayout.ts` - pure layout data, no three.js: spawn pose, safe-clearing circle, bounds constants, prop footprints, and `forestObstacles()` (controller-ready AABBs). Unit-tested in `tests/forestLayout.test.ts` (bounds containment, clearing safety, overlook climbability vs jump apex, spawn seeding).
- `src/world/chapters/forestChapter1.ts` - three.js builder: night mood (background + `FogExp2`), ground disc (radius 20), spawn ring marker, terraced overlook (3 x 0.9m steps), violet rift shard + ground crack, bioluminescent mushroom proxies, rim trunks, path-rock ring with route gaps, starlight trail dots. Returns `{ obstacles, spawn }` for `main.ts`.

Conventions:

- **Chapters own scene mood**: background, fog, and every light are created by the chapter builder, not `main.ts`. Swapping chapters swaps atmosphere.
- **Terrain is flat ground + AABB terraces** (no heightfield): stays compatible with the kinematic controller; Rapier remains "planned next".
- **Playable bounds unchanged**: radius 19 clamp (`DEFAULT_TUNING.boundsRadius`), visual disc radius 20.
- **Light budget**: 1 hemisphere + 1 directional + 4 distance-limited point lights; other glow is emissive material, shared per prop group. Keep chapter builders in this ballpark for laptop perf.

## Path base (Vite)

| Environment | `base` |
|-------------|--------|
| Local dev | `/` (default in `vite.config.ts`) |
| Production on 5432wire | `/whisker-world/` |

Do not hardcode absolute production asset URLs in source. Prefer Vite `import.meta.env.BASE_URL` when assets land.

## Quality tiers (working)

| Tier | Target | Notes |
|------|--------|-------|
| Low | Older mobile / integrated GPU | Lower pixel ratio, fewer shadows, simpler materials |
| Medium | Default laptop / mid phone | Balanced |
| High | Desktop discrete GPU | Higher pixel ratio, shadows, denser world |

Implement tiers later under `src/systems` (or similar). Phase 0: single quality path, `devicePixelRatio` capped at 2.

## Source layout (stubs)

```
src/core        runtime bootstrap helpers
src/input       keyboard / pointer / gamepad
src/entities/cats
src/entities/enemies
src/world       chapters, ground, props
src/systems     AI, combat, camera, quality
src/cutscenes
src/ui
src/save
src/net
src/content     data-driven tables / scripts
```
