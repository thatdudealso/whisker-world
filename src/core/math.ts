/**
 * Pure 2D / scalar math helpers for locomotion.
 * No three.js imports here so these stay trivially unit-testable.
 */

export interface Vec2 {
  x: number;
  z: number;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Normalize a 2D vector. Returns { x: 0, z: 0 } for a zero-length input
 * (never NaN). Diagonals become length 1.
 */
export function normalize2(v: Vec2): Vec2 {
  const len = Math.hypot(v.x, v.z);
  if (len < 1e-9) {
    return { x: 0, z: 0 };
  }
  return { x: v.x / len, z: v.z / len };
}

export function length2(v: Vec2): number {
  return Math.hypot(v.x, v.z);
}

/**
 * Move `current` toward `target` by at most `maxDelta`.
 * Standard linear approach: constant-rate accel feel, framerate independent.
 */
export function moveTowards(current: number, target: number, maxDelta: number): number {
  const delta = target - current;
  if (Math.abs(delta) <= maxDelta) {
    return target;
  }
  return current + Math.sign(delta) * maxDelta;
}

/** Move a 2D vector toward a target vector by at most `maxDelta` (same direction). */
export function moveTowards2(current: Vec2, target: Vec2, maxDelta: number): Vec2 {
  const dx = target.x - current.x;
  const dz = target.z - current.z;
  const dist = Math.hypot(dx, dz);
  if (dist <= maxDelta || dist < 1e-9) {
    return { x: target.x, z: target.z };
  }
  const scale = maxDelta / dist;
  return { x: current.x + dx * scale, z: current.z + dz * scale };
}

/** Smallest signed angular difference from `from` to `to`, in (-PI, PI]. */
export function angleDelta(from: number, to: number): number {
  let delta = (to - from) % (Math.PI * 2);
  if (delta > Math.PI) {
    delta -= Math.PI * 2;
  } else if (delta <= -Math.PI) {
    delta += Math.PI * 2;
  }
  return delta;
}

/** Rotate `current` yaw toward `target` yaw by at most `maxDelta` radians (shortest path). */
export function turnTowards(current: number, target: number, maxDelta: number): number {
  const delta = angleDelta(current, target);
  if (Math.abs(delta) <= maxDelta) {
    return target;
  }
  return current + Math.sign(delta) * maxDelta;
}

/** Clamp a position to a circle of `radius` around the origin. */
export function clampToCircle(pos: Vec2, radius: number): Vec2 {
  const dist = Math.hypot(pos.x, pos.z);
  if (dist <= radius || dist < 1e-9) {
    return { x: pos.x, z: pos.z };
  }
  const scale = radius / dist;
  return { x: pos.x * scale, z: pos.z * scale };
}

/**
 * Axis-aligned box on the XZ plane with a height (top face y).
 * Bottom is always y = 0 for greybox blocks sitting on the ground.
 */
export interface AabbObstacle {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  top: number;
}

/**
 * Push a circle (player footprint) out of an AABB on the XZ plane.
 * Returns the corrected position, or null when there is no overlap.
 * Handles the degenerate "center inside box" case by ejecting along the
 * axis of least penetration.
 */
export function resolveCircleVsAabb(center: Vec2, radius: number, box: AabbObstacle): Vec2 | null {
  const closestX = clamp(center.x, box.minX, box.maxX);
  const closestZ = clamp(center.z, box.minZ, box.maxZ);
  const dx = center.x - closestX;
  const dz = center.z - closestZ;
  const distSq = dx * dx + dz * dz;

  if (distSq >= radius * radius) {
    return null;
  }

  if (distSq > 1e-9) {
    const dist = Math.sqrt(distSq);
    const push = (radius - dist) / dist;
    return { x: center.x + dx * push, z: center.z + dz * push };
  }

  // Center is inside the box: eject along the shallowest face.
  const toMinX = center.x - box.minX;
  const toMaxX = box.maxX - center.x;
  const toMinZ = center.z - box.minZ;
  const toMaxZ = box.maxZ - center.z;
  const minPen = Math.min(toMinX, toMaxX, toMinZ, toMaxZ);
  if (minPen === toMinX) {
    return { x: box.minX - radius, z: center.z };
  }
  if (minPen === toMaxX) {
    return { x: box.maxX + radius, z: center.z };
  }
  if (minPen === toMinZ) {
    return { x: center.x, z: box.minZ - radius };
  }
  return { x: center.x, z: box.maxZ + radius };
}

/**
 * Frame-rate independent smoothing factor for exponential damping.
 * `stiffness` ~ 1/time-constant; higher = snappier.
 */
export function dampFactor(stiffness: number, dt: number): number {
  return 1 - Math.exp(-stiffness * dt);
}
