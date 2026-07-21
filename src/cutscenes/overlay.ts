/**
 * DOM overlay presentation for the cutscene beat player.
 *
 * Skippable card style, matching the no-framework HUD approach: one fixed
 * full-screen layer whose background is a solid "plate" color per biomeTag,
 * a centered card with title / speaker / line / beat counter, and a Skip
 * button. Space / Enter / click advance; Esc (or Skip) jumps to finished.
 * The overlay tears itself down when the player finishes.
 */
import type { CutsceneBeat } from "../content/cutscenes/chapter1";
import { CutscenePlayer, type CutsceneHooks } from "./player";

/** Solid-color plates per WW-D4 setting tag (greybox stand-ins for boards). */
const PLATE_COLORS: Record<string, string> = {
  "glowing-forest": "#14322a",
  "neon-shadow": "#2b1136",
  "crew-den": "#33241a",
  rift: "#191347",
};
const PLATE_FALLBACK = "#20202a";

const CARD_STYLE = [
  "max-width:560px",
  "margin:0 24px",
  "padding:28px 32px",
  "border-radius:14px",
  "background:rgba(0,0,0,0.55)",
  "color:#eee",
  "font:16px/1.6 system-ui,sans-serif",
  "text-align:center",
].join(";");

export interface CutsceneOverlayOptions {
  /** Called exactly once when playback ends (completed or skipped). */
  onComplete: (skipped: boolean) => void;
}

/**
 * Build the overlay, start the player, and return it (mainly for tests /
 * dev hooks). The overlay owns its own DOM and listener lifecycle.
 */
export function playCutsceneOverlay(
  root: HTMLElement,
  beats: readonly CutsceneBeat[],
  options: CutsceneOverlayOptions,
): CutscenePlayer {
  const layer = document.createElement("div");
  layer.style.cssText = [
    "position:fixed",
    "inset:0",
    "z-index:10",
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "cursor:pointer",
    "transition:background 0.4s",
  ].join(";");

  const card = document.createElement("div");
  card.style.cssText = CARD_STYLE;

  const counter = document.createElement("div");
  counter.style.cssText = "font-size:12px;opacity:0.6;margin-bottom:12px;letter-spacing:0.1em";
  const title = document.createElement("h2");
  title.style.cssText = "margin:0 0 14px;font-size:22px;font-weight:600";
  const line = document.createElement("p");
  line.style.cssText = "margin:0;font-size:18px";
  const speaker = document.createElement("div");
  speaker.style.cssText = "margin-top:14px;font-size:13px;opacity:0.75";
  const hint = document.createElement("div");
  hint.style.cssText = "margin-top:22px;font-size:12px;opacity:0.5";
  hint.textContent = "Space / Enter / click to continue · Esc to skip";
  card.append(counter, title, line, speaker, hint);

  const skipButton = document.createElement("button");
  skipButton.type = "button";
  skipButton.textContent = "Skip";
  skipButton.style.cssText = [
    "position:absolute",
    "top:14px",
    "right:16px",
    "padding:6px 14px",
    "border:1px solid rgba(255,255,255,0.4)",
    "border-radius:8px",
    "background:rgba(0,0,0,0.35)",
    "color:#eee",
    "font:13px system-ui,sans-serif",
    "cursor:pointer",
  ].join(";");

  layer.append(card, skipButton);
  root.appendChild(layer);

  const hooks: CutsceneHooks = {
    onBeat: (beat, beatNumber, beatCount) => {
      layer.style.background = PLATE_COLORS[beat.biomeTag] ?? PLATE_FALLBACK;
      counter.textContent = `${beatNumber} / ${beatCount}`;
      title.textContent = beat.title;
      line.textContent = `“${beat.line}”`;
      speaker.textContent = `- ${beat.speaker}`;
    },
    onFinished: (skipped) => {
      window.removeEventListener("keydown", onKeyDown, true);
      layer.remove();
      options.onComplete(skipped);
    },
  };
  const player = new CutscenePlayer(beats, hooks);

  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      player.advance();
    } else if (event.key === "Escape") {
      event.preventDefault();
      player.skip();
    }
  };
  // Capture phase so cutscene keys win over any other window-level handlers.
  window.addEventListener("keydown", onKeyDown, true);

  layer.addEventListener("click", () => player.advance());
  skipButton.addEventListener("click", (event) => {
    event.stopPropagation();
    player.skip();
  });

  player.start();
  return player;
}
