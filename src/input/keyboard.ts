/**
 * Keyboard input for Whisker World locomotion.
 *
 * Owns the raw key state (no more ad-hoc Set in main.ts), exposes a clean
 * per-frame snapshot: normalized move intent, sprint held, edge-triggered
 * jump, and camera orbit direction. Clears itself on window blur so keys
 * never get stuck "down".
 */
import { normalize2, type Vec2 } from "../core/math";

export interface InputSnapshot {
  /** Normalized world-space move intent (x right, z toward camera). Zero when idle. */
  move: Vec2;
  /** True while Shift is held (higher speed cap). */
  sprint: boolean;
  /** True exactly once per Space press; consumed by the controller. */
  jumpPressed: boolean;
  /** -1 (Q), 0, or +1 (E): camera orbit yaw rate direction. */
  orbit: number;
}

const GAME_KEYS = new Set([
  "w",
  "a",
  "s",
  "d",
  "arrowup",
  "arrowdown",
  "arrowleft",
  "arrowright",
  " ",
  "shift",
  "q",
  "e",
]);

export class KeyboardInput {
  private readonly held = new Set<string>();
  private jumpQueued = false;

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    const key = event.key.toLowerCase();
    if (!GAME_KEYS.has(key)) {
      return;
    }
    // Keep arrows/space from scrolling the page.
    event.preventDefault();
    if (event.repeat) {
      return;
    }
    this.held.add(key);
    if (key === " ") {
      this.jumpQueued = true;
    }
  };

  private readonly onKeyUp = (event: KeyboardEvent): void => {
    this.held.delete(event.key.toLowerCase());
  };

  private readonly onBlur = (): void => {
    this.held.clear();
    this.jumpQueued = false;
  };

  attach(target: Window): void {
    target.addEventListener("keydown", this.onKeyDown);
    target.addEventListener("keyup", this.onKeyUp);
    target.addEventListener("blur", this.onBlur);
  }

  detach(target: Window): void {
    target.removeEventListener("keydown", this.onKeyDown);
    target.removeEventListener("keyup", this.onKeyUp);
    target.removeEventListener("blur", this.onBlur);
  }

  /**
   * Read the current frame's input. The queued jump edge is consumed here so
   * exactly one system sees each press.
   */
  snapshot(): InputSnapshot {
    let x = 0;
    let z = 0;
    if (this.held.has("w") || this.held.has("arrowup")) z -= 1;
    if (this.held.has("s") || this.held.has("arrowdown")) z += 1;
    if (this.held.has("a") || this.held.has("arrowleft")) x -= 1;
    if (this.held.has("d") || this.held.has("arrowright")) x += 1;

    let orbit = 0;
    if (this.held.has("q")) orbit -= 1;
    if (this.held.has("e")) orbit += 1;

    const jumpPressed = this.jumpQueued;
    this.jumpQueued = false;

    return {
      move: normalize2({ x, z }),
      sprint: this.held.has("shift"),
      jumpPressed,
      orbit,
    };
  }
}
