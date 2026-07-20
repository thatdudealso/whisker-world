# Playtest Checklist (stub)

Use before claiming a build is playable. Expand as features land.

## Desktop

- [ ] `npm run dev` loads without console errors
- [ ] WebGL canvas visible (not black / blank without reason)
- [ ] WASD / arrows move the cat placeholder
- [ ] Camera follows without exploding FOV / NaN positions
- [ ] Window resize keeps aspect ratio
- [ ] `npm run build` && `npm run preview` still playable

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
