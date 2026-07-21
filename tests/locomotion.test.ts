import { describe, expect, it } from "vitest";
import {
  createLocomotionState,
  stepLocomotion,
  supportHeightAt,
  DEFAULT_TUNING,
  type LocomotionInput,
} from "../src/entities/cats/locomotion";
import type { AabbObstacle } from "../src/core/math";

const IDLE: LocomotionInput = { move: { x: 0, z: 0 }, sprint: false, jump: false };
const FORWARD: LocomotionInput = { move: { x: 0, z: -1 }, sprint: false, jump: false };
const DT = 1 / 120;

function stepMany(
  state: ReturnType<typeof createLocomotionState>,
  input: LocomotionInput,
  seconds: number,
  obstacles: readonly AabbObstacle[] = [],
): void {
  const steps = Math.round(seconds / DT);
  for (let i = 0; i < steps; i++) {
    stepLocomotion(state, input, obstacles, DEFAULT_TUNING, DT);
  }
}

describe("acceleration / deceleration", () => {
  it("reaches full walk speed inside the 0.15-0.35s feel band", () => {
    const s = createLocomotionState();
    stepMany(s, FORWARD, 0.1);
    expect(Math.hypot(s.vx, s.vz)).toBeLessThan(DEFAULT_TUNING.walkSpeed);
    stepMany(s, FORWARD, 0.25);
    expect(Math.hypot(s.vx, s.vz)).toBeCloseTo(DEFAULT_TUNING.walkSpeed, 3);
  });

  it("never exceeds the speed cap, and sprint raises the cap", () => {
    const s = createLocomotionState();
    stepMany(s, FORWARD, 1);
    expect(Math.hypot(s.vx, s.vz)).toBeLessThanOrEqual(DEFAULT_TUNING.walkSpeed + 1e-6);

    stepMany(s, { ...FORWARD, sprint: true }, 1);
    expect(Math.hypot(s.vx, s.vz)).toBeCloseTo(DEFAULT_TUNING.sprintSpeed, 3);
  });

  it("decelerates to a stop instead of snapping", () => {
    const s = createLocomotionState();
    stepMany(s, FORWARD, 1);
    stepMany(s, IDLE, 0.05);
    const mid = Math.hypot(s.vx, s.vz);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(DEFAULT_TUNING.walkSpeed);
    stepMany(s, IDLE, 0.5);
    expect(Math.hypot(s.vx, s.vz)).toBe(0);
  });

  it("faces the travel direction (yaw settles to movement heading)", () => {
    const s = createLocomotionState();
    stepMany(s, FORWARD, 1);
    // Forward is -Z, so yaw should settle at PI (local +Z rotated to face -Z).
    expect(Math.abs(s.yaw)).toBeCloseTo(Math.PI, 2);
  });
});

describe("jump and gravity", () => {
  it("jumps once from the ground with a readable apex", () => {
    const s = createLocomotionState();
    stepLocomotion(s, { ...IDLE, jump: true }, [], DEFAULT_TUNING, DT);
    expect(s.grounded).toBe(false);
    // vy = jumpSpeed minus the same tick's gravity.
    expect(s.vy).toBeCloseTo(DEFAULT_TUNING.jumpSpeed - DEFAULT_TUNING.gravity * DT, 3);

    let apex = 0;
    for (let i = 0; i < 600 && !s.grounded; i++) {
      stepLocomotion(s, IDLE, [], DEFAULT_TUNING, DT);
      apex = Math.max(apex, s.y);
    }
    const expected = DEFAULT_TUNING.jumpSpeed ** 2 / (2 * DEFAULT_TUNING.gravity);
    expect(apex).toBeGreaterThan(expected * 0.9);
    expect(s.grounded).toBe(true);
    expect(s.y).toBe(0);
  });

  it("does not double-jump mid-air", () => {
    const s = createLocomotionState();
    stepLocomotion(s, { ...IDLE, jump: true }, [], DEFAULT_TUNING, DT);
    stepMany(s, IDLE, 0.2);
    const vyBefore = s.vy;
    stepLocomotion(s, { ...IDLE, jump: true }, [], DEFAULT_TUNING, DT);
    // Second press mid-air only costs one gravity tick; no vy reset.
    expect(s.vy).toBeCloseTo(vyBefore - DEFAULT_TUNING.gravity * DT, 3);
    expect(s.grounded).toBe(false);
  });

  it("never sinks below the ground plane", () => {
    const s = createLocomotionState();
    stepLocomotion(s, { ...IDLE, jump: true }, [], DEFAULT_TUNING, DT);
    stepMany(s, IDLE, 2);
    expect(s.y).toBeGreaterThanOrEqual(0);
    expect(s.grounded).toBe(true);
  });
});

describe("bounds and obstacles", () => {
  it("clamps the cat to the playable radius", () => {
    const s = createLocomotionState();
    stepMany(s, { ...FORWARD, sprint: true }, 12);
    expect(Math.hypot(s.x, s.z)).toBeLessThanOrEqual(DEFAULT_TUNING.boundsRadius + 1e-6);
  });

  it("pushes the cat out of a block side (wall, not teleport)", () => {
    const wall: AabbObstacle = { minX: -1, maxX: 1, minZ: -6, maxZ: -4, top: 2.2 };
    const s = createLocomotionState();
    stepMany(s, FORWARD, 2, [wall]);
    // Ran straight at the wall from z=0: must stay on the near side.
    expect(s.z).toBeGreaterThanOrEqual(wall.maxZ + DEFAULT_TUNING.bodyRadius - 1e-3);
    expect(s.y).toBe(0);
  });

  it("lands on top of a hoppable block", () => {
    // Deep block: the jump arc stays above its footprint long enough to land on it.
    const block: AabbObstacle = { minX: -1, maxX: 1, minZ: -5, maxZ: -1, top: 0.6 };
    const s = createLocomotionState();
    // Run forward and jump so we arrive above the block footprint.
    stepMany(s, FORWARD, 0.4, [block]);
    stepLocomotion(s, { ...FORWARD, jump: true }, [block], DEFAULT_TUNING, DT);
    // Airtime back down to block height is ~0.62s; stop input soon after so
    // the cat settles on top instead of running off the far edge.
    stepMany(s, FORWARD, 0.8, [block]);
    expect(supportHeightAt({ x: s.x, z: s.z }, s.y, [block], DEFAULT_TUNING.bodyRadius)).toBe(0.6);
    expect(s.y).toBeCloseTo(0.6, 3);
    expect(s.grounded).toBe(true);
  });

  it("falls back to ground level when walking off a block", () => {
    const block: AabbObstacle = { minX: -1, maxX: 1, minZ: -3, maxZ: -1, top: 0.6 };
    const s = createLocomotionState();
    s.y = 0.6;
    s.z = -2;
    stepMany(s, { move: { x: 1, z: 0 }, sprint: false, jump: false }, 1.5, [block]);
    expect(s.y).toBe(0);
    expect(s.grounded).toBe(true);
  });
});
