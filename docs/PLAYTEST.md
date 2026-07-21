# Playtest Checklist (stub)

Use before claiming a build is playable. Expand as features land.

## Desktop

- [ ] `npm run dev` loads without console errors
- [ ] WebGL canvas visible (not black / blank without reason)
- [ ] WASD / arrows move the cat placeholder
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

### Chapter 1 - Whimsical Glowing Forest (greybox)

- [ ] Cat spawns on the glowing mint ring in the clearing, facing north (toward the overlook)
- [ ] Night mood reads: deep blue sky + fog, but the cat and nearby props stay clearly readable
- [ ] Overlook (north): three mossy steps climb with single jumps; top platform (2.7m) gives a view back over the clearing
- [ ] Rift shard (east): violet glowing shard over a ground crack; visible from the clearing through the rock-ring gap
- [ ] Bioluminescent mushrooms glow teal; the low one near the overlook path is hoppable onto
- [ ] Path rocks ring the clearing; gaps lead north / east / south; low rocks hoppable, tall ones block
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
