import { describe, expect, it } from "vitest";
import {
  FOREST_BOUNDS_RADIUS,
  FOREST_CLEARING,
  FOREST_SPAWN,
  GLOW_MUSHROOMS,
  MUSHROOM_CAP_SCALE,
  OVERLOOK_STEPS,
  aabbFromMushroom,
  forestObstacles,
} from "../src/world/chapters/forestLayout";
import {
  createLocomotionState,
  resolveObstacleSides,
  stepLocomotion,
  supportHeightAt,
  DEFAULT_TUNING,
} from "../src/entities/cats/locomotion";
import { clamp } from "../src/core/math";

const OBSTACLES = forestObstacles();
const JUMP_APEX = DEFAULT_TUNING.jumpSpeed ** 2 / (2 * DEFAULT_TUNING.gravity);

describe("forest chapter layout", () => {
  it("has a non-empty obstacle list for the player controller", () => {
    expect(OBSTACLES.length).toBeGreaterThan(10);
  });

  it("keeps every obstacle inside the playable bounds", () => {
    for (const box of OBSTACLES) {
      const corners = [
        [box.minX, box.minZ],
        [box.minX, box.maxZ],
        [box.maxX, box.minZ],
        [box.maxX, box.maxZ],
      ];
      for (const [x, z] of corners) {
        expect(Math.hypot(x, z)).toBeLessThanOrEqual(FOREST_BOUNDS_RADIUS);
      }
    }
  });

  it("keeps the spawn clearing free of obstacles", () => {
    for (const box of OBSTACLES) {
      const closestX = clamp(FOREST_CLEARING.x, box.minX, box.maxX);
      const closestZ = clamp(FOREST_CLEARING.z, box.minZ, box.maxZ);
      const dist = Math.hypot(closestX - FOREST_CLEARING.x, closestZ - FOREST_CLEARING.z);
      expect(dist).toBeGreaterThanOrEqual(FOREST_CLEARING.radius);
    }
  });

  it("places the spawn on open ground inside bounds and the clearing", () => {
    expect(FOREST_SPAWN.y).toBe(0);
    expect(Math.hypot(FOREST_SPAWN.x, FOREST_SPAWN.z)).toBeLessThan(FOREST_CLEARING.radius);
    const spawn2d = { x: FOREST_SPAWN.x, z: FOREST_SPAWN.z };
    // Standing on the flat ground, not on a prop, not intersecting any wall.
    expect(supportHeightAt(spawn2d, 0, OBSTACLES, DEFAULT_TUNING.bodyRadius)).toBe(0);
    expect(resolveObstacleSides(spawn2d, 0, OBSTACLES, DEFAULT_TUNING.bodyRadius)).toEqual(spawn2d);
  });

  it("keeps every overlook step rise within the jump apex", () => {
    let previousTop = 0;
    for (const step of OVERLOOK_STEPS) {
      expect(step.height - previousTop).toBeLessThan(JUMP_APEX);
      previousTop = step.height;
    }
  });

  it("chains overlook steps edge-to-edge so the climb is a hop sequence", () => {
    for (let i = 1; i < OVERLOOK_STEPS.length; i++) {
      const a = OVERLOOK_STEPS[i - 1];
      const b = OVERLOOK_STEPS[i];
      const gapX =
        Math.abs(a.centerX - b.centerX) - (a.sizeX + b.sizeX) / 2;
      const gapZ =
        Math.abs(a.centerZ - b.centerZ) - (a.sizeZ + b.sizeZ) / 2;
      // Footprints must touch or overlap on both axes (no jump-across gaps).
      expect(Math.max(gapX, gapZ)).toBeLessThanOrEqual(0);
    }
  });

  it("lets a cat idle at spawn without sliding or sinking", () => {
    const s = createLocomotionState(FOREST_SPAWN);
    const idle = { move: { x: 0, z: 0 }, sprint: false, jump: false };
    for (let i = 0; i < 120; i++) {
      stepLocomotion(s, idle, OBSTACLES, DEFAULT_TUNING, 1 / 120);
    }
    expect(s.x).toBe(FOREST_SPAWN.x);
    expect(s.z).toBe(FOREST_SPAWN.z);
    expect(s.y).toBe(0);
    expect(s.grounded).toBe(true);
  });
});

describe("mushroom collision matches the visual cap silhouette", () => {
  it("gives every mushroom a footprint as wide as its rendered cap, not its thin stem", () => {
    for (const spec of GLOW_MUSHROOMS) {
      const box = aabbFromMushroom(spec);
      const capRadius = spec.radius * MUSHROOM_CAP_SCALE;
      expect(box.maxX - box.minX, `${spec.x},${spec.z}`).toBeCloseTo(capRadius * 2);
      expect(box.maxZ - box.minZ, `${spec.x},${spec.z}`).toBeCloseTo(capRadius * 2);
      // A footprint keyed to the thin stem radius would be much narrower
      // than the cap - guard against regressing back to that bug directly.
      expect(capRadius).toBeGreaterThan(spec.radius);
    }
  });

  it("blocks a walking cat at the tall (non-hoppable) mushroom's cap radius, not its stem", () => {
    const tall = GLOW_MUSHROOMS.find((spec) => !spec.hoppable);
    expect(tall).toBeDefined();
    const spec = tall!;
    const capRadius = spec.radius * MUSHROOM_CAP_SCALE;
    const s = createLocomotionState({ x: spec.x - capRadius - 3, y: 0, z: spec.z, yaw: 0 });
    const walkTowardMushroom = { move: { x: 1, z: 0 }, sprint: true, jump: false };
    for (let i = 0; i < 600; i++) {
      stepLocomotion(s, walkTowardMushroom, OBSTACLES, DEFAULT_TUNING, 1 / 120);
    }
    const distanceFromCenter = spec.x - s.x;
    expect(distanceFromCenter).toBeGreaterThanOrEqual(capRadius + DEFAULT_TUNING.bodyRadius - 0.02);
  });

  it("keeps the hoppable mushroom a platform on top while still blocking its cap from the side", () => {
    const hop = GLOW_MUSHROOMS.find((spec) => spec.hoppable);
    expect(hop).toBeDefined();
    const spec = hop!;
    const capRadius = spec.radius * MUSHROOM_CAP_SCALE;

    // Falling straight down onto the cap lands on its top, not the ground.
    const support = supportHeightAt({ x: spec.x, z: spec.z }, spec.height + 1, OBSTACLES, DEFAULT_TUNING.bodyRadius);
    expect(support).toBe(spec.height);

    // Approaching from the side while grounded is still pushed out to the cap radius.
    const pushed = resolveObstacleSides(
      { x: spec.x - capRadius - 0.1, z: spec.z },
      0,
      OBSTACLES,
      DEFAULT_TUNING.bodyRadius,
    );
    expect(spec.x - pushed.x).toBeGreaterThanOrEqual(capRadius);
  });
});

describe("spawn pose seeding", () => {
  it("seeds locomotion state from a spawn pose", () => {
    const s = createLocomotionState(FOREST_SPAWN);
    expect(s.x).toBe(FOREST_SPAWN.x);
    expect(s.y).toBe(FOREST_SPAWN.y);
    expect(s.z).toBe(FOREST_SPAWN.z);
    expect(s.yaw).toBe(FOREST_SPAWN.yaw);
    expect(s.grounded).toBe(true);
  });

  it("defaults to the origin when no spawn pose is given", () => {
    const s = createLocomotionState();
    expect([s.x, s.y, s.z, s.yaw]).toEqual([0, 0, 0, 0]);
  });
});
