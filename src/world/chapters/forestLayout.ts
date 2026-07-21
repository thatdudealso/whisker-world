/**
 * Chapter 1 - Whimsical Glowing Forest (WW-D2): pure layout data.
 *
 * No three.js imports: positions, footprints, and obstacle derivation live
 * here so the layout is unit-testable (bounds, spawn safety, climbability)
 * without a browser. Visuals (colors, lights, meshes) live in
 * `forestChapter1.ts`.
 *
 * Terrain approach: flat ground disc + terraced AABB platforms, which the
 * existing kinematic controller (circle-vs-AABB walls, block-top platforms)
 * already handles. No ground height function, no Rapier.
 */
import type { AabbObstacle } from "../../core/math";
import type { SpawnPose } from "../../entities/cats/locomotion";

/** Playable radius, unchanged from the Phase 0 greybox (locomotion clamp). */
export const FOREST_BOUNDS_RADIUS = 19;
/** Visual forest-floor disc radius; 1m skirt beyond the bounds clamp. */
export const FOREST_GROUND_RADIUS = 20;

/**
 * Safe clearing at the world origin: no obstacle footprint may intrude into
 * this circle, so spawning and first steps are always collision-free.
 */
export const FOREST_CLEARING = { x: 0, z: 0, radius: 4.5 } as const;

/** Spawn just south of the clearing center, facing -Z toward the overlook. */
export const FOREST_SPAWN: SpawnPose = { x: 0, y: 0, z: 3.5, yaw: Math.PI };

/** Axis-aligned box prop: footprint on XZ, sitting on the ground (y = 0). */
export interface BoxSpec {
  centerX: number;
  centerZ: number;
  sizeX: number;
  sizeZ: number;
  height: number;
}

/** Round prop (mushroom stem / tree trunk); collides as its bounding AABB. */
export interface PillarSpec {
  x: number;
  z: number;
  radius: number;
  height: number;
  /** Low mushroom doubling as a hop platform: cap is flattened to keep its top clear. */
  hoppable?: boolean;
}

/**
 * Elevated overlook, north of the clearing: three terrace steps. Each rise is
 * 0.9m, under the jump apex (~1.17m with DEFAULT_TUNING), and consecutive
 * steps share an edge so the climb is a simple hop chain.
 */
export const OVERLOOK_STEPS: readonly BoxSpec[] = [
  { centerX: 2, centerZ: -8.5, sizeX: 3, sizeZ: 3, height: 0.9 },
  { centerX: 2, centerZ: -11.5, sizeX: 3, sizeZ: 3, height: 1.8 },
  { centerX: -1, centerZ: -11.5, sizeX: 3, sizeZ: 3, height: 2.7 },
];

/** Rift crack marker, east: violet emissive shard rising from a ground crack. */
export const RIFT_SHARD: BoxSpec = {
  centerX: 12.5,
  centerZ: 2.5,
  sizeX: 1.4,
  sizeZ: 1.4,
  height: 2.6,
};

/**
 * Cap radius is wider than the stem (see `forestChapter1.ts` `addMushroom`,
 * which draws the cap at `radius * MUSHROOM_CAP_SCALE`). The cap is the
 * blocking silhouette a player sees, so collision must use it too - single
 * source of truth shared by layout (this file) and visuals.
 */
export const MUSHROOM_CAP_SCALE = 1.72;

/**
 * Bioluminescent mushroom proxies: glowing caps on stems. The low one by the
 * overlook path (0.8m) doubles as a hop platform; the tall ones are walls.
 */
export const GLOW_MUSHROOMS: readonly PillarSpec[] = [
  { x: 3.5, z: -5.5, radius: 0.7, height: 0.8, hoppable: true },
  { x: -8, z: -6, radius: 0.5, height: 2.2 },
  { x: -11, z: 3, radius: 0.6, height: 2.6 },
  { x: 7, z: -7.5, radius: 0.45, height: 1.9 },
  { x: -5, z: 9, radius: 0.5, height: 2.3 },
  { x: 9, z: 8.5, radius: 0.55, height: 2.4 },
];

