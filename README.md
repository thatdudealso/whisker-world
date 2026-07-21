# Whisker World

A 3D semi-open cat adventure: six cats, a secret syndicate, and chapter-scale maps you explore at your own pace - not on rails, not 2D. Built with Three.js (Rapier physics next), intended to ship later at [5432wire.com/whisker-world](https://5432wire.com/whisker-world).

## Play (future)

- **Production path:** `https://5432wire.com/whisker-world`
- Local greybox only for now (Phase 0 scaffold).

## Dev setup

```bash
npm install
npm run dev      # http://localhost:5173
npm run typecheck
npm test
npm run build
npm run preview
```

Requires Node 20+ (CI uses 22).

## Docs

| Doc | Purpose |
|-----|---------|
| [docs/GAME_DESIGN.md](docs/GAME_DESIGN.md) | Six cats, syndicate, semi-open chapters |
| [docs/TECH.md](docs/TECH.md) | Stack, input, path base, quality tiers |
| [docs/HOSTING_5432WIRE.md](docs/HOSTING_5432WIRE.md) | Path host, Cognito identity, DB isolation |
| [docs/STORY_SYNDICATE.md](docs/STORY_SYNDICATE.md) | Rift frame + villain landing prompts |
| [docs/DESIGN_DECISIONS.md](docs/DESIGN_DECISIONS.md) | Decision log |
| [docs/ART_BIBLE.md](docs/ART_BIBLE.md) | Art style (LOCKED: clay/soft toon + outfit/accessory hybrid) |
| [docs/CONTENT_PIPELINE.md](docs/CONTENT_PIPELINE.md) | Content authoring pipeline stub |
| [docs/PLAYTEST.md](docs/PLAYTEST.md) | Desktop / mobile / motion checklist |
| [AGENTS.md](AGENTS.md) | Agent / contributor constraints |

## License

TBD.
