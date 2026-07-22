import { CATS, type CatDefinition, type CatId } from "../content/cats";
import { getChapter, type ChapterId } from "../content/chapters";
import type { GameStage } from "../systems/gameFlow";
import { CHAPTER1_OBJECTIVES, type ObjectiveState } from "../systems/objectives";
import type { CatSelection } from "../systems/catSelection";

export interface GameUiCallbacks {
  onStart: () => void;
  onContinue: () => void;
  onReplay: () => void;
  onReturnToTitle: () => void;
  onSelectCat: (id: CatId) => void;
}

const STYLE_ID = "ww-ui-style";

const CSS = `
  :root { --ww-ink: #f8f1df; --ww-muted: #b8c7bd; --ww-panel: rgba(17, 34, 37, .82); --ww-line: rgba(222, 240, 216, .18); --ww-gold: #f2c879; }
  .ww-ui, .ww-ui * { box-sizing: border-box; }
  .ww-ui { position: fixed; inset: 0; z-index: 4; color: var(--ww-ink); font-family: "Avenir Next", "Trebuchet MS", system-ui, sans-serif; pointer-events: none; }
  .ww-screen { position: absolute; inset: 0; display: none; pointer-events: auto; }
  .ww-screen.is-visible { display: flex; }
  .ww-screen--title, .ww-screen--select { align-items: center; justify-content: center; overflow: auto; padding: 28px; background: linear-gradient(120deg, rgba(10, 26, 33, .94), rgba(24, 47, 43, .72) 48%, rgba(29, 21, 47, .72)); }
  .ww-screen--title:before, .ww-screen--select:before { content: ""; position: absolute; inset: 5% 8%; border: 1px solid rgba(242, 200, 121, .18); border-radius: 38px; pointer-events: none; }
  .ww-title-card { position: relative; width: min(670px, 100%); padding: clamp(34px, 7vw, 76px); border: 1px solid var(--ww-line); border-radius: 30px; background: linear-gradient(145deg, rgba(28, 58, 56, .86), rgba(23, 30, 49, .9)); box-shadow: 0 24px 100px rgba(0, 0, 0, .38), inset 0 1px rgba(255, 255, 255, .12); }
  .ww-kicker { margin: 0 0 17px; color: #aee2bc; font-size: 12px; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; }
  .ww-logo { margin: 0; color: #fff5da; font-size: clamp(48px, 9vw, 94px); line-height: .92; letter-spacing: -.055em; text-shadow: 0 5px 0 rgba(105, 63, 57, .45), 0 12px 30px rgba(0, 0, 0, .22); }
  .ww-tagline { max-width: 460px; margin: 26px 0 0; color: #d0dfd2; font-size: clamp(16px, 2.1vw, 21px); line-height: 1.45; }
  .ww-title-meta { display: flex; flex-wrap: wrap; gap: 10px; margin: 30px 0 34px; }
  .ww-pill { padding: 8px 12px; border: 1px solid rgba(183, 222, 190, .2); border-radius: 999px; color: #cde9cf; background: rgba(93, 153, 110, .13); font-size: 12px; letter-spacing: .05em; }
  .ww-button { appearance: none; border: 0; border-radius: 999px; padding: 13px 22px; color: #25372e; background: linear-gradient(135deg, #f7d788, #d8efa5); box-shadow: 0 8px 18px rgba(0, 0, 0, .2), inset 0 1px rgba(255, 255, 255, .7); cursor: pointer; font: 700 14px/1 "Avenir Next", "Trebuchet MS", system-ui, sans-serif; letter-spacing: .04em; transition: transform .18s ease, filter .18s ease; }
  .ww-button:hover { filter: brightness(1.08); transform: translateY(-2px); }
  .ww-button:focus-visible, .ww-cat-card:focus-visible { outline: 3px solid #fff0a3; outline-offset: 3px; }
  .ww-button--quiet { color: #d6e2d2; background: rgba(255, 255, 255, .08); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .14); }
  .ww-select-wrap { position: relative; width: min(980px, 100%); padding: clamp(24px, 4vw, 42px); border: 1px solid var(--ww-line); border-radius: 30px; background: rgba(15, 31, 35, .9); box-shadow: 0 24px 100px rgba(0, 0, 0, .34); }
  .ww-select-head { display: flex; align-items: end; justify-content: space-between; gap: 18px; margin-bottom: 24px; }
  .ww-select-head h2 { margin: 0; color: #fff5da; font-size: clamp(28px, 4vw, 45px); letter-spacing: -.035em; }
  .ww-select-head p { max-width: 310px; margin: 0; color: var(--ww-muted); font-size: 13px; line-height: 1.45; text-align: right; }
  .ww-cat-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
  .ww-cat-card { display: flex; min-height: 122px; align-items: center; gap: 13px; padding: 14px; border: 1px solid rgba(220, 239, 214, .14); border-left: 4px solid var(--cat-accent); border-radius: 17px; color: var(--ww-ink); background: rgba(255, 255, 255, .045); cursor: pointer; text-align: left; transition: transform .18s ease, background .18s ease, border-color .18s ease; }
  .ww-cat-card:hover { transform: translateY(-3px); background: rgba(255, 255, 255, .09); }
  .ww-cat-card.is-selected { border-color: var(--cat-accent); background: linear-gradient(135deg, rgba(255, 255, 255, .13), rgba(157, 220, 185, .08)); box-shadow: 0 0 0 1px rgba(255, 255, 255, .07), 0 10px 24px rgba(0, 0, 0, .16); }
  .ww-cat-mark { position: relative; flex: 0 0 58px; width: 58px; height: 72px; }
  .ww-cat-mark__body { position: absolute; left: 13px; bottom: 7px; width: 35px; height: 35px; border-radius: 49% 49% 44% 44%; background: var(--cat-body); box-shadow: 0 7px 0 rgba(0, 0, 0, .12); }
  .ww-cat-mark__head { position: absolute; left: 10px; top: 12px; width: 39px; height: 35px; border-radius: 48%; background: var(--cat-body); }
  .ww-cat-mark__head:before, .ww-cat-mark__head:after { content: ""; position: absolute; top: -10px; width: 16px; height: 18px; background: var(--cat-body); clip-path: polygon(0 100%, 50% 0, 100% 100%); }
  .ww-cat-mark__head:before { left: 2px; } .ww-cat-mark__head:after { right: 2px; }
  .ww-cat-mark__tail { position: absolute; right: 1px; bottom: 13px; width: 22px; height: 34px; border: 6px solid var(--cat-body); border-left-color: transparent; border-bottom-color: transparent; border-radius: 50%; transform: rotate(22deg); }
  .ww-cat-mark__scarf { position: absolute; left: 11px; top: 42px; width: 37px; height: 7px; border-radius: 7px; background: var(--cat-accent); }
  .ww-cat-card__copy { min-width: 0; } .ww-cat-card__name { display: block; margin-bottom: 3px; font-size: 16px; font-weight: 700; } .ww-cat-card__role { display: block; margin-bottom: 6px; color: var(--cat-accent); font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; } .ww-cat-card__blurb { display: block; color: #b8c7bd; font-size: 11px; line-height: 1.3; }
  .ww-select-actions { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-top: 24px; } .ww-select-note { color: #9db5aa; font-size: 12px; }
  .ww-hud { position: absolute; inset: 0; display: none; pointer-events: none; } .ww-hud.is-visible { display: block; }
  .ww-brand { position: absolute; top: 20px; left: 24px; color: #fff5da; font-size: 16px; font-weight: 800; letter-spacing: .08em; text-shadow: 0 2px 8px rgba(0, 0, 0, .35); } .ww-brand span { color: #aee2bc; font-size: 10px; font-weight: 600; letter-spacing: .18em; }
  .ww-active-cat { position: absolute; top: 18px; right: 22px; display: flex; align-items: center; gap: 10px; padding: 9px 13px; border: 1px solid rgba(227, 241, 213, .19); border-radius: 14px; background: rgba(14, 30, 31, .72); box-shadow: 0 8px 20px rgba(0, 0, 0, .16); } .ww-active-cat__dot { width: 10px; height: 10px; border-radius: 50%; background: var(--cat-accent); box-shadow: 0 0 12px var(--cat-accent); } .ww-active-cat strong { display: block; font-size: 13px; } .ww-active-cat small { display: block; margin-top: 2px; color: #b8c7bd; font-size: 10px; letter-spacing: .08em; text-transform: uppercase; }
  .ww-objectives { position: absolute; top: 78px; left: 22px; width: min(290px, calc(100vw - 44px)); padding: 14px 15px; border: 1px solid rgba(227, 241, 213, .16); border-radius: 16px; background: rgba(14, 30, 31, .72); box-shadow: 0 8px 20px rgba(0, 0, 0, .15); } .ww-objectives__eyebrow { margin-bottom: 8px; color: #aee2bc; font-size: 10px; font-weight: 800; letter-spacing: .18em; text-transform: uppercase; } .ww-objective { display: flex; gap: 9px; align-items: start; padding: 7px 0; color: #b8c7bd; font-size: 12px; line-height: 1.3; } .ww-objective + .ww-objective { border-top: 1px solid rgba(255, 255, 255, .08); } .ww-objective__dot { flex: 0 0 13px; width: 13px; height: 13px; margin-top: 1px; border: 1px solid #819891; border-radius: 50%; } .ww-objective.is-active { color: #fff5da; font-weight: 700; } .ww-objective.is-active .ww-objective__dot { border-color: var(--ww-gold); background: var(--ww-gold); box-shadow: 0 0 10px rgba(242, 200, 121, .7); } .ww-objective.is-done { color: #94cba4; text-decoration: line-through; text-decoration-color: rgba(148, 203, 164, .6); } .ww-objective.is-done .ww-objective__dot { border-color: #94cba4; background: #94cba4; }
  .ww-controls { position: absolute; bottom: 18px; left: 50%; transform: translateX(-50%); padding: 9px 14px; border: 1px solid rgba(227, 241, 213, .15); border-radius: 999px; color: #c6d4c8; background: rgba(14, 30, 31, .72); font-size: 11px; white-space: nowrap; box-shadow: 0 8px 18px rgba(0, 0, 0, .15); } .ww-controls b { color: #fff5da; }
  .ww-complete { align-items: center; justify-content: center; padding: 24px; background: linear-gradient(135deg, rgba(9, 27, 31, .9), rgba(54, 43, 58, .88)); } .ww-complete-card { width: min(570px, 100%); padding: 44px; border: 1px solid rgba(242, 200, 121, .35); border-radius: 27px; background: rgba(20, 38, 40, .91); box-shadow: 0 24px 100px rgba(0, 0, 0, .4); text-align: center; } .ww-complete-card h2 { margin: 0; color: #fff3c8; font-size: clamp(34px, 6vw, 58px); letter-spacing: -.05em; } .ww-complete-card p { margin: 16px auto 28px; color: #c4d8c8; line-height: 1.5; } .ww-complete-mark { width: 72px; height: 72px; margin: 0 auto 20px; border: 2px solid #f2c879; border-radius: 50%; color: #f2c879; font-size: 38px; line-height: 68px; box-shadow: 0 0 35px rgba(242, 200, 121, .26); } .ww-complete-actions { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; }
  @media (max-width: 720px) { .ww-cat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .ww-select-head { display: block; } .ww-select-head p { margin-top: 8px; text-align: left; } .ww-title-card { padding: 36px 28px; } }
  @media (max-width: 480px) { .ww-cat-grid { grid-template-columns: 1fr; } .ww-cat-card { min-height: 94px; } .ww-controls { bottom: 10px; font-size: 10px; } .ww-objectives { top: 70px; } }
`;

function ensureStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
}

function catMark(): string {
  return `<span class="ww-cat-mark" aria-hidden="true"><span class="ww-cat-mark__tail"></span><span class="ww-cat-mark__body"></span><span class="ww-cat-mark__head"></span><span class="ww-cat-mark__scarf"></span></span>`;
}

export class GameUi {
  private readonly root: HTMLElement;
  private readonly screens = new Map<GameStage, HTMLElement>();
  private readonly hud: HTMLElement;
  private readonly activeCat: HTMLElement;
  private readonly objectives: HTMLElement;
  private readonly completeUnlock: HTMLElement;
  private readonly callbacks: GameUiCallbacks;
  private stage: GameStage = "title";

  constructor(root: HTMLElement, selection: CatSelection, callbacks: GameUiCallbacks) {
    ensureStyles();
    this.callbacks = callbacks;
    this.root = document.createElement("div");
    this.root.className = "ww-ui";
    root.appendChild(this.root);

    this.screens.set("title", this.createTitleScreen());
    this.screens.set("select", this.createSelectScreen(selection));
    this.screens.set("intro", this.createEmptyScreen("intro"));
    this.screens.set("play", this.createEmptyScreen("play"));
    const completeScreen = this.createCompleteScreen();
    this.screens.set("complete", completeScreen);
    this.completeUnlock = completeScreen.querySelector(".ww-complete-unlock") as HTMLElement;

    this.hud = document.createElement("div");
    this.hud.className = "ww-hud";
    this.hud.innerHTML = `<div class="ww-brand">WHISKER WORLD <span>CHAPTER 1</span></div><div class="ww-active-cat"><span class="ww-active-cat__dot"></span><div><strong></strong><small></small></div></div><div class="ww-objectives"></div><div class="ww-controls"><b>WASD</b> move &nbsp; <b>Shift</b> sprint &nbsp; <b>Space</b> jump &nbsp; <b>Q / E</b> orbit</div>`;
    this.root.appendChild(this.hud);
    this.activeCat = this.hud.querySelector(".ww-active-cat") as HTMLElement;
    this.objectives = this.hud.querySelector(".ww-objectives") as HTMLElement;
    this.setActiveCat(selection.active);
    selection.subscribe((cat) => this.setActiveCat(cat));
    this.setStage("title");
  }

