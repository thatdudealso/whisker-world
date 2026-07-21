/**
 * Cutscene beat player - the pure state machine behind the intro cards.
 *
 * No DOM, no three.js: presentation subscribes via hooks. States:
 *
 *   idle --start()--> playing --advance() past last beat--> finished
 *                        \--skip()-------------------------^
 *
 * start() only succeeds from idle (no double-trigger), advance()/skip()
 * only act while playing, and onFinished fires exactly once.
 */
import type { CutsceneBeat } from "../content/cutscenes/chapter1";

export type CutsceneStatus = "idle" | "playing" | "finished";

export interface CutsceneHooks {
  /** Called when a beat becomes current (including the first on start). */
  onBeat?: (beat: CutsceneBeat, beatNumber: number, beatCount: number) => void;
  /** Called exactly once when the cutscene finishes (completed or skipped). */
  onFinished?: (skipped: boolean) => void;
}

export class CutscenePlayer {
  private state: CutsceneStatus = "idle";
  private index = 0;

  constructor(
    private readonly beats: readonly CutsceneBeat[],
    private readonly hooks: CutsceneHooks = {},
  ) {
    if (beats.length === 0) {
      throw new Error("CutscenePlayer needs at least one beat");
    }
  }

  get status(): CutsceneStatus {
    return this.state;
  }

  /** Current beat while playing; null otherwise. */
  get currentBeat(): CutsceneBeat | null {
    return this.state === "playing" ? this.beats[this.index] : null;
  }

  /** 1-based position for the "1/6" counter. */
  get beatNumber(): number {
    return this.index + 1;
  }

  get beatCount(): number {
    return this.beats.length;
  }

  /** Begin playback. Returns false (and does nothing) unless idle. */
  start(): boolean {
    if (this.state !== "idle") {
      return false;
    }
    this.state = "playing";
    this.index = 0;
    this.emitBeat();
    return true;
  }

  /** Move to the next beat, or finish after the last one. No-op unless playing. */
  advance(): void {
    if (this.state !== "playing") {
      return;
    }
    if (this.index + 1 >= this.beats.length) {
      this.finish(false);
      return;
    }
    this.index += 1;
    this.emitBeat();
  }

  /** Jump straight to finished. No-op unless playing. */
  skip(): void {
    if (this.state !== "playing") {
      return;
    }
    this.finish(true);
  }

  private finish(skipped: boolean): void {
    this.state = "finished";
    this.hooks.onFinished?.(skipped);
  }

  private emitBeat(): void {
    this.hooks.onBeat?.(this.beats[this.index], this.beatNumber, this.beatCount);
  }
}
