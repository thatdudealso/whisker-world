/**
 * Chapter 1 - Whimsical Whisperleaf Glowing Forest.
 *
 * This is a code-built art pass rather than a greybox: rounded clay terraces,
 * faceted moss stones, layered tree canopies, real mushroom caps, fireflies,
 * and warm emissive landmarks share one soft night palette. Collision remains
 * in forestLayout.ts so the playable footprint stays easy to test.
 */
import * as THREE from "three";
import type { AabbObstacle } from "../../core/math";
import type { SpawnPose } from "../../entities/cats/locomotion";
import type { ObjectiveId } from "../../systems/objectives";
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

const NIGHT_SKY = 0x101b2a;
const DEEP_MOSS = 0x1b382f;
const MINT_GLOW = 0x9ce7bd;
const TEAL_GLOW = 0x66d8c5;
const VIOLET_GLOW = 0xb87cff;
const WARM_LANTERN = 0xffc477;

export interface ForestChapter {
  readonly obstacles: readonly AabbObstacle[];
  readonly spawn: SpawnPose;
  update(dt: number, activeObjective: ObjectiveId | null): void;
}

function softMaterial(color: THREE.ColorRepresentation, options: { emissive?: THREE.ColorRepresentation; emissiveIntensity?: number; opacity?: number } = {}): THREE.MeshStandardMaterial {
  const parameters: THREE.MeshStandardMaterialParameters = {
    color,
    roughness: 0.92,
    metalness: 0,
    flatShading: false,
    emissive: options.emissive,
    emissiveIntensity: options.emissiveIntensity,
    transparent: options.opacity !== undefined,
    opacity: options.opacity,
  };
  if (options.emissive === undefined) delete parameters.emissive;
  if (options.emissiveIntensity === undefined) delete parameters.emissiveIntensity;
  if (options.opacity === undefined) delete parameters.opacity;
  return new THREE.MeshStandardMaterial(parameters);
}

function addMesh(
  scene: THREE.Scene | THREE.Group,
  geometry: THREE.BufferGeometry,
  meshMaterial: THREE.Material,
  position: THREE.Vector3,
  scale?: THREE.Vector3,
): THREE.Mesh {
  const mesh = new THREE.Mesh(geometry, meshMaterial);
  mesh.position.copy(position);
  if (scale) mesh.scale.copy(scale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

function createRoundedPrism(spec: BoxSpec, meshMaterial: THREE.Material): THREE.Mesh {
  const halfX = spec.sizeX / 2;
  const halfZ = spec.sizeZ / 2;
  const radius = Math.min(0.22, halfX * 0.28, halfZ * 0.28);
  const shape = new THREE.Shape();
  shape.moveTo(-halfX + radius, -halfZ);
  shape.lineTo(halfX - radius, -halfZ);
  shape.quadraticCurveTo(halfX, -halfZ, halfX, -halfZ + radius);
  shape.lineTo(halfX, halfZ - radius);
  shape.quadraticCurveTo(halfX, halfZ, halfX - radius, halfZ);
  shape.lineTo(-halfX + radius, halfZ);
  shape.quadraticCurveTo(-halfX, halfZ, -halfX, halfZ - radius);
  shape.lineTo(-halfX, -halfZ + radius);
  shape.quadraticCurveTo(-halfX, -halfZ, -halfX + radius, -halfZ);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: spec.height,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: Math.min(0.12, radius * 0.55),
    bevelThickness: Math.min(0.1, spec.height * 0.16),
    curveSegments: 3,
  });
  geometry.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geometry, meshMaterial);
  mesh.position.set(spec.centerX, 0, spec.centerZ);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function addStarTrail(
  scene: THREE.Scene,
  from: { x: number; z: number },
  to: { x: number; z: number },
  count: number,
  color: THREE.ColorRepresentation,
): void {
  const dotGeometry = new THREE.SphereGeometry(0.1, 8, 6);
  const dotMaterial = softMaterial(color, { emissive: color, emissiveIntensity: 1.4 });
  for (let index = 0; index < count; index += 1) {
    const t = (index + 0.5) / count;
    const wobble = Math.sin(t * Math.PI * 2.4) * 0.34;
    addMesh(
      scene,
      dotGeometry,
      dotMaterial,
      new THREE.Vector3(
        from.x + (to.x - from.x) * t + wobble,
        0.09 + Math.sin(t * Math.PI) * 0.04,
        from.z + (to.z - from.z) * t,
      ),
    );
  }
}

