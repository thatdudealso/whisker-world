/**
 * PlayerController: owns the greybox cat mesh and the pure locomotion state.
 * Each frame it feeds the input snapshot into `stepLocomotion` and applies
 * the resulting position / yaw to the mesh group.
 */
import * as THREE from "three";
import type { AabbObstacle } from "../../core/math";
import { createCatPlaceholder } from "./catPlaceholder";
import {
  createLocomotionState,
  stepLocomotion,
  DEFAULT_TUNING,
  type LocomotionInput,
  type LocomotionState,
  type PlayerTuning,
} from "./locomotion";

export class PlayerController {
  readonly group: THREE.Group;
  private readonly state: LocomotionState;
  private readonly tuning: PlayerTuning;

  constructor(tuning: PlayerTuning = DEFAULT_TUNING) {
    this.group = createCatPlaceholder();
    this.state = createLocomotionState();
    this.tuning = tuning;
  }

  update(dt: number, input: LocomotionInput, obstacles: readonly AabbObstacle[]): void {
    stepLocomotion(this.state, input, obstacles, this.tuning, dt);
    this.group.position.set(this.state.x, this.state.y, this.state.z);
    this.group.rotation.y = this.state.yaw;
  }

  /** Feet position, for the camera to follow. */
  get position(): THREE.Vector3 {
    return this.group.position;
  }
}
