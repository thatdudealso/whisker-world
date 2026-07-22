import type { CatId } from "../content/cats";
import type { ChapterId } from "../content/chapters";
import { getChapterProgressStorage, unlockNextChapter } from "../content/chapterProgress";
import type { StorageLike } from "../cutscenes/introGate";

export type GameStage = "title" | "select" | "intro" | "play" | "complete";

export interface GameFlowState {
  stage: GameStage;
  selectedCatId: CatId;
  /** Chapter unlocked by the most recent `completeChapter()`, or null if none. */
  unlockedChapterId: ChapterId | null;
}

export class GameFlow {
  private state: GameFlowState;
  private readonly listeners = new Set<(state: GameFlowState) => void>();
  private readonly progressStorage: StorageLike;

  constructor(initialCatId: CatId, progressStorage: StorageLike = getChapterProgressStorage()) {
    this.state = { stage: "title", selectedCatId: initialCatId, unlockedChapterId: null };
    this.progressStorage = progressStorage;
  }

  get current(): GameFlowState {
    return this.state;
  }

  subscribe(listener: (state: GameFlowState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private setStage(stage: GameStage): void {
    this.state = { ...this.state, stage };
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  openSelect(): void {
    if (this.state.stage === "title") {
      this.setStage("select");
    }
  }

  chooseCat(id: CatId): void {
    this.state = { ...this.state, selectedCatId: id };
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  beginIntro(): void {
    if (this.state.stage === "select" || this.state.stage === "complete") {
      this.setStage("intro");
    }
  }

  beginPlay(): void {
    if (this.state.stage === "intro") {
      this.setStage("play");
    }
  }

  skipIntro(): void {
    if (this.state.stage === "select") {
      this.setStage("play");
    }
  }

  completeChapter(): void {
    if (this.state.stage === "play") {
      // This flow only ever runs chapter 1 today; hardcoding it here keeps
      // the unlock rule (finishing chapter N unlocks chapter N+1) out of
      // main.ts until a second chapter's flow actually exists.
      const unlockedChapterId = unlockNextChapter("chapter-1", this.progressStorage);
      this.state = { ...this.state, unlockedChapterId };
      this.setStage("complete");
    }
  }

  replay(): void {
    if (this.state.stage === "complete") {
      this.setStage("intro");
    }
  }

  returnToTitle(): void {
    if (this.state.stage !== "title") {
      this.setStage("title");
    }
  }
}
