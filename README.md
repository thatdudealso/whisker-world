# Whisker World

Six cats. One secret syndicate. A strange tear in the night.

Whisker World is a 3D semi-open cat adventure about prowling through chapter-scale worlds, finding your own way through them, and getting pulled deeper into the Rift. It is being built in Three.js as a free-moving adventure, not a rail tour and not a 2D game.

## What kind of world is this?

Each chapter is a region with a hub, side routes, landmarks, and a main objective chain. You can wander, climb, backtrack, and choose which trail to follow. Progress may open new routes, but the core fantasy is room to explore rather than a fixed sequence of camera beats.

Six distinct cats are the structural heart of the adventure. Their roles and kits will give the roster different ways to read a space and solve a problem. Around them sits the syndicate: a shared social machine of jobs, debts, safehouses, rival cells, and loyalties that are never quite as simple as hero or villain.

The Rift is the thread running underneath it all. Something has torn between ordinary streets and a stranger layer of reality. The cats can feel it in whiskers and dreams, while the syndicate may exploit it, police it, or both.

## The feel

Bodies, creatures, props, and environments are headed toward a soft clay-toon look: rounded silhouettes, gentle edges, matte stylized materials, and readable color. Characters become themselves through what they wear and carry - scarves, bags, and explorer-kit accessories that sit cleanly on those clay forms.

For the full visual rules, palette notes, and placeholder boundaries, read the [Art Bible](docs/ART_BIBLE.md).

## Where the game is now

This is Phase 0: a working greybox slice, not a finished game. The current build gives you a small piece of Chapter 1, the Whimsical Glowing Forest, rendered from Three.js primitives.

Today you can:

- Explore a night forest with a safe clearing, glowing mushrooms, path rocks, a terraced overlook, and a violet Rift shard.
- Move the placeholder cat with WASD or the arrow keys.
- Hold Shift to sprint, press Space to jump, and use Q / E to orbit the third-person camera.
- Feel the current locomotion model: acceleration, deceleration, grounded jumping, bounds, and simple block collisions.

The shapes are intentionally greybox. Clay/toon assets, the complete roster, combat, saves, multiplayer, and final story are still in progress. Rapier physics is planned next; it is not part of this slice.

The near-term design direction is to grow this forest into a chapter with a hub, routes, and Rift-touched discoveries, then carry the same free-movement language into the wider adventure. The [game design brief](docs/GAME_DESIGN.md) is the source of truth as that work evolves.

## Run the greybox locally

Requirements: Node 20 or newer. Continuous integration runs on Node 22.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`. The current playable slice is desktop-first.

Useful checks:

```bash
npm run typecheck
npm test
npm run build
npm run preview
```

`npm test` runs the pure game-logic tests with Vitest. `npm run build` typechecks and creates the Vite production build. The eventual hosted path is planned for [5432wire.com/whisker-world](https://5432wire.com/whisker-world); it is not a live game destination yet.

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
| [GAME_DESIGN.md](docs/GAME_DESIGN.md) | The adventure's six-cat structure, syndicate, chapter shape, and Phase 0 boundaries. |
| [ART_BIBLE.md](docs/ART_BIBLE.md) | The locked clay/soft toon world and outfit/accessory language. |
| [STORY_SYNDICATE.md](docs/STORY_SYNDICATE.md) | The Rift frame, syndicate context, and story questions still waiting for canon. |
| [TECH.md](docs/TECH.md) | Three.js, input, locomotion, camera, chapter conventions, and the future path base. |
| [PLAYTEST.md](docs/PLAYTEST.md) | The hands-on checklist for the forest, controls, camera, and later device work. |
| [HOSTING_5432WIRE.md](docs/HOSTING_5432WIRE.md) | Future hosting boundaries, identity, and game-data separation. |
| [DESIGN_DECISIONS.md](docs/DESIGN_DECISIONS.md) | The decisions that keep the game's shape and visual direction coherent. |
| [CONTENT_PIPELINE.md](docs/CONTENT_PIPELINE.md) | The early content-authoring notes for when the world grows beyond greybox. |

## Contributing

Keep the world 3D, chapter-scale, and free to explore. Keep greybox work readable and make the clay/toon direction easy to replace with finished art. Before changing the game's shape, check the design and art documents above.

Contributor and agent conventions live in [AGENTS.md](AGENTS.md), including the commands used to validate a change. Please do not add secrets, real environment values, cloud resources, or changes to the separate 5432wire monorepo from this project.

## License

TBD.