  setStage(stage: GameStage): void {
    this.stage = stage;
    for (const [key, screen] of this.screens) screen.classList.toggle("is-visible", key === stage);
    this.hud.classList.toggle("is-visible", stage === "play");
  }

  setActiveCat(cat: CatDefinition): void {
    this.activeCat.style.setProperty("--cat-accent", cat.accentColor);
    const dot = this.activeCat.querySelector(".ww-active-cat__dot") as HTMLElement;
    dot.style.background = cat.accentColor;
    dot.style.boxShadow = `0 0 12px ${cat.accentColor}`;
    (this.activeCat.querySelector("strong") as HTMLElement).textContent = cat.name;
    (this.activeCat.querySelector("small") as HTMLElement).textContent = cat.role;
  }

  /** Update the complete-screen copy once a chapter completes and unlocks the next one (or not). */
  setUnlockedChapter(chapterId: ChapterId | null): void {
    this.completeUnlock.textContent = chapterId
      ? `${getChapter(chapterId).title} just unlocked - more of the Rift is opening up.`
      : "";
  }

  setObjectives(state: ObjectiveState): void {
    this.objectives.innerHTML = `<div class="ww-objectives__eyebrow">Whisperleaf trail</div>${CHAPTER1_OBJECTIVES.map((objective) => {
      const done = state.completed.includes(objective.id);
      const active = !state.complete && objective.id === state.active;
      return `<div class="ww-objective${active ? " is-active" : ""}${done ? " is-done" : ""}"><span class="ww-objective__dot"></span><span>${objective.title}</span></div>`;
    }).join("")}`;
  }

