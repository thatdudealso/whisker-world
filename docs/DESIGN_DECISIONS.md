# Design Decisions Log

Append-only log of durable product / tech decisions. Newest at the bottom.

## Template

```
### YYYY-MM-DD - Short title
- **Status:** proposed | accepted | superseded
- **Context:** why this came up
- **Decision:** what we chose
- **Consequences:** what changes / what we will not do
- **Links:** PR, lavish board, issue
```

## Log

### 2026-07-19 - Phase 0: 3D Three.js scaffold, not rails / not 2D
- **Status:** accepted
- **Context:** Public repo scaffold for Whisker World under firstmate plan.
- **Decision:** Three.js + Vite + TypeScript greybox; Rapier later. Explicitly not Orbital rails, not Phaser/2D. Host path and DB name documented only.
- **Consequences:** All new gameplay systems assume 3D scene graph + free locomotion. Art style deferred to WW-D0-art.
- **Links:** Phase 0 scaffold PR (this branch)

### 2026-07-19 - Art style LOCKED: hybrid A (clay / soft toon 3D) + B (outfit & accessories)
- **Status:** accepted
- **Context:** Captain resolved lavish board **WW-D0-art**. Prior status was TBD.
- **Decision:** **Hybrid.** Primary style is **A - clay / soft toon 3D**: cat bodies, enemies, props, and the world use a soft, hand-sculpted clay / toon look. **Plus** the **B wardrobe language** layered on top: outfits and accessories (scarves, bags, explorer-kit props). Bodies and the world stay clay/toon; the *wardrobe* language comes from B.
- **Consequences:** Bodies and environments render in the clay/soft-toon direction; character customization and identity read primarily through swappable outfits and accessories in the B language, not through body restyling. Materials/shaders target stylized soft-toon (not photoreal, not pixel). See [ART_BIBLE.md](ART_BIBLE.md).
- **Links:** lavish board WW-D0-art; Phase 0 scaffold PR (this branch)

### 2026-07-20 - Locomotion feel: kinematic constant-rate accel model, no Rapier yet
- **Status:** accepted
- **Context:** First playable slice needed the capsule cat to feel good to drive before physics or art lands. Choice was between adopting Rapier now or a hand-tuned kinematic controller.
- **Decision:** Kinematic controller (`src/entities/cats/locomotion.ts`, pure TS, unit-tested). Velocity approaches input * cap at a constant rate (~0.2s to full speed, ~0.23s to stop); yaw turns to face travel; single grounded jump with snappy gravity (18 m/s^2, apex ~1.2m); sprint raises the cap (4.5 to 7 m/s); circular bounds clamp (r=19 on the 40x40 greybox); AABB blocks are walls below their top and platforms above it. Camera is exponential-damped follow with optional Q / E orbit.
- **Consequences:** Motion feel is tuned in one typed, testable module instead of emergent from a physics engine. Rapier stays "planned next" for real physics needs (props, enemies, complex collision); if adopted, it should reproduce these tuning numbers, not redefine them.
- **Links:** locomotion slice PR (fm/whisker-locomotion-p0)

### 2026-07-20 - Chapter 1 forest greybox: AABB terraces over heightfield, chapters own scene mood
- **Status:** accepted
- **Context:** Replacing the flat Phase 0 plane with the Chapter 1 Whimsical Glowing Forest greybox (biome locked WW-D2). Ground height variation could come from a heightfield (needs a ground-height sample in locomotion) or from terraced AABB platforms the existing controller already handles.
- **Decision:** Terraced platforms and ramp-free hop chains only; no ground height function, no Rapier. Layout data is a pure module (`src/world/chapters/forestLayout.ts`, unit-tested for bounds, spawn safety, and climbability) separate from the three.js builder (`forestChapter1.ts`). The chapter builder owns the whole scene mood - background, fog, and all lights - so `main.ts` stays a thin bootstrap and future chapters swap atmosphere wholesale. Playable bounds stay radius 19; spawn is a `SpawnPose` the chapter hands to the player (small locomotion extension, default origin preserved).
- **Consequences:** Vertical play reads as steps/hops until Rapier lands; heightfield terrain is deferred. Every future chapter should export `{ obstacles, spawn }` and keep the ~6-light budget documented in TECH.md. The Phase 0 `src/world/greybox.ts` is deleted.
- **Links:** chapter 1 forest greybox PR (fm/whisker-chapter1-p0); WW-D2 biome lock

### 2026-07-20 - Chapter 1 intro: skippable card cutscenes, not cinematics
- **Status:** accepted
- **Context:** WW-D4 locked a six-beat chapter 1 storyboard (opening tear, Velvet's offer, crew map, Rift-Wisp, boss setpiece, aftermath). We needed a way to gate gameplay start on story without waiting for art, cameras, or voice.
- **Decision:** Cutscenes are data-driven card overlays: beats in `src/content/cutscenes/chapter1.ts`, a pure idle -> playing -> finished state machine in `src/cutscenes/player.ts`, and a DOM overlay with solid-color biome plates in `src/cutscenes/overlay.ts`. Space / Enter / click advance, Esc / Skip button skips. First visit autoplays; finishing sets `ww_ch1_intro_seen` in localStorage so replay is opt-in via `?cutscene=1`. Gameplay input is gated with `KeyboardInput.setEnabled(false)` while playing.
- **Consequences:** Story beats ship and gate the game now; real 3D cinematic cameras, voice, and clay art can replace the presentation layer later without touching beat data or the state machine. Villain landing (Velvet, Rift-Wisp) is canon for chapter 1 in STORY_SYNDICATE.md.
- **Links:** lavish boards WW-D3 / WW-D4; cutscene PR (fm/whisker-cutscene-p0)
### 2026-07-20 - Roster locked (WW-D1): data-driven six cats + chapter select stub
- **Status:** accepted
- **Context:** Captain locked the cast on lavish board **WW-D1**. Systems needed a stable roster id space before cutscenes, chapters, and saves hang content off it.
- **Decision:** Six cats live as data in `src/content/cats.ts` (Luna/explorer, Shadow/stealth, Blaze/tank, Misty/agile puzzle, Willow/support, Dash/speed). Identity is data only: body tint + accent scarf band on the greybox placeholder; wardrobe is accessory tag strings until WW-D0 assets. Per-cat locomotion deltas stay within ~10% of the shared feel (Dash sprint 7.6, Blaze walk 4.2 / sprint 6.6). Active cat selection (`src/systems/catSelection.ts`) persists to `sessionStorage` - survives reload in a tab, never pretends to be a save system. Chapter table stub in `src/content/chapters.ts`: six biome chapters, one home cat each, only chapter-1 (forest / Luna) unlocked; chapter *titles* are working placeholders pending WW-D2 confirmation, while ids, biome keywords, homeCatId mapping, and the lock rule are the durable parts. No biome geometry.
- **Consequences:** `CatId` / `ChapterId` unions are the stable reference space for saves and content. Renaming a cat is a needs-decision; renaming a chapter title is a data edit. Real biome worlds, clay models, and cutscene hooks build on these ids, not on new tables.
- **Links:** roster PR (fm/whisker-roster-p0); lavish boards WW-D1, WW-D2
