/**
 * Pure locomotion model for the player cat.
 *
 * One `stepLocomotion` call advances position / velocity / yaw / grounded by
 * dt seconds. No three.js imports: the same code runs in the render loop and
 * in unit tests, so the motion feel is verifiable without a browser.
 *
 * Model notes (greybox kinematic controller - Rapier can replace later):
 * - Horizontal velocity approaches a target (input * speed cap) at a constant
 *   rate: `acceleration` when input is held, `deceleration` when released.
 *   This is the "not ice-skating, not tank-sticky" band.
 * - Gravity pulls vy down; the cat lands on the ground plane or on top of
 *   greybox blocks (AABB footprints). Single jump only, while grounded.
 * - Blocks push the cat out sideways (circle vs AABB) while its feet are
 *   below the block top; at/above the top they act as platforms instead.
 * - World bounds are a circle clamp matching the greybox ground size.
 */
import {
  clampToCircle,
  length2,
  moveTowards2,
  resolveCircleVsAabb,
  turnTowards,
  type AabbObstacle,
  type Vec2,
} from "../../core/math";

export interface PlayerTuning {
  /** Max horizontal speed, m/s. */
  walkSpeed: number;
  /** Max horizontal speed while sprint held, m/s. */
  sprintSpeed: number;
  /** Approach rate toward target velocity while input held, m/s^2. */
  acceleration: number;
  /** Approach rate toward zero velocity when input released, m/s^2. */
  deceleration: number;
  /** Initial vertical speed on jump, m/s. */
  jumpSpeed: number;
  /** Downward acceleration, m/s^2 (snappier than real 9.8 on purpose). */
  gravity: number;
  /** Playable radius from origin, m (greybox ground is 40x40). */
  boundsRadius: number;
  /** Player footprint radius for wall collision, m. */
  bodyRadius: number;
  /** Max yaw change per second when turning to face movement, rad/s. */
  turnSpeed: number;
}

export const DEFAULT_TUNING: PlayerTuning = {
  walkSpeed: 4.5,
  sprintSpeed: 7,
  // ~0.2s to full walk speed, ~0.23s to stop: responsive but not snappy.
  acceleration: 26,
  deceleration: 20,
  // apex = jumpSpeed^2 / (2*gravity) ~= 1.17m; airtime ~= 0.72s.
  jumpSpeed: 6.5,
  gravity: 18,
  // Ground plane is 40x40 (half-extent 20); keep a 1m margin.
  boundsRadius: 19,
  bodyRadius: 0.35,
  turnSpeed: 12,
};

export interface LocomotionState {
  /** Feet position (y = height of the surface the cat stands on). */
  x: number;
  y: number;
  z: number;
  vx: number;
  vz: number;
  vy: number;
  /** Facing yaw (rad). Local +Z is "forward" for the placeholder mesh. */
  yaw: number;
  grounded: boolean;
}

export interface LocomotionInput {
  /** Normalized move intent (or zero vector). */
  move: Vec2;
  sprint: boolean;
  /** Edge-triggered: true only on the frame the jump key went down. */
  jump: boolean;
}

export function createLocomotionState(): LocomotionState {
  return { x: 0, y: 0, z: 0, vx: 0, vz: 0, vy: 0, yaw: 0, grounded: true };
}

/**
 * Highest support surface under (x, z): the ground plane (0), or the top of
 * any block whose footprint contains the point. A block counts when its top
 * is at/below the feet *at frame start* (`prevY`, plus a small step-up
 * tolerance) - so a falling cat lands on the top it crossed this frame,
 * while a cat walking at the base is never teleported up.
 */
export function supportHeightAt(
  pos: Vec2,
  prevY: number,
  obstacles: readonly AabbObstacle[],
  bodyRadius: number,
): number {
  // Allow the footprint to overhang a little before the cat falls off.
  const edge = bodyRadius * 0.5;
  const stepUp = 0.05;
  let support = 0;
  for (const box of obstacles) {
    const withinX = pos.x >= box.minX - edge && pos.x <= box.maxX + edge;
    const withinZ = pos.z >= box.minZ - edge && pos.z <= box.maxZ + edge;
    if (withinX && withinZ && box.top <= prevY + stepUp) {
      support = Math.max(support, box.top);
    }
  }
  return support;
}

/**
 * Push the cat out of any block sides it overlaps. Only applies while the
 * feet *at frame start* (`prevY`) are below the block top (small skin
 * epsilon); at/above the top, the block is a platform, not a wall - so a
 * cat descending onto a top is never ejected sideways by its own landing.
 */
export function resolveObstacleSides(
  pos: Vec2,
  prevY: number,
  obstacles: readonly AabbObstacle[],
  bodyRadius: number,
): Vec2 {
  const skin = 0.02;
  let out = pos;
  for (const box of obstacles) {
    if (prevY >= box.top - skin) {
      continue;
    }
    const resolved = resolveCircleVsAabb(out, bodyRadius, box);
    if (resolved) {
      out = resolved;
    }
  }
  return out;
}

/** Advance the locomotion state by dt seconds. Mutates and returns `state`. */
export function stepLocomotion(
  state: LocomotionState,
  input: LocomotionInput,
  obstacles: readonly AabbObstacle[],
  tuning: PlayerTuning,
  dt: number,
): LocomotionState {
  // --- Horizontal velocity: approach target at a constant rate.
  const hasInput = length2(input.move) > 1e-4;
  const cap = input.sprint ? tuning.sprintSpeed : tuning.walkSpeed;
  const target: Vec2 = hasInput
    ? { x: input.move.x * cap, z: input.move.z * cap }
    : { x: 0, z: 0 };
  const rate = (hasInput ? tuning.acceleration : tuning.deceleration) * dt;
  const vel = moveTowards2({ x: state.vx, z: state.vz }, target, rate);
  state.vx = vel.x;
  state.vz = vel.z;

  // --- Facing: turn toward actual travel direction once moving.
  const speed = length2({ x: state.vx, z: state.vz });
  if (speed > 0.1) {
    const targetYaw = Math.atan2(state.vx, state.vz);
    state.yaw = turnTowards(state.yaw, targetYaw, tuning.turnSpeed * dt);
  }

  // --- Jump: only from the ground, one jump per landing.
  if (input.jump && state.grounded) {
    state.vy = tuning.jumpSpeed;
    state.grounded = false;
  }

  // --- Gravity.
  if (!state.grounded) {
    state.vy -= tuning.gravity * dt;
  }

  // --- Integrate position (remember foot height at frame start: collision
  // and support both reason about where the feet *were*, so a fast fall
  // lands on a block top instead of clipping into its side).
  const prevY = state.y;
  state.x += state.vx * dt;
  state.z += state.vz * dt;
  state.y += state.vy * dt;

  // --- Collide: block side push-out, then world bounds clamp.
  const afterSides = resolveObstacleSides(
    { x: state.x, z: state.z },
    prevY,
    obstacles,
    tuning.bodyRadius,
  );
  const afterBounds = clampToCircle(afterSides, tuning.boundsRadius);
  state.x = afterBounds.x;
  state.z = afterBounds.z;

  // --- Vertical support: land on ground or on block tops.
  const support = supportHeightAt(
    { x: state.x, z: state.z },
    prevY,
    obstacles,
    tuning.bodyRadius,
  );
  if (state.y <= support) {
    state.y = support;
    state.vy = 0;
    state.grounded = true;
  } else if (state.y > support + 1e-3) {
    // Walked off an edge or still rising/falling.
    state.grounded = false;
  }

  return state;
}
