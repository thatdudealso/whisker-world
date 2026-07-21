import type { CatId } from "../content/cats";

export type GameStage = "title" | "select" | "intro" | "play" | "complete";

export interface GameFlowState {
  stage: GameStage;
  selectedCatId: CatId;
}

export class GameFlow {
  private state: GameFlowState;
  private readonly listeners = new Set<(state: GameFlowState) => void>();

  constructor(initialCatId: CatId) {
    this.state = { stage: "title", selectedCatId: initialCatId };
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
