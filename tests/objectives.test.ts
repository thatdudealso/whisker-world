import { describe, expect, it } from "vitest";
import { createObjectiveState, updateObjectives } from "../src/systems/objectives";

describe("Chapter 1 objectives", () => {
  it("starts at the overlook and advances in order", () => {
    let state = createObjectiveState("luna");
    state = updateObjectives(state, { x: -1, y: 2.7, z: -11.5 });
    expect(state.active).toBe("rift");
    expect(state.completed).toEqual(["overlook"]);

    state = updateObjectives(state, { x: 12.5, y: 0, z: 2.5 });
    expect(state.active).toBe("return");
    expect(state.completed).toEqual(["overlook", "rift"]);

    state = updateObjectives(state, { x: 0, y: 0, z: 3.5 });
    expect(state.complete).toBe(true);
    expect(state.completed).toEqual(["overlook", "rift", "return"]);
  });

  it("does not mark the overlook from the lower trail", () => {
    const state = createObjectiveState("luna");
    expect(updateObjectives(state, { x: -1, y: 0, z: -11.5 })).toEqual(state);
  });

  it("is idempotent after completion", () => {
    let state = createObjectiveState("dash");
    state = updateObjectives(state, { x: -1, y: 2.7, z: -11.5 });
    state = updateObjectives(state, { x: 12.5, y: 0, z: 2.5 });
    state = updateObjectives(state, { x: 0, y: 0, z: 3.5 });
    expect(updateObjectives(state, { x: 100, y: 0, z: 100 })).toBe(state);
  });
});

