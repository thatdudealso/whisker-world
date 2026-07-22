# Playtest Checklist (stub)

Use before claiming a build is playable. Expand as features land.

## Desktop

- [ ] `npm run dev` loads without console errors
- [ ] WebGL canvas visible (not black / blank without reason)
- [ ] WASD / arrows move the selected cat
- [ ] Camera follows without exploding FOV / NaN positions
- [ ] Window resize keeps aspect ratio
- [ ] `npm run build` && `npm run preview` still playable

### Locomotion slice

- [ ] Cat accelerates smoothly (~0.2s to full speed), decelerates without ice-skating
- [ ] Cat visibly faces its travel direction (nose leads)
- [ ] Shift sprint is noticeably faster than walk
- [ ] Space jumps once; no double-jump mid-air; apex reads clearly
- [ ] Cat lands back on the ground plane, never sinks through it
- [ ] World bounds stop the cat (radius 19) without teleporting or jitter
- [ ] Blocks push the cat out sideways; low blocks are jumpable onto
- [ ] Camera lags softly behind movement; Q / E orbit works; no nausea snap
- [ ] Controls hint strip visible at the bottom of the screen

### Chapter 1 - Whimsical Whisperleaf Glowing Forest

- [ ] Cat spawns on the glowing mint ring in the clearing, facing north (toward the overlook), with a readable cat silhouette, scarf, tail, ears, eyes, legs, and roster color
- [ ] Night mood reads: deep blue sky + fog, with soft rounded clay-toon foliage, moss forms, and a readable cat and landmark silhouette
- [ ] Overlook (north): three mossy steps climb with single jumps; top platform (2.7m) gives a view back over the clearing
- [ ] Rift shard (east): violet glowing shard over a ground crack; visible from the clearing through the rock-ring gap
- [ ] Bioluminescent mushrooms glow teal; the low one near the overlook path is hoppable onto
- [ ] Organic path stones ring the clearing; gaps lead north / east / south; low rocks hoppable, tall ones block
- [ ] Starlight trail dots lead from the clearing toward the overlook and the rift
- [ ] Rim tree trunks fade into fog; no visible hard world edge from inside bounds
- [ ] Walking the full bounds circle: no prop clips the cat through walls, frame rate stays smooth on a laptop

### Chapter 1 cutscene

- [ ] First visit (clear `ww_ch1_intro_seen` in localStorage): intro cards autoplay before gameplay
- [ ] Beat counter reads 1 / 6 through 6 / 6 in WW-D4 order; plate color shifts per setting
- [ ] Space / Enter / click each advance exactly one card
- [ ] Esc and the Skip button both jump straight to gameplay
- [ ] WASD / Space do nothing to the cat while cards are up; no queued jump fires after
- [ ] After finishing or skipping, reload does NOT replay the intro
- [ ] `?cutscene=1` replays the intro even after it was seen
- [ ] Movement, sprint, jump, and camera orbit all work normally once cards close
### Title, cat select, and Chapter 1 loop

- [ ] Title screen names Whisker World, Chapter 1, Whisperleaf Forest, and the adventure premise
- [ ] Cat select shows Luna, Shadow, Blaze, Misty, Willow, and Dash with readable identity cards
- [ ] Entering the forest starts the six-beat intro; Skip and Esc both reach gameplay without a queued movement or jump
- [ ] HUD shows the active cat, controls, and three objective steps
- [ ] Reaching the overlook, Rift shard, then clearing updates objective feedback and world beacons in order
- [ ] Completion screen clearly says Chapter 1 is complete and offers replay or return to title

### Roster / cat swap

- [ ] Game starts as Luna (calico tint, gold scarf band), name + role chip top right
- [ ] `]` / `[` cycle the six cats in roster order and wrap at both ends
- [ ] `1`-`6` jump straight to each cat; body tint and scarf band visibly change
- [ ] Swapping mid-run keeps position and momentum (no teleport, no camera snap)
- [ ] Dash sprints visibly faster than Luna; Blaze feels a touch slower
- [ ] Reloading the tab keeps the last picked cat (sessionStorage)
- [ ] On a fresh profile, chapter chips show under the title with Whisperleaf Forest as the only unlocked chapter; after Chapter 1 completion, Moonlit Rooftops appears as the persisted next unlock while later chapters remain hidden
- [ ] Clicking a locked chapter shows a "coming soon" toast, nothing else happens

## Mobile (later)

- [ ] Touch controls present or clear "desktop only" message
- [ ] Readable UI at phone width
- [ ] Performance acceptable on mid-tier device (quality tier)
- [ ] No hover-only critical actions

## Motion / sensors (later, opt-in)

- [ ] Device orientation disabled by default
- [ ] Explicit permission / toggle if used
- [ ] Graceful fallback when sensors missing or denied
- [ ] No nausea-inducing camera coupling without settings

## Accessibility (later)

- [ ] Keyboard-only path for core locomotion
- [ ] Reduced motion respect where applicable
- [ ] Contrast for HUD text
