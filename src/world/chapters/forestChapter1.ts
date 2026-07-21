/**
 * Chapter 1 - Whimsical Glowing Forest (WW-D2): greybox scene builder.
 *
 * Colored primitives + a few glow lights only; no clay/toon assets yet.
 * The chapter owns the scene mood (background, fog, all lights) so swapping
 * chapters swaps the whole atmosphere. Layout data and the obstacle list come
 * from the pure `forestLayout` module.
 *
 * Light budget (laptop-friendly): 1 hemisphere + 1 directional moon +
 * 4 distance-limited point glows. Everything else glows via emissive
 * materials, shared per prop group.
 */
import * as THREE from "three";
import type { AabbObstacle } from "../../core/math";
import type { SpawnPose } from "../../entities/cats/locomotion";
import {
  FOREST_GROUND_RADIUS,
  FOREST_SPAWN,
  GLOW_MUSHROOMS,
  OVERLOOK_STEPS,
  PATH_ROCKS,
  RIFT_SHARD,
  TREE_TRUNKS,
  forestObstacles,
  type BoxSpec,
} from "./forestLayout";

const NIGHT_SKY = 0x0a1020;
const MINT_GLOW = 0x7fe8c8;
const TEAL_GLOW = 0x37d0c4;
const VIOLET_GLOW = 0x9b4dff;

export interface ForestChapter {
  readonly obstacles: readonly AabbObstacle[];
  readonly spawn: SpawnPose;
}

function addBox(
  scene: THREE.Scene,
  spec: BoxSpec,
  material: THREE.Material,
): void {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(spec.sizeX, spec.height, spec.sizeZ),
    material,
  );
  mesh.position.set(spec.centerX, spec.height / 2, spec.centerZ);
  scene.add(mesh);
}

/** Small unlit dots tracing a "starlight trail" between two points. */
function addStarTrail(
  scene: THREE.Scene,
  from: { x: number; z: number },
  to: { x: number; z: number },
  count: number,
): void {
  const dotGeometry = new THREE.SphereGeometry(0.08, 6, 4);
  const dotMaterial = new THREE.MeshBasicMaterial({ color: MINT_GLOW });
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const dot = new THREE.Mesh(dotGeometry, dotMaterial);
    // Slight sine wobble so the trail meanders instead of ruler-lining.
    const wobble = Math.sin(t * Math.PI * 2) * 0.4;
    dot.position.set(
      from.x + (to.x - from.x) * t + wobble,
      0.06,
      from.z + (to.z - from.z) * t,
    );
    scene.add(dot);
  }
}

