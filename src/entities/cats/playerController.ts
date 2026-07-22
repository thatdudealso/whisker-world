/**
 * PlayerController: owns the clay-toon cat mesh and the pure locomotion state.
 * Each frame it feeds the input snapshot into `stepLocomotion` and applies
 * the resulting position / yaw to the mesh group.
 *
 * The controller reads the active roster entry (colors, accessory marker,
 * small tuning deltas); swapping cats re-skins the same group in place so
 * position, velocity, and camera follow are preserved mid-run.
 *
 * `group` carries the *logical* transform the camera and collision reason
 * about (feet position, facing yaw) and must stay exactly what
 * `stepLocomotion` computes. All "juice" - landing squash, jump stretch,
 * turn lean, tail sway, trot bob - is layered onto the child `modelRoot`
 * instead, so cosmetic animation can never desync gameplay state.
 */
import * as THREE from "three";
import { angleDelta, clamp, dampFactor, length2, type AabbObstacle } from "../../core/math";
import { DEFAULT_CAT_ID, getCat, tuningFor, type CatDefinition } from "../../content/cats";
import { applyCatAppearance, type CatParts } from "./catPlaceholder";
import {
  createLocomotionState,
  stepLocomotion,
  type LocomotionInput,
  type LocomotionState,
  type PlayerTuning,
  type SpawnPose,
} from "./locomotion";

/** One frame's worth of feel events, for the caller to hook audio/particles into. */
export interface PlayerFrameEvents {
  jumped: boolean;
  landed: boolean;
  /** 0 (soft) - 1 (hard) landing impact, only meaningful when `landed`. */
  landImpact: number;
}

const BOB_FREQUENCY = 6.4;
const BOB_AMPLITUDE = 0.05;
const LEG_LIFT = 0.09;
const SQUASH_STIFFNESS = 11;
const LEAN_STIFFNESS = 9;
const TAIL_SWAY_BASE = 1.6;

export class PlayerController {
  readonly group: THREE.Group;
  private readonly modelRoot: THREE.Group;
  private readonly state: LocomotionState;
  private tuning: PlayerTuning;
  private parts: CatParts | null = null;

  private bobPhase = 0;
  private tailPhase = 0;
  private squashY = 1;
  private squashXZ = 1;
  private lean = 0;
  private prevYaw = 0;

  constructor(
    cat: CatDefinition = getCat(DEFAULT_CAT_ID),
    spawn?: SpawnPose,
  ) {
    this.group = new THREE.Group();
    this.modelRoot = new THREE.Group();
    this.group.add(this.modelRoot);
    applyCatAppearance(this.modelRoot, cat);
    this.parts = (this.modelRoot.userData.parts as CatParts | undefined) ?? null;
    this.state = createLocomotionState(spawn);
    this.tuning = tuningFor(cat);
    this.group.position.set(this.state.x, this.state.y, this.state.z);
    this.group.rotation.y = this.state.yaw;
    this.prevYaw = this.state.yaw;
  }

  /** Swap to another roster cat: rebuild the model, apply its tuning. */
  setCat(cat: CatDefinition): void {
    applyCatAppearance(this.modelRoot, cat);
    this.parts = (this.modelRoot.userData.parts as CatParts | undefined) ?? null;
    this.tuning = tuningFor(cat);
  }

  update(dt: number, input: LocomotionInput, obstacles: readonly AabbObstacle[]): PlayerFrameEvents {
    const prevGrounded = this.state.grounded;
    const prevVy = this.state.vy;

    stepLocomotion(this.state, input, obstacles, this.tuning, dt);
    this.group.position.set(this.state.x, this.state.y, this.state.z);
    this.group.rotation.y = this.state.yaw;

    const jumped = input.jump && prevGrounded;
    const landed = !prevGrounded && this.state.grounded;
    const landImpact = landed ? clamp(Math.abs(prevVy) / this.tuning.jumpSpeed, 0, 1) : 0;

    this.updateJuice(dt, jumped, landed, landImpact);

    return { jumped, landed, landImpact };
  }

  private updateJuice(dt: number, jumped: boolean, landed: boolean, landImpact: number): void {
    const speed = length2({ x: this.state.vx, z: this.state.vz });
    const speedRatio = clamp(speed / this.tuning.walkSpeed, 0, 1);

    if (jumped) {
      this.squashY = 1.26;
      this.squashXZ = 0.85;
    }
    if (landed) {
      this.squashY = 1 - 0.32 * landImpact;
      this.squashXZ = 1 + 0.24 * landImpact;
    }
    const squashRelax = dampFactor(SQUASH_STIFFNESS, dt);
    this.squashY += (1 - this.squashY) * squashRelax;
    this.squashXZ += (1 - this.squashXZ) * squashRelax;
    this.modelRoot.scale.set(this.squashXZ, this.squashY, this.squashXZ);

    // Turn lean: bank into the turn like a small critter cornering hard.
    const turnRate = clamp(angleDelta(this.prevYaw, this.state.yaw) / Math.max(dt, 1e-4), -6, 6);
    this.prevYaw = this.state.yaw;
    const targetLean = clamp(-turnRate * 0.05, -0.22, 0.22) * (this.state.grounded ? speedRatio : 0.4);
    this.lean += (targetLean - this.lean) * dampFactor(LEAN_STIFFNESS, dt);
    this.modelRoot.rotation.z = this.lean;

    // Bob + trot: only while grounded and actually moving.
    if (this.state.grounded && speedRatio > 0.02) {
      this.bobPhase += dt * BOB_FREQUENCY * (0.6 + speedRatio * 0.8);
    }
    const bobY = this.state.grounded ? Math.sin(this.bobPhase) * BOB_AMPLITUDE * speedRatio : 0;
    this.modelRoot.position.y = bobY;

    this.tailPhase += dt * (TAIL_SWAY_BASE + speedRatio * 2.2);
    const parts = this.parts;
    if (parts) {
      parts.tail.rotation.y = Math.sin(this.tailPhase) * 0.14;
      parts.tail.rotation.x = Math.cos(this.tailPhase * 0.7) * 0.06;
      for (const ear of parts.ears) {
        ear.rotation.x = Math.sin(this.tailPhase * 1.3 + ear.position.x) * 0.05;
      }
      for (const leg of parts.legs) {
        const lift = this.state.grounded && speedRatio > 0.05
          ? Math.max(0, Math.sin(this.bobPhase + leg.phase)) * LEG_LIFT * speedRatio
          : 0;
        leg.leg.position.y = leg.baseY + lift;
        leg.paw.position.y = leg.pawBaseY + lift;
      }
    }
  }

  /** Return the cat to a chapter spawn for a fresh run or replay. */
  reset(spawn?: SpawnPose): void {
    const next = createLocomotionState(spawn);
    Object.assign(this.state, next);
    this.group.position.set(this.state.x, this.state.y, this.state.z);
    this.group.rotation.y = this.state.yaw;
    this.prevYaw = this.state.yaw;
    this.bobPhase = 0;
    this.tailPhase = 0;
    this.squashY = 1;
    this.squashXZ = 1;
    this.lean = 0;
    this.modelRoot.position.set(0, 0, 0);
    this.modelRoot.scale.set(1, 1, 1);
    this.modelRoot.rotation.set(0, 0, 0);
  }

  /** Feet position, for the camera to follow. */
  get position(): THREE.Vector3 {
    return this.group.position;
  }
}

