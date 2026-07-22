/**
 * Chapter 1 - Whimsical Whisperleaf Glowing Forest.
 *
 * This is a code-built art pass rather than a greybox: rounded clay-toon
 * terraces, faceted moss stones, layered tree canopies, real mushroom caps,
 * a faceted Rift crystal cluster, fireflies, and warm emissive landmarks
 * share one warm night palette, lit with real shadows and finished with a
 * bloom pass in main.ts. Collision remains in forestLayout.ts so the
 * playable footprint stays easy to test.
 */
import * as THREE from "three";
import type { AabbObstacle } from "../../core/math";
import type { SpawnPose } from "../../entities/cats/locomotion";
import type { ObjectiveId } from "../../systems/objectives";
import { createGroundTexture } from "../groundTexture";
import { clayMaterial, facetMaterial } from "../materials";
import {
  FOREST_GROUND_RADIUS,
  FOREST_SPAWN,
  GLOW_MUSHROOMS,
  MUSHROOM_CAP_SCALE,
  OVERLOOK_STEPS,
  PATH_ROCKS,
  RIFT_SHARD,
  TREE_TRUNKS,
  forestObstacles,
  type BoxSpec,
} from "./forestLayout";

const NIGHT_SKY = 0x18293c;
const FOG_COLOR = 0x24384e;
const MINT_GLOW = 0x9ce7bd;
const TEAL_GLOW = 0x66d8c5;
const VIOLET_GLOW = 0xb87cff;
const WARM_LANTERN = 0xffc477;

export interface ForestChapter {
  readonly obstacles: readonly AabbObstacle[];
  readonly spawn: SpawnPose;
  update(dt: number, activeObjective: ObjectiveId | null): void;
}

function addMesh(
  scene: THREE.Scene | THREE.Group,
  geometry: THREE.BufferGeometry,
  meshMaterial: THREE.Material | THREE.Material[],
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

/**
 * Rounded, two-tone terrace slab: a mossy cap (material index 0, the
 * extrude's front/back caps) over a darker bark-toned side wall (index 1).
 * A generous bevel keeps it reading as a sculpted step, not a stacked box.
 */
function createRoundedPrism(spec: BoxSpec, sideMaterial: THREE.Material, capMaterial: THREE.Material): THREE.Mesh {
  const halfX = spec.sizeX / 2;
  const halfZ = spec.sizeZ / 2;
  const radius = Math.min(0.5, halfX * 0.4, halfZ * 0.4);
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
    bevelSegments: 6,
    bevelSize: Math.min(0.22, radius * 0.85),
    bevelThickness: Math.min(0.22, spec.height * 0.22),
    curveSegments: 8,
  });
  geometry.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geometry, [capMaterial, sideMaterial]);
  mesh.position.set(spec.centerX, 0, spec.centerZ);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** A tiny cluster of blade-like tufts, planted along a terrace edge. */
function addGrassTuft(scene: THREE.Scene, x: number, z: number, y: number, material: THREE.Material): void {
  const bladeCount = 3;
  for (let i = 0; i < bladeCount; i += 1) {
    const angle = (i / bladeCount) * Math.PI * 2 + Math.random() * 0.6;
    const height = 0.16 + Math.random() * 0.1;
    const blade = addMesh(
      scene,
      new THREE.ConeGeometry(0.035, height, 4),
      material,
      new THREE.Vector3(x + Math.cos(angle) * 0.05, y + height / 2, z + Math.sin(angle) * 0.05),
    );
    blade.rotation.z = Math.cos(angle) * 0.3;
    blade.rotation.x = Math.sin(angle) * 0.3;
  }
}

function addTerraceFringe(scene: THREE.Scene, spec: BoxSpec, material: THREE.Material): void {
  const halfX = spec.sizeX / 2;
  const halfZ = spec.sizeZ / 2;
  const corners: Array<[number, number]> = [
    [-halfX * 0.82, -halfZ * 0.82],
    [halfX * 0.82, -halfZ * 0.4],
    [-halfX * 0.4, halfZ * 0.82],
    [halfX * 0.7, halfZ * 0.7],
  ];
  for (const [ox, oz] of corners) {
    addGrassTuft(scene, spec.centerX + ox, spec.centerZ + oz, spec.height, material);
  }
}