/** Dark trunk silhouettes near the rim; sell "forest" against the fog. */
export const TREE_TRUNKS: readonly PillarSpec[] = [
  { x: -15, z: -8, radius: 0.8, height: 7 },
  { x: -16.5, z: 4, radius: 0.7, height: 6.5 },
  { x: 15.5, z: -6, radius: 0.8, height: 7.5 },
  { x: 14, z: 11, radius: 0.7, height: 6.8 },
  { x: -9, z: -14, radius: 0.75, height: 7.2 },
  { x: 4, z: 15.5, radius: 0.7, height: 6.6 },
  { x: -3, z: -16.5, radius: 0.8, height: 7 },
];

/**
 * Path-ish rock ring around the clearing (~6.5m out), with deliberate gaps:
 * north toward the overlook, east toward the rift shard, south past spawn.
 * Low rocks are hoppable; taller ones read as walls.
 */
export const PATH_ROCKS: readonly BoxSpec[] = [
  { centerX: 4.6, centerZ: 4.6, sizeX: 1.3, sizeZ: 1.1, height: 0.8 },
  { centerX: -4.6, centerZ: 4.6, sizeX: 1.1, sizeZ: 1.3, height: 1.0 },
  { centerX: -6.5, centerZ: 0.5, sizeX: 1.2, sizeZ: 1.4, height: 0.7 },
  { centerX: -4.8, centerZ: -4.4, sizeX: 1.3, sizeZ: 1.2, height: 0.9 },
  { centerX: -1.5, centerZ: -6.3, sizeX: 1.2, sizeZ: 1.0, height: 0.8 },
  { centerX: 6.2, centerZ: -2.6, sizeX: 1.1, sizeZ: 1.2, height: 0.7 },
  { centerX: 6.3, centerZ: 3.0, sizeX: 1.2, sizeZ: 1.2, height: 0.9 },
  { centerX: 0.8, centerZ: 6.6, sizeX: 1.4, sizeZ: 1.1, height: 0.6 },
];

export function aabbFromBox(spec: BoxSpec): AabbObstacle {
  return {
    minX: spec.centerX - spec.sizeX / 2,
    maxX: spec.centerX + spec.sizeX / 2,
    minZ: spec.centerZ - spec.sizeZ / 2,
    maxZ: spec.centerZ + spec.sizeZ / 2,
    top: spec.height,
  };
}

export function aabbFromPillar(spec: PillarSpec): AabbObstacle {
  return {
    minX: spec.x - spec.radius,
    maxX: spec.x + spec.radius,
    minZ: spec.z - spec.radius,
    maxZ: spec.z + spec.radius,
    top: spec.height,
  };
}

/**
 * Mushroom footprint uses the cap radius, not the stem radius: the cap is
 * the wide part a walking cat's body actually hits. The low hoppable
 * mushroom keeps its `top` at the stem height, so its widened footprint
 * still resolves as a platform once a cat clears it, not a wider wall.
 */
export function aabbFromMushroom(spec: PillarSpec): AabbObstacle {
  const capRadius = spec.radius * MUSHROOM_CAP_SCALE;
  return {
    minX: spec.x - capRadius,
    maxX: spec.x + capRadius,
    minZ: spec.z - capRadius,
    maxZ: spec.z + capRadius,
    top: spec.height,
  };
}

/** Every collidable prop in the chapter, as controller-ready AABBs. */
export function forestObstacles(): AabbObstacle[] {
  return [
    ...OVERLOOK_STEPS.map(aabbFromBox),
    aabbFromBox(RIFT_SHARD),
    ...PATH_ROCKS.map(aabbFromBox),
    ...GLOW_MUSHROOMS.map(aabbFromMushroom),
    ...TREE_TRUNKS.map(aabbFromPillar),
  ];
}
