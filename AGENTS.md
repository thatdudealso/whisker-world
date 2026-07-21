# AGENTS.md - Whisker World

Guidance for coding agents and humans working in this repo.

## Product shape (non-negotiable)

- **3D only.** Three.js now; Rapier physics next. **Not** Orbital rails. **Not** 2D / Phaser.
- Semi-open cat adventure: chapter hubs with free movement, not linear-only rails.
- Cast is **LOCKED** (captain lavish board **WW-D1**): six cats as data in `src/content/cats.ts`, chapter table stub in `src/content/chapters.ts`. Do not rename cats without a needs-decision; roster table lives in [docs/GAME_DESIGN.md](docs/GAME_DESIGN.md).
- Art style is **LOCKED** (captain lavish board **WW-D0-art**): **hybrid A + B** - clay / soft toon 3D bodies & world, with the B **outfit & accessory** language (scarves, bags, explorer-kit props) for wardrobe. Bodies/world stay clay/toon; wardrobe reads from B. See [docs/ART_BIBLE.md](docs/ART_BIBLE.md). Greybox primitives are still fine until clay/toon assets are produced.

## Hosting (later - do not provision here)

- Public path: `https://5432wire.com/whisker-world` (Vite `base` will be `/whisker-world/` for prod builds).
- **Do not edit the 5432wire monorepo** from this scaffold work.
- **Cognito** = identity only (login / who-is-this). Game data lives elsewhere.
- Game data: separate Postgres database named **`whisker_world`**. Document only; do not provision AWS or create cloud resources from this repo without explicit captain approval.

## Secrets

- Never commit secrets, API keys, `.env` files with real values, or Cognito app secrets.
- Prefer `.env.example` with placeholder names only if env vars are needed later.

## Repo map

- `src/` - game code (core, input, entities, world, systems, cutscenes, ui, save, net, content)
- `assets/` - runtime art / audio (empty until art board)
- `docs/` - design and hosting docs (source of truth for product constraints)
- `services/api/` - future API surface (stub)
- `tests/` - vitest unit tests for pure game logic (e.g. locomotion model)

## Commands

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run build
```

## Maintaining this file

Update this file when durable project knowledge changes - stack defaults, hosting constraints, product shape, or agent-facing workflows.

Prefer pointers to authoritative files, commands, or docs over copying detail that can drift.

Skip edits for trivial one-off tasks that produced no knowledge useful to future sessions.

If this section is missing after a meaningful change, re-run `fm-ensure-agents-md` (or the equivalent firstmate helper) and keep this self-governance note.