function addStarTrail(
  scene: THREE.Scene,
  from: { x: number; z: number },
  to: { x: number; z: number },
  count: number,
  color: THREE.ColorRepresentation,
): readonly THREE.Mesh[] {
  const dotGeometry = new THREE.SphereGeometry(0.11, 8, 6);
  const dots: THREE.Mesh[] = [];
  for (let index = 0; index < count; index += 1) {
    const t = (index + 0.5) / count;
    const wobble = Math.sin(t * Math.PI * 2.4) * 0.34;
    const dot = addMesh(
      scene,
      dotGeometry,
      clayMaterial(color, { emissive: color, emissiveIntensity: 1.6 }),
      new THREE.Vector3(
        from.x + (to.x - from.x) * t + wobble,
        0.09 + Math.sin(t * Math.PI) * 0.04,
        from.z + (to.z - from.z) * t,
      ),
    );
    dots.push(dot);
  }
  return dots;
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
  const capRadius = spec.radius * MUSHROOM_CAP_SCALE;
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
  const stemMaterial = clayMaterial(0x5d9060);
  const flowerMaterial = clayMaterial(color, { emissive: color, emissiveIntensity: 0.5 });
  for (let index = 0; index < 3; index += 1) {
    const offset = index - 1;
    addMesh(scene, new THREE.CylinderGeometry(0.018, 0.025, 0.35, 5), stemMaterial, new THREE.Vector3(x + offset * 0.12, 0.18, z + Math.sin(index) * 0.1));
    addMesh(scene, new THREE.SphereGeometry(0.075, 8, 6), flowerMaterial, new THREE.Vector3(x + offset * 0.12, 0.38, z + Math.sin(index) * 0.1));
  }
}

function addMarker(scene: THREE.Scene, position: THREE.Vector3, color: THREE.ColorRepresentation): THREE.Group {
  const group = new THREE.Group();
  group.position.copy(position);
  const ring = addMesh(group, new THREE.TorusGeometry(0.62, 0.045, 8, 28), clayMaterial(color, { emissive: color, emissiveIntensity: 1.4 }), new THREE.Vector3(0, 0, 0));
  ring.rotation.x = Math.PI / 2;
  addMesh(group, new THREE.CylinderGeometry(0.028, 0.07, 1.35, 8), clayMaterial(color, { emissive: color, emissiveIntensity: 1.2, opacity: 0.36 }), new THREE.Vector3(0, 0.68, 0));
  addMesh(group, new THREE.SphereGeometry(0.13, 10, 8), clayMaterial(0xffffff, { emissive: color, emissiveIntensity: 2 }), new THREE.Vector3(0, 1.42, 0));
  scene.add(group);
  return group;
}

/** Faceted crystal shard: an elongated flat-shaded gem, not a smooth cone. */
function addRiftCrystal(scene: THREE.Scene, position: THREE.Vector3, scaleY: number, material: THREE.Material): THREE.Mesh {
  const mesh = addMesh(
    scene,
    new THREE.IcosahedronGeometry(0.42, 0),
    material,
    position,
    new THREE.Vector3(0.62, scaleY, 0.62),
  );
  mesh.rotation.set(Math.random() * 0.4, Math.random() * Math.PI, Math.random() * 0.4);
  return mesh;
}

