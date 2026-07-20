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
