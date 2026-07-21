/**
 * Greybox world: ground plane, orientation grid, and a handful of blocks.
 * Blocks double as collision obstacles (AABB) so wall push-out and
 * jump-on-top are demonstrable before real art or physics lands.
 */
import * as THREE from "three";
import type { AabbObstacle } from "../core/math";

export const GROUND_SIZE = 40;

interface BlockSpec {
  centerX: number;
  centerZ: number;
  sizeX: number;
  sizeZ: number;
  height: number;
  color: number;
}

// A loose course: two hoppable steps, one too-tall wall, one long platform.
const BLOCKS: readonly BlockSpec[] = [
  { centerX: 3, centerZ: -3, sizeX: 2, sizeZ: 2, height: 0.6, color: 0x5a6a8a },
  { centerX: 6, centerZ: -5.5, sizeX: 2, sizeZ: 2, height: 1.1, color: 0x5a6a8a },
  { centerX: -5, centerZ: -4, sizeX: 1.5, sizeZ: 1.5, height: 2.2, color: 0x7a5a6a },
  { centerX: -2, centerZ: 5, sizeX: 5, sizeZ: 1.6, height: 0.8, color: 0x6a7a5a },
];

export interface GreyboxWorld {
  readonly obstacles: readonly AabbObstacle[];
}

export function buildGreyboxWorld(scene: THREE.Scene): GreyboxWorld {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE),
    new THREE.MeshStandardMaterial({ color: 0x3d4a3a }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const grid = new THREE.GridHelper(GROUND_SIZE, GROUND_SIZE, 0x555555, 0x333333);
  grid.position.y = 0.01;
  scene.add(grid);

  const obstacles: AabbObstacle[] = BLOCKS.map((spec) => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(spec.sizeX, spec.height, spec.sizeZ),
      new THREE.MeshStandardMaterial({ color: spec.color }),
    );
    mesh.position.set(spec.centerX, spec.height / 2, spec.centerZ);
    scene.add(mesh);
    return {
      minX: spec.centerX - spec.sizeX / 2,
      maxX: spec.centerX + spec.sizeX / 2,
      minZ: spec.centerZ - spec.sizeZ / 2,
      maxZ: spec.centerZ + spec.sizeZ / 2,
      top: spec.height,
    };
  });

  return { obstacles };
}