function addTree(scene: THREE.Scene, spec: (typeof TREE_TRUNKS)[number], trunkMaterial: THREE.Material, leafMaterial: THREE.Material, leafLightMaterial: THREE.Material): void {
  const tree = new THREE.Group();
  tree.position.set(spec.x, 0, spec.z);
  const trunk = addMesh(tree, new THREE.CylinderGeometry(spec.radius * 0.78, spec.radius, spec.height, 10), trunkMaterial, new THREE.Vector3(0, spec.height / 2, 0), new THREE.Vector3(1, 1, 0.9));
  trunk.rotation.z = Math.sin(spec.x * 1.7) * 0.045;
  addMesh(tree, new THREE.SphereGeometry(spec.radius * 1.5, 12, 8), trunkMaterial, new THREE.Vector3(0, 0.3, 0), new THREE.Vector3(1.4, 0.32, 1.1));
  const canopyY = spec.height * 0.74;
  addMesh(tree, new THREE.IcosahedronGeometry(spec.radius * 2.15, 1), leafMaterial, new THREE.Vector3(0, canopyY, 0), new THREE.Vector3(1.45, 0.9, 1.1));
  addMesh(tree, new THREE.IcosahedronGeometry(spec.radius * 1.6, 1), leafLightMaterial, new THREE.Vector3(-spec.radius * 1.15, canopyY - 0.48, 0.22), new THREE.Vector3(1.15, 0.72, 0.9));
  addMesh(tree, new THREE.IcosahedronGeometry(spec.radius * 1.7, 1), leafMaterial, new THREE.Vector3(spec.radius * 1.05, canopyY - 0.2, -0.2), new THREE.Vector3(1.1, 0.82, 0.95));
  scene.add(tree);
}

function addMushroom(scene: THREE.Scene, spec: (typeof GLOW_MUSHROOMS)[number], stemMaterial: THREE.Material, capMaterial: THREE.Material, spotMaterial: THREE.Material): void {
  const capRadius = spec.radius * 1.72;
  const capScaleY = spec.hoppable ? 0.38 : 0.62;
  const capHeight = capRadius * capScaleY;
  const stemHeight = Math.max(spec.height - capHeight, 0.08);
  const stemRadius = spec.radius * 0.52;
  const stemLength = Math.max(stemHeight - stemRadius * 2, 0.02);
  addMesh(scene, new THREE.CapsuleGeometry(stemRadius, stemLength, 5, 8), stemMaterial, new THREE.Vector3(spec.x, stemHeight / 2, spec.z));
  const cap = addMesh(scene, new THREE.SphereGeometry(capRadius, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), capMaterial, new THREE.Vector3(spec.x, spec.height - capHeight, spec.z), new THREE.Vector3(1, capScaleY, 1));
  cap.rotation.y = spec.x * 0.3;
  for (let index = 0; index < 3; index += 1) {
    const angle = index * (Math.PI * 2 / 3) + spec.x;
    addMesh(
      scene,
      new THREE.SphereGeometry(spec.radius * 0.16, 8, 6),
      spotMaterial,
      new THREE.Vector3(
        spec.x + Math.cos(angle) * capRadius * 0.55,
        spec.height - capHeight * 0.18 + Math.sin(angle * 2) * 0.02,
        spec.z + Math.sin(angle) * capRadius * 0.55,
      ),
    );
  }
}

