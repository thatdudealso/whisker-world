/**
 * Minimal UX chrome: a title chip and a controls hint strip.
 * No UI system, no framework - just two fixed-position DOM elements.
 */

const CHIP_STYLE = [
  "position:fixed",
  "color:#ddd",
  "font:12px/1.4 system-ui,sans-serif",
  "background:rgba(0,0,0,0.55)",
  "padding:6px 10px",
  "border-radius:8px",
  "pointer-events:none",
  "z-index:1",
  "white-space:nowrap",
].join(";");

export function createHud(root: HTMLElement): void {
  const title = document.createElement("div");
  title.style.cssText = CHIP_STYLE + ";top:8px;left:8px";
  title.textContent = "Whisker World · greybox locomotion slice";
  root.appendChild(title);

  const hint = document.createElement("div");
  hint.style.cssText =
    CHIP_STYLE + ";bottom:10px;left:50%;transform:translateX(-50%);font-size:13px";
  hint.textContent =
    "WASD / Arrows move · Space jump · Shift sprint · Q / E orbit camera · [ ] swap cat";
  root.appendChild(hint);
}