  private createEmptyScreen(stage: GameStage): HTMLElement {
    const screen = document.createElement("section");
    screen.className = `ww-screen ww-screen--${stage}`;
    this.root.appendChild(screen);
    return screen;
  }

  private createTitleScreen(): HTMLElement {
    const screen = document.createElement("section");
    screen.className = "ww-screen ww-screen--title";
    screen.innerHTML = `<div class="ww-title-card"><p class="ww-kicker">A soft-toon adventure in the Rift</p><h1 class="ww-logo">Whisker<br />World</h1><p class="ww-tagline">Six cats. One secret syndicate. A strange tear in the night.</p><div class="ww-title-meta"><span class="ww-pill">CHAPTER 1</span><span class="ww-pill">WHISPERLEAF FOREST</span><span class="ww-pill">3D ADVENTURE</span></div><button class="ww-button" type="button">Start the adventure</button></div>`;
    screen.querySelector("button")?.addEventListener("click", this.callbacks.onStart);
    this.root.appendChild(screen);
    return screen;
  }

  private createSelectScreen(selection: CatSelection): HTMLElement {
    const screen = document.createElement("section");
    screen.className = "ww-screen ww-screen--select";
    screen.innerHTML = `<div class="ww-select-wrap"><div class="ww-select-head"><div><p class="ww-kicker">Chapter 1 / Whisperleaf Forest</p><h2>Choose your cat</h2></div><p>Every explorer carries a different story into the glowing woods. Pick a companion, then follow Luna's trail to the Rift.</p></div><div class="ww-cat-grid"></div><div class="ww-select-actions"><button class="ww-button ww-button--quiet" data-action="back" type="button">Back</button><span class="ww-select-note">You can swap cats with [ and ] while exploring.</span><button class="ww-button" data-action="continue" type="button">Enter the forest</button></div></div>`;
    const grid = screen.querySelector(".ww-cat-grid") as HTMLElement;
    const render = (activeId: CatId): void => {
      grid.innerHTML = CATS.map((cat) => `<button class="ww-cat-card${cat.id === activeId ? " is-selected" : ""}" style="--cat-body:${cat.bodyColor};--cat-accent:${cat.accentColor}" data-cat-id="${cat.id}" type="button">${catMark()}<span class="ww-cat-card__copy"><span class="ww-cat-card__name">${cat.name}</span><span class="ww-cat-card__role">${cat.role}</span><span class="ww-cat-card__blurb">${cat.blurb}</span></span></button>`).join("");
      for (const button of [...grid.querySelectorAll<HTMLButtonElement>("[data-cat-id]")]) {
        button.addEventListener("click", () => {
          const id = button.dataset.catId as CatId;
          selection.select(id);
          render(id);
          this.callbacks.onSelectCat(id);
        });
      }
    };
    render(selection.activeId);
    screen.querySelector('[data-action="back"]')?.addEventListener("click", this.callbacks.onReturnToTitle);
    screen.querySelector('[data-action="continue"]')?.addEventListener("click", this.callbacks.onContinue);
    this.root.appendChild(screen);
    return screen;
  }