export function buildForestChapter1(scene: THREE.Scene): ForestChapter {
  scene.background = new THREE.Color(NIGHT_SKY);
  scene.fog = new THREE.FogExp2(FOG_COLOR, 0.017);

  const hemi = new THREE.HemisphereLight(0x9fb4d8, 0x2f4f3e, 2.6);
  scene.add(hemi);
  const moon = new THREE.DirectionalLight(0xcfe0ff, 1.85);
  moon.position.set(-8, 14, -7);
  moon.castShadow = true;
  moon.shadow.mapSize.set(2048, 2048);
  moon.shadow.camera.left = -24;
  moon.shadow.camera.right = 24;
  moon.shadow.camera.top = 24;
  moon.shadow.camera.bottom = -24;
  moon.shadow.camera.near = 1;
  moon.shadow.camera.far = 45;
  moon.shadow.bias = -0.0018;
  moon.shadow.radius = 2.4;
  scene.add(moon);

  // Warm rim fill from the opposite side keeps shadowed faces from crushing
  // to pure black - a cheap, shadowless "second light" for a friendlier read.
  const fill = new THREE.DirectionalLight(0xffb37a, 0.4);
  fill.position.set(10, 7, 9);
  scene.add(fill);

  // `map` is a multiplier on `color`: keep the base color white so the
  // painted moss texture carries its own tones instead of being crushed
  // toward black by a second dark multiply.
  const ground = addMesh(
    scene,
    new THREE.CircleGeometry(FOREST_GROUND_RADIUS, 96),
    clayMaterial(0xffffff, { map: createGroundTexture() }),
    new THREE.Vector3(0, -0.04, 0),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;

  // Low moss mounds break up the ground plane without becoming collision
  // geometry. Their repeating soft forms establish the handcrafted world.
  const moundMaterial = clayMaterial(0x2b513d);
  for (const mound of [
    [-7, 7, 2.4, 0.25], [6, 7, 2.8, 0.3], [-8, -2, 2.6, 0.22], [8, -7, 3.2, 0.3], [0, 9, 3.8, 0.25],
    [-12, 11, 2.4, 0.18], [12, -11, 2.8, 0.2],
  ] as const) {
    addMesh(scene, new THREE.SphereGeometry(1, 14, 8), moundMaterial, new THREE.Vector3(mound[0], mound[3], mound[1]), new THREE.Vector3(mound[2], 0.24, mound[2] * 0.85));
  }

  // Faceted moss stones: flat-shaded so the facets actually read as facets.
  const stoneMaterial = facetMaterial(0x5c7264);
  const stoneMossMaterial = facetMaterial(0x7c9a72);
  for (const spec of PATH_ROCKS) {
    addMesh(scene, new THREE.IcosahedronGeometry(0.62, 0), stoneMaterial, new THREE.Vector3(spec.centerX, spec.height * 0.35, spec.centerZ), new THREE.Vector3(spec.sizeX / 1.15, spec.height / 1.1, spec.sizeZ / 1.15));
    addMesh(scene, new THREE.IcosahedronGeometry(0.2, 0), stoneMossMaterial, new THREE.Vector3(spec.centerX - spec.sizeX * 0.2, spec.height * 0.68, spec.centerZ - spec.sizeZ * 0.18), new THREE.Vector3(1.4, 0.5, 0.9));
  }

  const stepSideMaterial = clayMaterial(0x3c5a45);
  const stepCapMaterial = clayMaterial(0x649268);
  const tuftMaterial = clayMaterial(0x4d7a55);
  for (const spec of OVERLOOK_STEPS) {
    scene.add(createRoundedPrism(spec, stepSideMaterial, stepCapMaterial));
    addTerraceFringe(scene, spec, tuftMaterial);
  }

  const spawnRing = addMesh(scene, new THREE.TorusGeometry(0.95, 0.08, 10, 36), clayMaterial(0x356c57, { emissive: MINT_GLOW, emissiveIntensity: 1.5 }), new THREE.Vector3(FOREST_SPAWN.x, 0.04, FOREST_SPAWN.z));
  spawnRing.rotation.x = Math.PI / 2;
  addMesh(scene, new THREE.TorusGeometry(0.68, 0.025, 8, 32), clayMaterial(0xf4d28b, { emissive: WARM_LANTERN, emissiveIntensity: 0.9 }), new THREE.Vector3(FOREST_SPAWN.x, 0.06, FOREST_SPAWN.z)).rotation.x = Math.PI / 2;
  const spawnLight = new THREE.PointLight(MINT_GLOW, 4.2, 10, 2);
  spawnLight.position.set(FOREST_SPAWN.x, 1.4, FOREST_SPAWN.z - 0.8);
  scene.add(spawnLight);

  // Rift crystal cluster: collision is the shared layout footprint; the art
  // is a faceted gem cluster around a softly glowing ground fissure.
  const crackShape = new THREE.Shape();
  crackShape.moveTo(-1.7, -0.22);
  crackShape.lineTo(-0.4, -0.08);
  crackShape.lineTo(0.1, -0.42);
  crackShape.lineTo(1.6, -0.12);
  crackShape.lineTo(0.55, 0.2);
  crackShape.lineTo(-0.1, 0.42);
  crackShape.closePath();
  const crack = addMesh(scene, new THREE.ShapeGeometry(crackShape), clayMaterial(0x24133a, { emissive: VIOLET_GLOW, emissiveIntensity: 0.8 }), new THREE.Vector3(RIFT_SHARD.centerX, 0.025, RIFT_SHARD.centerZ));
  crack.rotation.x = -Math.PI / 2;
  const riftCrystalMaterial = facetMaterial(0x6b3a8c, { emissive: VIOLET_GLOW, emissiveIntensity: 1.7 });
  const riftCrystals: THREE.Mesh[] = [
    addRiftCrystal(scene, new THREE.Vector3(RIFT_SHARD.centerX, 1.1, RIFT_SHARD.centerZ), 2.6, riftCrystalMaterial),
    addRiftCrystal(scene, new THREE.Vector3(RIFT_SHARD.centerX - 0.5, 0.62, RIFT_SHARD.centerZ + 0.24), 1.6, riftCrystalMaterial),
    addRiftCrystal(scene, new THREE.Vector3(RIFT_SHARD.centerX + 0.48, 0.72, RIFT_SHARD.centerZ - 0.2), 1.8, riftCrystalMaterial),
    addRiftCrystal(scene, new THREE.Vector3(RIFT_SHARD.centerX + 0.1, 0.42, RIFT_SHARD.centerZ + 0.5), 1.1, riftCrystalMaterial),
  ];
  const riftLight = new THREE.PointLight(VIOLET_GLOW, 7, 13, 2);
  riftLight.position.set(RIFT_SHARD.centerX, 2.1, RIFT_SHARD.centerZ);
  scene.add(riftLight);

  const stemMaterial = clayMaterial(0x6b5874);
  const capMaterial = clayMaterial(0x326d69, { emissive: TEAL_GLOW, emissiveIntensity: 1.4 });
  const spotMaterial = clayMaterial(0xa4efd4, { emissive: TEAL_GLOW, emissiveIntensity: 1.6 });
  for (const spec of GLOW_MUSHROOMS) addMushroom(scene, spec, stemMaterial, capMaterial, spotMaterial);
  const glowA = new THREE.PointLight(TEAL_GLOW, 4.6, 11, 2);
  glowA.position.set(GLOW_MUSHROOMS[1].x, GLOW_MUSHROOMS[1].height + 0.6, GLOW_MUSHROOMS[1].z);
  scene.add(glowA);
  const glowB = new THREE.PointLight(TEAL_GLOW, 4.6, 11, 2);
  glowB.position.set(GLOW_MUSHROOMS[5].x, GLOW_MUSHROOMS[5].height + 0.6, GLOW_MUSHROOMS[5].z);
  scene.add(glowB);

  const trunkMaterial = clayMaterial(0x2d4640);
  const leafMaterial = clayMaterial(0x286654);
  const leafLightMaterial = clayMaterial(0x468a6d);
  for (const spec of TREE_TRUNKS) addTree(scene, spec, trunkMaterial, leafMaterial, leafLightMaterial);

  const starTrailA = addStarTrail(scene, { x: 1.5, z: -4.5 }, { x: -1, z: -10.2 }, 8, MINT_GLOW);
  const starTrailB = addStarTrail(scene, { x: 5.5, z: 0.5 }, { x: 11.2, z: 2.2 }, 10, WARM_LANTERN);
  const starTrails = [...starTrailA, ...starTrailB];
  addFlowerCluster(scene, -3.1, 2.4, 0xf2c1d1);
  addFlowerCluster(scene, 3.8, -3.3, 0xf5d17a);
  addFlowerCluster(scene, 7.6, 5.1, 0x9ed8ef);
  addFlowerCluster(scene, -7.2, 1.2, 0xc9b5ef);

  // A small, unlit firefly constellation adds depth without another light.
  const fireflyMaterial = clayMaterial(0xffe9a4, { emissive: 0xffd36a, emissiveIntensity: 2.4 });
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
      starTrails.forEach((dot, index) => {
        const twinkle = 0.75 + Math.sin(performance.now() * 0.003 + index * 1.7) * 0.25;
        dot.scale.setScalar(twinkle);
      });
      for (const [id, marker] of Object.entries(markers) as [ObjectiveId, THREE.Group][]) {
        marker.visible = activeObjective === id;
        marker.rotation.y += dt * 0.22;
        marker.scale.setScalar(1 + Math.sin(performance.now() * 0.003 + id.length) * 0.055);
      }
    },
  };
}
