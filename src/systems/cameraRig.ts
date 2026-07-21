/**
 * Third-person follow camera.
 *
 * The camera chases a desired position (player + rotated offset) with
 * exponential damping, and looks at a separately damped point just above the
 * cat. Result: a soft cinematic lag that never snaps and never loses the cat.
 * Q / E slowly orbits the offset around the player (optional, cheap).
 */
import * as THREE from "three";
import { dampFactor } from "../core/math";

const OFFSET_DISTANCE = 7.5;
const OFFSET_HEIGHT = 4.5;
const LOOK_AT_HEIGHT = 0.9;
/** ~0.2s time constant on position: readable lag without nausea. */
const POSITION_STIFFNESS = 5;
/** Look target settles faster than the body so framing stays stable. */
const LOOK_STIFFNESS = 9;
const ORBIT_SPEED = 1.6; // rad/s while Q/E held

export class CameraRig {
  readonly camera: THREE.PerspectiveCamera;
  private orbitYaw = 0;
  private readonly smoothedLook = new THREE.Vector3();
  private initialized = false;

  constructor(aspect: number) {
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 200);
  }

  setAspect(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  /** Follow `focus` (player feet). `orbit` is -1, 0, or +1 (Q/E). */
  update(dt: number, focus: THREE.Vector3, orbit: number): void {
    this.orbitYaw += orbit * ORBIT_SPEED * dt;

    const desired = new THREE.Vector3(
      focus.x + Math.sin(this.orbitYaw) * OFFSET_DISTANCE,
      focus.y + OFFSET_HEIGHT,
      focus.z + Math.cos(this.orbitYaw) * OFFSET_DISTANCE,
    );

    if (!this.initialized) {
      // Start framed correctly instead of swooping in from the origin.
      this.camera.position.copy(desired);
      this.smoothedLook.set(focus.x, focus.y + LOOK_AT_HEIGHT, focus.z);
      this.initialized = true;
    }

    this.camera.position.lerp(desired, dampFactor(POSITION_STIFFNESS, dt));
    this.smoothedLook.lerp(
      new THREE.Vector3(focus.x, focus.y + LOOK_AT_HEIGHT, focus.z),
      dampFactor(LOOK_STIFFNESS, dt),
    );
    this.camera.lookAt(this.smoothedLook);
  }
}