function addFlowerCluster(scene: THREE.Scene, x: number, z: number, color: THREE.ColorRepresentation): void {
  const stemMaterial = softMaterial(0x5d9060);
  const flowerMaterial = softMaterial(color, { emissive: color, emissiveIntensity: 0.35 });
  for (let index = 0; index < 3; index += 1) {
    const offset = index - 1;
    addMesh(scene, new THREE.CylinderGeometry(0.018, 0.025, 0.35, 5), stemMaterial, new THREE.Vector3(x + offset * 0.12, 0.18, z + Math.sin(index) * 0.1));
    addMesh(scene, new THREE.SphereGeometry(0.075, 8, 6), flowerMaterial, new THREE.Vector3(x + offset * 0.12, 0.38, z + Math.sin(index) * 0.1));
  }
}

function addMarker(scene: THREE.Scene, position: THREE.Vector3, color: THREE.ColorRepresentation): THREE.Group {
  const group = new THREE.Group();
  group.position.copy(position);
  const ring = addMesh(group, new THREE.TorusGeometry(0.62, 0.045, 8, 28), softMaterial(color, { emissive: color, emissiveIntensity: 1.3 }), new THREE.Vector3(0, 0, 0));
  ring.rotation.x = Math.PI / 2;
  addMesh(group, new THREE.CylinderGeometry(0.028, 0.07, 1.35, 8), softMaterial(color, { emissive: color, emissiveIntensity: 1.1, opacity: 0.36 }), new THREE.Vector3(0, 0.68, 0));
  addMesh(group, new THREE.SphereGeometry(0.13, 10, 8), softMaterial(0xffffff, { emissive: color, emissiveIntensity: 1.8 }), new THREE.Vector3(0, 1.42, 0));
  scene.add(group);
  return group;
}

