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