export function buildForestChapter1(scene: THREE.Scene): ForestChapter {
  // --- Mood: deep night-blue sky, matching exponential fog for depth.
  scene.background = new THREE.Color(NIGHT_SKY);
  scene.fog = new THREE.FogExp2(NIGHT_SKY, 0.025);

  // Intensities tuned for readability at night: the cat and prop silhouettes
  // must stay clear against the fog (see PLAYTEST forest checklist).
  const hemi = new THREE.HemisphereLight(0x54679c, 0x1c2f26, 2.2);
  scene.add(hemi);
  const moon = new THREE.DirectionalLight(0x8fb3ff, 1.1);
  moon.position.set(-6, 12, -4);
  scene.add(moon);

  // --- Forest floor: dark moss disc matching the circular bounds clamp.
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(FOREST_GROUND_RADIUS, 48),
    new THREE.MeshStandardMaterial({ color: 0x182b26 }),
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // --- Spawn marker: glowing ring in the safe clearing + soft mint light.
  const spawnRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.9, 0.07, 8, 32),
    new THREE.MeshStandardMaterial({
      color: 0x1a3a32,
      emissive: MINT_GLOW,
      emissiveIntensity: 1.2,
    }),
  );
  spawnRing.rotation.x = -Math.PI / 2;
  spawnRing.position.set(FOREST_SPAWN.x, 0.03, FOREST_SPAWN.z);
  scene.add(spawnRing);
  const spawnLight = new THREE.PointLight(MINT_GLOW, 6, 10, 2);
  spawnLight.position.set(FOREST_SPAWN.x, 1.5, FOREST_SPAWN.z - 1);
  scene.add(spawnLight);

  // --- Overlook terrace: mossy stone steps up to the north viewpoint.
  const stepMaterial = new THREE.MeshStandardMaterial({ color: 0x2e4a3f });
  for (const spec of OVERLOOK_STEPS) {
    addBox(scene, spec, stepMaterial);
  }

  // --- Rift crack: violet shard over a dark ground crack, plus glow light.
  const shard = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.7),
    new THREE.MeshStandardMaterial({
      color: 0x2a1040,
      emissive: VIOLET_GLOW,
      emissiveIntensity: 1.6,
    }),
  );
  shard.scale.set(1, RIFT_SHARD.height / 1.4, 1);
  shard.position.set(RIFT_SHARD.centerX, RIFT_SHARD.height / 2, RIFT_SHARD.centerZ);
  shard.rotation.y = Math.PI / 5;
  scene.add(shard);
  const crack = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 0.9),
    new THREE.MeshStandardMaterial({
      color: 0x120820,
      emissive: VIOLET_GLOW,
      emissiveIntensity: 0.35,
    }),
  );
  crack.rotation.x = -Math.PI / 2;
  crack.rotation.z = Math.PI / 7;
  crack.position.set(RIFT_SHARD.centerX, 0.02, RIFT_SHARD.centerZ);
  scene.add(crack);
  const riftLight = new THREE.PointLight(VIOLET_GLOW, 10, 12, 2);
  riftLight.position.set(RIFT_SHARD.centerX, 2, RIFT_SHARD.centerZ);
  scene.add(riftLight);

  // --- Bioluminescent mushrooms: muted stems, glowing caps. Two of them
  // carry real point lights; the rest glow by emissive material alone.
  const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3b5c });
  const capMaterial = new THREE.MeshStandardMaterial({
    color: 0x0e2b28,
    emissive: TEAL_GLOW,
    emissiveIntensity: 1.3,
  });
  for (const spec of GLOW_MUSHROOMS) {
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(spec.radius * 0.8, spec.radius, spec.height, 10),
      stemMaterial,
    );
    stem.position.set(spec.x, spec.height / 2, spec.z);
    scene.add(stem);
    const capRadius = spec.radius * 1.6;
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(capRadius, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      capMaterial,
    );
    if (spec.hoppable) {
      const flatScale = (spec.radius * 0.9) / capRadius;
      cap.scale.set(flatScale, 0.14, flatScale);
    }
    cap.position.set(spec.x, spec.height, spec.z);
    scene.add(cap);
  }
  const glowA = new THREE.PointLight(TEAL_GLOW, 7, 11, 2);
  glowA.position.set(GLOW_MUSHROOMS[1].x, GLOW_MUSHROOMS[1].height + 0.5, GLOW_MUSHROOMS[1].z);
  scene.add(glowA);
  const glowB = new THREE.PointLight(TEAL_GLOW, 7, 11, 2);
  glowB.position.set(GLOW_MUSHROOMS[5].x, GLOW_MUSHROOMS[5].height + 0.5, GLOW_MUSHROOMS[5].z);
  scene.add(glowB);

  // --- Rim trunks: dark silhouettes fading into the fog.
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x131c22 });
  for (const spec of TREE_TRUNKS) {
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(spec.radius * 0.85, spec.radius, spec.height, 8),
      trunkMaterial,
    );
    trunk.position.set(spec.x, spec.height / 2, spec.z);
    scene.add(trunk);
  }

  // --- Path rocks: slate boulders ringing the clearing (gaps = routes).
  const rockMaterial = new THREE.MeshStandardMaterial({ color: 0x3a4656 });
  for (const spec of PATH_ROCKS) {
    addBox(scene, spec, rockMaterial);
  }

  // --- Starlight trails: dotted guidance toward the two landmarks.
  addStarTrail(scene, { x: 1.5, z: -4.5 }, { x: 2, z: -7 }, 5);
  addStarTrail(scene, { x: 5.5, z: 0.5 }, { x: 11, z: 2.2 }, 8);

  return { obstacles: forestObstacles(), spawn: FOREST_SPAWN };
}
