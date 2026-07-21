/**
 * PlayerController: owns the clay-toon cat mesh and the pure locomotion state.
 * Each frame it feeds the input snapshot into `stepLocomotion` and applies
 * the resulting position / yaw to the mesh group.
 *
 * The controller reads the active roster entry (colors, accessory marker,
 * small tuning deltas); swapping cats re-skins the same group in place so
 * position, velocity, and camera follow are preserved mid-run.
 */
import * as THREE from "three";
import type { AabbObstacle } from "../../core/math";
import { DEFAULT_CAT_ID, getCat, tuningFor, type CatDefinition } from "../../content/cats";
import { applyCatAppearance, createCatModel } from "./catPlaceholder";
import {
  createLocomotionState,
  stepLocomotion,
  type LocomotionInput,
  type LocomotionState,
  type PlayerTuning,
  type SpawnPose,
} from "./locomotion";

export class PlayerController {
  readonly group: THREE.Group;
  private readonly state: LocomotionState;
  private tuning: PlayerTuning;

  constructor(
    cat: CatDefinition = getCat(DEFAULT_CAT_ID),
    spawn?: SpawnPose,
  ) {
    this.group = createCatModel(cat);
    this.state = createLocomotionState(spawn);
    this.tuning = tuningFor(cat);
    this.group.position.set(this.state.x, this.state.y, this.state.z);
    this.group.rotation.y = this.state.yaw;
  }

  /** Swap to another roster cat: rebuild the model, apply its tuning. */
  setCat(cat: CatDefinition): void {
    applyCatAppearance(this.group, cat);
    this.tuning = tuningFor(cat);
  }

  update(dt: number, input: LocomotionInput, obstacles: readonly AabbObstacle[]): void {
    stepLocomotion(this.state, input, obstacles, this.tuning, dt);
    this.group.position.set(this.state.x, this.state.y, this.state.z);
    this.group.rotation.y = this.state.yaw;
  }

  /** Return the cat to a chapter spawn for a fresh run or replay. */
  reset(spawn?: SpawnPose): void {
    const next = createLocomotionState(spawn);
    Object.assign(this.state, next);
    this.group.position.set(this.state.x, this.state.y, this.state.z);
    this.group.rotation.y = this.state.yaw;
  }

  /** Feet position, for the camera to follow. */
  get position(): THREE.Vector3 {
    return this.group.position;
  }
}
