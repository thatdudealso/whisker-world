/**
 * Roster + chapter select stub UI. Same ugly-greybox DOM-chip language as
 * hud.ts: no framework, fixed-position elements only.
 *
 * - Top right: active cat chip (name + role), live-updates on swap.
 * - Keys: `[` / `]` cycle the roster, `1`-`6` jump straight to a cat.
 * - Below the title: one chip per chapter; locked ones are dimmed and
 *   clicking them shows a "coming soon" toast (no biome geometry yet).
 */
import { CATS, type CatDefinition } from "../content/cats";
import { canEnterChapter, CHAPTERS } from "../content/chapters";
import type { CatSelection } from "../systems/catSelection";

const CHIP_STYLE = [
  "position:fixed",
  "color:#ddd",
  "font:12px/1.4 system-ui,sans-serif",
  "background:rgba(0,0,0,0.55)",
  "padding:6px 10px",
  "border-radius:8px",
  "z-index:1",
  "white-space:nowrap",
].join(";");

const TOAST_MS = 1600;

function catLabel(cat: CatDefinition): string {
  return `${cat.name} · ${cat.role}`;
}

export function createRosterHud(root: HTMLElement, selection: CatSelection): void {
  // --- Active cat chip.
  const catChip = document.createElement("div");
  catChip.style.cssText = CHIP_STYLE + ";top:8px;right:8px;pointer-events:none";
  const renderCat = (cat: CatDefinition): void => {
    catChip.textContent = `${catLabel(cat)} · [ ] or 1-6 to swap`;
    catChip.style.borderLeft = `4px solid ${cat.accentColor}`;
  };
  renderCat(selection.active);
  selection.subscribe(renderCat);
  root.appendChild(catChip);

  // --- Chapter select stub: one row of chips under the title chip.
  const chapterRow = document.createElement("div");
  chapterRow.style.cssText = CHIP_STYLE + ";top:44px;left:8px;pointer-events:auto";
  for (const chapter of CHAPTERS) {
    const chip = document.createElement("span");
    const enterable = canEnterChapter(chapter);
    chip.textContent = enterable ? `▶ ${chapter.title}` : `🔒 ${chapter.title}`;
    chip.style.cssText = enterable
      ? "cursor:default;margin-right:10px"
      : "cursor:pointer;opacity:0.45;margin-right:10px";
    if (!enterable) {
      chip.addEventListener("click", () => showToast(root, `${chapter.title} - coming soon`));
    }
    chapterRow.appendChild(chip);
  }
  root.appendChild(chapterRow);

  // --- Roster keys. Separate listener from KeyboardInput on purpose: these
  // are edge-triggered UI events, not per-frame movement state.
  window.addEventListener("keydown", (event) => {
    if (event.key === "[") {
      selection.cycle(-1);
      return;
    }
    if (event.key === "]") {
      selection.cycle(1);
      return;
    }
    const digit = Number.parseInt(event.key, 10);
    if (digit >= 1 && digit <= CATS.length) {
      selection.select(CATS[digit - 1].id);
    }
  });
}

let toast: HTMLElement | null = null;
let toastTimer: ReturnType<typeof setTimeout> | undefined;

function showToast(root: HTMLElement, message: string): void {
  if (!toast) {
    toast = document.createElement("div");
    toast.style.cssText =
      CHIP_STYLE + ";bottom:44px;left:50%;transform:translateX(-50%);pointer-events:none";
    root.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.display = "block";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    if (toast) {
      toast.style.display = "none";
    }
  }, TOAST_MS);
}
