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
