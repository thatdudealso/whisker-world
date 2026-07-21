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
- `src/entities/cats/locomotion.ts` is the pure motion model (no three.js): horizontal velocity approaches input * speed cap at a constant rate (`acceleration` when input held, `deceleration` when released - the "not ice-skating, not tank-sticky" band); yaw turns toward travel direction; single jump from grounded under gravity; circular world-bounds clamp (radius 19 on the 40x40 greybox ground); AABB blocks push the cat out sideways while feet are below the block top and act as landable platforms at/above it. Tuning lives in `DEFAULT_TUNING`.
- `src/systems/cameraRig.ts` is the third-person camera: exponential-damped follow of player + offset (position stiffness ~5, look-target ~9) plus slow Q / E orbit; snaps once on first frame instead of swooping in.
- Unit tests for the pure model: `tests/` (vitest, `npm test`).

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