  private createCompleteScreen(): HTMLElement {
    const screen = document.createElement("section");
    screen.className = "ww-screen ww-complete";
    screen.innerHTML = `<div class="ww-complete-card"><div class="ww-complete-mark">✦</div><p class="ww-kicker">Chapter 1 / Whisperleaf Forest</p><h2>Trail complete</h2><p>The shard is quiet, the clearing is safe, and the six trails have a new story to tell. The Rift is waiting beyond the trees.</p><p class="ww-complete-unlock"></p><div class="ww-complete-actions"><button class="ww-button ww-button--quiet" data-action="title" type="button">Return to title</button><button class="ww-button" data-action="replay" type="button">Replay chapter</button></div></div>`;
    screen.querySelector('[data-action="title"]')?.addEventListener("click", this.callbacks.onReturnToTitle);
    screen.querySelector('[data-action="replay"]')?.addEventListener("click", this.callbacks.onReplay);
    this.root.appendChild(screen);
    return screen;
  }

  installCatShortcuts(selection: CatSelection): void {
    window.addEventListener("keydown", (event) => {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey || this.stage !== "play") return;
      if (event.key === "[") selection.cycle(-1);
      if (event.key === "]") selection.cycle(1);
      const digit = Number.parseInt(event.key, 10);
      if (digit >= 1 && digit <= CATS.length) selection.select(CATS[digit - 1].id);
    });
  }
}