export function buildForestChapter1(scene: THREE.Scene): ForestChapter {
  scene.background = new THREE.Color(NIGHT_SKY);
  scene.fog = new THREE.FogExp2(NIGHT_SKY, 0.021);

  const hemi = new THREE.HemisphereLight(0x7287ad, 0x182c24, 2.35);
  scene.add(hemi);
  const moon = new THREE.DirectionalLight(0xb6c8ee, 1.5);
  moon.position.set(-8, 14, -7);
  moon.castShadow = true;
  moon.shadow.mapSize.set(1024, 1024);
  moon.shadow.camera.left = -24;
  moon.shadow.camera.right = 24;
  moon.shadow.camera.top = 24;
  moon.shadow.camera.bottom = -24;
  scene.add(moon);

  const ground = addMesh(scene, new THREE.CircleGeometry(FOREST_GROUND_RADIUS, 96), softMaterial(DEEP_MOSS), new THREE.Vector3(0, -0.04, 0));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;

  // Low moss mounds break up the ground plane without becoming collision
  // geometry. Their repeating soft forms establish the handcrafted world.
  const moundMaterial = softMaterial(0x2b513d);
  for (const mound of [
    [-7, 7, 2.4, 0.25], [6, 7, 2.8, 0.3], [-8, -2, 2.6, 0.22], [8, -7, 3.2, 0.3], [0, 9, 3.8, 0.25],
    [-12, 11, 2.4, 0.18], [12, -11, 2.8, 0.2],
  ] as const) {
    addMesh(scene, new THREE.SphereGeometry(1, 14, 8), moundMaterial, new THREE.Vector3(mound[0], mound[3], mound[1]), new THREE.Vector3(mound[2], 0.24, mound[2] * 0.85));
  }

  const stoneMaterial = softMaterial(0x516878);
  const stoneLightMaterial = softMaterial(0x789080);
  for (const spec of PATH_ROCKS) {
    addMesh(scene, new THREE.IcosahedronGeometry(0.62, 1), stoneMaterial, new THREE.Vector3(spec.centerX, spec.height * 0.35, spec.centerZ), new THREE.Vector3(spec.sizeX / 1.15, spec.height / 1.1, spec.sizeZ / 1.15));
    addMesh(scene, new THREE.SphereGeometry(0.2, 8, 6), stoneLightMaterial, new THREE.Vector3(spec.centerX - spec.sizeX * 0.2, spec.height * 0.68, spec.centerZ - spec.sizeZ * 0.18), new THREE.Vector3(1.4, 0.35, 0.7));
  }

  const stepMaterial = softMaterial(0x426453);
  const stepTopMaterial = softMaterial(0x5e8064);
  for (const spec of OVERLOOK_STEPS) {
    scene.add(createRoundedPrism(spec, stepMaterial));
    addMesh(scene, new THREE.SphereGeometry(0.35, 10, 6), stepTopMaterial, new THREE.Vector3(spec.centerX - spec.sizeX * 0.25, spec.height + 0.04, spec.centerZ + spec.sizeZ * 0.16), new THREE.Vector3(1.8, 0.12, 0.9));
  }

  const spawnRing = addMesh(scene, new THREE.TorusGeometry(0.95, 0.08, 10, 36), softMaterial(0x356c57, { emissive: MINT_GLOW, emissiveIntensity: 1.3 }), new THREE.Vector3(FOREST_SPAWN.x, 0.04, FOREST_SPAWN.z));
  spawnRing.rotation.x = Math.PI / 2;
  addMesh(scene, new THREE.TorusGeometry(0.68, 0.025, 8, 32), softMaterial(0xf4d28b, { emissive: WARM_LANTERN, emissiveIntensity: 0.75 }), new THREE.Vector3(FOREST_SPAWN.x, 0.06, FOREST_SPAWN.z)).rotation.x = Math.PI / 2;
  const spawnLight = new THREE.PointLight(MINT_GLOW, 5.5, 10, 2);
  spawnLight.position.set(FOREST_SPAWN.x, 1.4, FOREST_SPAWN.z - 0.8);
  scene.add(spawnLight);

  // Rift crystal cluster: collision is the shared layout footprint; the art
  // is three irregular crystals around a softly glowing fissure.
  const crackShape = new THREE.Shape();
  crackShape.moveTo(-1.7, -0.22);
  crackShape.lineTo(-0.4, -0.08);
  crackShape.lineTo(0.1, -0.42);
  crackShape.lineTo(1.6, -0.12);
  crackShape.lineTo(0.55, 0.2);
  crackShape.lineTo(-0.1, 0.42);
  crackShape.closePath();
  const crack = addMesh(scene, new THREE.ShapeGeometry(crackShape), softMaterial(0x24133a, { emissive: VIOLET_GLOW, emissiveIntensity: 0.65 }), new THREE.Vector3(RIFT_SHARD.centerX, 0.025, RIFT_SHARD.centerZ));
  crack.rotation.x = -Math.PI / 2;
  const riftCrystalMaterial = softMaterial(0x5b2a78, { emissive: VIOLET_GLOW, emissiveIntensity: 1.5 });
  const riftCrystals: THREE.Mesh[] = [];
  for (const crystal of [
    [0, 1.2, 0, 0.55], [-0.47, 0.62, 0.22, 0.35], [0.46, 0.7, -0.2, 0.32],
  ] as const) {
    const mesh = addMesh(scene, new THREE.ConeGeometry(crystal[3], crystal[1], 5), riftCrystalMaterial, new THREE.Vector3(RIFT_SHARD.centerX + crystal[0], crystal[1] / 2, RIFT_SHARD.centerZ + crystal[2]), new THREE.Vector3(0.82, 1, 0.82));
    mesh.rotation.z = crystal[0] * 0.35;
    riftCrystals.push(mesh);
  }
  const riftLight = new THREE.PointLight(VIOLET_GLOW, 9, 13, 2);
  riftLight.position.set(RIFT_SHARD.centerX, 2.1, RIFT_SHARD.centerZ);
  scene.add(riftLight);

  const stemMaterial = softMaterial(0x6b5874);
  const capMaterial = softMaterial(0x326d69, { emissive: TEAL_GLOW, emissiveIntensity: 1.2 });
  const spotMaterial = softMaterial(0xa4efd4, { emissive: TEAL_GLOW, emissiveIntensity: 1.35 });
  for (const spec of GLOW_MUSHROOMS) addMushroom(scene, spec, stemMaterial, capMaterial, spotMaterial);
  const glowA = new THREE.PointLight(TEAL_GLOW, 6.5, 11, 2);
  glowA.position.set(GLOW_MUSHROOMS[1].x, GLOW_MUSHROOMS[1].height + 0.6, GLOW_MUSHROOMS[1].z);
  scene.add(glowA);
  const glowB = new THREE.PointLight(TEAL_GLOW, 6.5, 11, 2);
  glowB.position.set(GLOW_MUSHROOMS[5].x, GLOW_MUSHROOMS[5].height + 0.6, GLOW_MUSHROOMS[5].z);
  scene.add(glowB);

  const trunkMaterial = softMaterial(0x273d3c);
  const leafMaterial = softMaterial(0x245046);
  const leafLightMaterial = softMaterial(0x3e7560);
  for (const spec of TREE_TRUNKS) addTree(scene, spec, trunkMaterial, leafMaterial, leafLightMaterial);

  addStarTrail(scene, { x: 1.5, z: -4.5 }, { x: -1, z: -10.2 }, 8, MINT_GLOW);
  addStarTrail(scene, { x: 5.5, z: 0.5 }, { x: 11.2, z: 2.2 }, 10, WARM_LANTERN);
  addFlowerCluster(scene, -3.1, 2.4, 0xf2c1d1);
  addFlowerCluster(scene, 3.8, -3.3, 0xf5d17a);
  addFlowerCluster(scene, 7.6, 5.1, 0x9ed8ef);
  addFlowerCluster(scene, -7.2, 1.2, 0xc9b5ef);

  // A small, unlit firefly constellation adds depth without another light.
  const fireflyMaterial = softMaterial(0xffe9a4, { emissive: 0xffd36a, emissiveIntensity: 2.1 });
  const fireflyGroup = new THREE.Group();
  for (let index = 0; index < 18; index += 1) {
    const angle = index * 2.41;
    const radius = 3.5 + (index % 5) * 2.1;
    addMesh(fireflyGroup, new THREE.SphereGeometry(0.035, 6, 4), fireflyMaterial, new THREE.Vector3(Math.cos(angle) * radius, 1.6 + (index % 4) * 0.55, Math.sin(angle) * radius - 2));
  }
  scene.add(fireflyGroup);

  const markers: Record<ObjectiveId, THREE.Group> = {
    overlook: addMarker(scene, new THREE.Vector3(-1, 2.8, -11.5), MINT_GLOW),
    rift: addMarker(scene, new THREE.Vector3(RIFT_SHARD.centerX, 0, RIFT_SHARD.centerZ), VIOLET_GLOW),
    return: addMarker(scene, new THREE.Vector3(FOREST_SPAWN.x, 0, FOREST_SPAWN.z), WARM_LANTERN),
  };

  return {
    obstacles: forestObstacles(),
    spawn: FOREST_SPAWN,
    update(dt, activeObjective) {
      riftCrystals.forEach((crystal, index) => {
        crystal.rotation.y += dt * (0.45 + index * 0.12);
        crystal.position.y += Math.sin(performance.now() * 0.0015 + index) * dt * 0.04;
      });
      fireflyGroup.position.y = Math.sin(performance.now() * 0.0008) * 0.12;
      for (const [id, marker] of Object.entries(markers) as [ObjectiveId, THREE.Group][]) {
        marker.visible = activeObjective === id;
        marker.rotation.y += dt * 0.22;
        marker.scale.setScalar(1 + Math.sin(performance.now() * 0.003 + id.length) * 0.055);
      }
    },
  };
}
