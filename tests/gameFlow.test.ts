import { describe, expect, it } from "vitest";
import { GameFlow } from "../src/systems/gameFlow";

describe("GameFlow", () => {
  it("walks title, select, intro, play, and complete", () => {
    const flow = new GameFlow("luna");
    expect(flow.current.stage).toBe("title");
    flow.openSelect();
    flow.chooseCat("misty");
    flow.beginIntro();
    flow.beginPlay();
    flow.completeChapter();
    expect(flow.current).toEqual({ stage: "complete", selectedCatId: "misty" });
  });

  it("ignores out-of-order transitions", () => {
    const flow = new GameFlow("luna");
    flow.beginPlay();
    flow.completeChapter();
    expect(flow.current.stage).toBe("title");
    flow.openSelect();
    flow.beginIntro();
    flow.replay();
    expect(flow.current.stage).toBe("intro");
  });

  it("supports replay and returning to title", () => {
    const flow = new GameFlow("luna");
    flow.openSelect();
    flow.beginIntro();
    flow.beginPlay();
    flow.completeChapter();
    flow.replay();
    expect(flow.current.stage).toBe("intro");
    flow.returnToTitle();
    expect(flow.current.stage).toBe("title");
  });

  it("can enter play directly after the intro has been seen", () => {
    const flow = new GameFlow("luna");

    flow.openSelect();
    flow.skipIntro();

    expect(flow.current.stage).toBe("play");
  });
});
