# Whisker World

Six cats. One secret syndicate. A strange tear in the night.

Whisker World is a 3D semi-open cat adventure about prowling through chapter-scale worlds, finding your own way through them, and getting pulled deeper into the Rift. It is being built in Three.js as a free-moving adventure, not a rail tour and not a 2D game.

## What kind of world is this?

The planned chapter design is a region with a hub, side routes, landmarks, and a main objective chain. The finished game will let you wander, climb, backtrack, and choose which trail to follow, with progress opening new routes. This Phase 1 slice demonstrates that free-movement language through one compact Chapter 1 route.

Six distinct cats are the structural heart of the adventure. Their roles and kits will give the roster different ways to read a space and solve a problem. Around them sits the syndicate: a shared social machine of jobs, debts, safehouses, rival cells, and loyalties that are never quite as simple as hero or villain.

The Rift is the thread running underneath it all. Something has torn between ordinary streets and a stranger layer of reality. The cats can feel it in whiskers and dreams, while the syndicate may exploit it, police it, or both.

## The feel

Bodies, creatures, props, and environments are locked to a soft clay-toon look: rounded silhouettes, gentle edges, matte stylized materials, and readable color. The outfit and accessory language is locked too, so characters become themselves through what they wear and carry - scarves, bags, and explorer-kit accessories that sit cleanly on those clay forms.

For the full visual rules, palette notes, and placeholder boundaries, read the [Art Bible](docs/ART_BIBLE.md).

## Where the game is now

This repository now contains the Phase 1 Chapter 1 vertical slice: a short, complete game loop in the Whimsical Whisperleaf Glowing Forest. It is intentionally scoped to one proud chapter rather than pretending the full six-chapter RPG already exists.

Today you can:

- Start from a title screen, choose one of the six locked cats, and see each cat's role, colors, silhouette, and accessory identity.
- Watch or skip the six-beat Chapter 1 intro while the game gates movement safely.
- Explore a warm night forest built from hand-authored Three.js clay-toon geometry: layered trees, rounded moss forms, glowing mushrooms, starlight trails, a terraced overlook, and the Rift shard.
- Follow three explicit objectives with world beacons and HUD feedback: reach the overlook, investigate the shard, and return to the clearing.
- Finish with a clear Chapter 1 complete screen, then replay the chapter or return to the title.
- Move with WASD or the arrow keys, hold Shift to sprint, press Space to jump, use Q / E to orbit the camera, and use [ / ] or 1-6 to swap cats during play.

The slice is still not the full game: Chapters 2-6 geometry, combat, saves, multiplayer, cloud identity, and Rapier physics remain out of scope. The roster, art direction, Chapter 1 biome landmarks, and intro beat order are locked by the design documents.

The [game design brief](docs/GAME_DESIGN.md) and [playtest checklist](docs/PLAYTEST.md) are the source of truth as the adventure grows.

## Run the slice locally

Requirements: Node 20 or newer. Continuous integration runs on Node 22.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`. The current slice is desktop-first.

Useful checks:

```bash
npm run typecheck
npm test
npm run build
npm run preview
```

`npm test` runs the pure game-logic tests with Vitest. `npm run build` typechecks and creates the Vite production build, and `npm run preview` serves that production build locally. The eventual hosted path is planned for 5432wire.com/whisker-world; no hosting or cloud resources are provisioned here.

## Find your way around

| Path | What lives there |
| --- | --- |
| [`src/`](src/) | The game itself: input, cat movement, camera, UI, chapter builders, and runtime bootstrap. |
| [`src/world/chapters/`](src/world/chapters/) | Chapter 1's forest layout and Three.js scene builder. |
| [`assets/`](assets/) | Runtime art and audio when production assets arrive. |
| [`docs/`](docs/) | Design, technical constraints, story framing, hosting notes, and playtest guidance. |
| [`tests/`](tests/) | Fast Vitest coverage for movement, math, and forest layout rules. |
| [`services/api/`](services/api/) | A reserved stub for the future API surface. |

## Read the map before you build

| Document | Why open it |
| --- | --- |
| [GAME_DESIGN.md](docs/GAME_DESIGN.md) | The adventure's six-cat structure, syndicate, chapter shape, and current slice boundaries. |
| [ART_BIBLE.md](docs/ART_BIBLE.md) | The locked clay/soft toon world and outfit/accessory language. |
| [STORY_SYNDICATE.md](docs/STORY_SYNDICATE.md) | The Rift frame, syndicate context, and story questions still waiting for canon. |
| [TECH.md](docs/TECH.md) | Three.js, input, locomotion, camera, chapter conventions, and the future path base. |
| [PLAYTEST.md](docs/PLAYTEST.md) | The hands-on checklist for the forest, controls, camera, and later device work. |
| [HOSTING_5432WIRE.md](docs/HOSTING_5432WIRE.md) | Future hosting boundaries, identity, and game-data separation. |
| [DESIGN_DECISIONS.md](docs/DESIGN_DECISIONS.md) | The decisions that keep the game's shape and visual direction coherent. |
| [CONTENT_PIPELINE.md](docs/CONTENT_PIPELINE.md) | The early content-authoring notes for when the world grows beyond greybox. |

## Contributing

Keep the world 3D, chapter-scale, and free to explore. Keep code-built clay/toon work readable and easy to replace with finished art. Before changing the game's shape, check the design and art documents above.

Contributor and agent conventions live in [AGENTS.md](AGENTS.md), including the commands used to validate a change. Please do not add secrets, real environment values, cloud resources, or changes to the separate 5432wire monorepo from this project.

## License

TBD.
