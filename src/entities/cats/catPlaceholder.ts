/**
 * Hand-authored clay-toon cat factory.
 *
 * The geometry is deliberately simple, but the silhouette is not: four
 * planted legs, a long body, pointed ears, eyes, whiskers, a big raised tail,
 * and a readable accessory kit make each roster entry unmistakably feline at
 * the third-person gameplay distance - including from directly behind, where
 * the tail and ears carry the read. Every mesh owns its resources so a
 * roster swap can safely rebuild the model in place.
 *
 * `applyCatAppearance` stashes animatable parts on `group.userData.parts` so
 * `PlayerController` can layer idle/locomotion juice (tail sway, ear flick,
 * leg bob) onto a purely cosmetic transform without touching gameplay state.
 */
import * as THREE from "three";
import { clayMaterial } from "../../world/materials";

export interface CatAppearance {
  bodyColor: string;
  accentColor: string;
  accessories?: readonly string[];
  id?: string;
}

export interface CatLeg {
  leg: THREE.Mesh;
  paw: THREE.Mesh;
  baseY: number;
  pawBaseY: number;
  phase: number;
}

export interface CatParts {
  tail: THREE.Mesh;
  ears: readonly THREE.Mesh[];
  legs: readonly CatLeg[];
}

function addMesh(
  group: THREE.Group,
  geometry: THREE.BufferGeometry,
  meshMaterial: THREE.Material,
  position: THREE.Vector3,
  scale?: THREE.Vector3,
): THREE.Mesh {
  const mesh = new THREE.Mesh(geometry, meshMaterial);
  mesh.position.copy(position);
  if (scale) {
    mesh.scale.copy(scale);
  }
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

function addCylinderBetween(
  group: THREE.Group,
  start: THREE.Vector3,
  end: THREE.Vector3,
  radius: number,
  meshMaterial: THREE.Material,
): void {
  const direction = end.clone().sub(start);
  const mesh = addMesh(
    group,
    new THREE.CylinderGeometry(radius, radius * 0.9, direction.length(), 6),
    meshMaterial,
    start.clone().add(end).multiplyScalar(0.5),
  );
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
}

function addStarBadge(group: THREE.Group, color: string): void {
  const shape = new THREE.Shape();
  const points = 10;
  for (let index = 0; index < points; index += 1) {
    const angle = -Math.PI / 2 + (index / points) * Math.PI * 2;
    const radius = index % 2 === 0 ? 0.13 : 0.055;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (index === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const badge = addMesh(
    group,
    new THREE.ShapeGeometry(shape),
    clayMaterial(color, { emissive: color, emissiveIntensity: 0.5 }),
    new THREE.Vector3(0, 0.84, 0.68),
  );
  badge.rotation.x = -Math.PI / 2;
  badge.rotation.z = Math.PI;
}

function addAccessories(group: THREE.Group, appearance: CatAppearance, body: THREE.Color): void {
  const accent = clayMaterial(appearance.accentColor);
  const pale = clayMaterial(body.clone().lerp(new THREE.Color(0xffffff), 0.48));
  const tags = appearance.accessories ?? [];

  // Every cat carries a soft scarf collar. The trailing end gives the player
  // a clear facing cue even when the cat is moving through dark foliage.
  addMesh(
    group,
    new THREE.TorusGeometry(0.39, 0.07, 8, 18),
    accent,
    new THREE.Vector3(0, 1.1, 0.03),
  ).rotation.x = Math.PI / 2;
  const scarfTail = addMesh(
    group,
    new THREE.CapsuleGeometry(0.08, 0.36, 4, 8),
    accent,
    new THREE.Vector3(0.27, 1.02, 0.3),
    new THREE.Vector3(0.75, 0.7, 0.9),
  );
  scarfTail.rotation.x = -0.22;

  if (tags.some((tag) => tag.includes("satchel") || tag.includes("pouch"))) {
    addMesh(
      group,
      new THREE.SphereGeometry(0.23, 12, 8),
      accent,
      new THREE.Vector3(-0.47, 0.64, -0.16),
      new THREE.Vector3(0.7, 0.95, 0.9),
    );
    const strap = addMesh(
      group,
      new THREE.TorusGeometry(0.43, 0.027, 6, 18, Math.PI * 1.1),
      pale,
      new THREE.Vector3(0, 0.86, -0.02),
    );
    strap.rotation.x = Math.PI / 2;
    strap.rotation.z = Math.PI / 2;
  }

  if (tags.some((tag) => tag.includes("goggles"))) {
    const lensMaterial = clayMaterial(0x263d51, { emissive: 0x3a86ff, emissiveIntensity: 0.4 });
    for (const x of [-0.18, 0.18]) {
      addMesh(
        group,
        new THREE.TorusGeometry(0.115, 0.035, 8, 16),
        accent,
        new THREE.Vector3(x, 1.48, 0.46),
      );
      addMesh(
        group,
        new THREE.CircleGeometry(0.085, 12),
        lensMaterial,
        new THREE.Vector3(x, 1.48, 0.461),
      ).rotation.y = Math.PI;
    }
    addCylinderBetween(
      group,
      new THREE.Vector3(-0.12, 1.48, 0.46),
      new THREE.Vector3(0.12, 1.48, 0.46),
      0.025,
      accent,
    );
  }

  if (tags.some((tag) => tag.includes("bell"))) {
    addMesh(
      group,
      new THREE.SphereGeometry(0.09, 10, 8),
      clayMaterial(0xf2c14e, { emissive: 0xf2c14e, emissiveIntensity: 0.35 }),
      new THREE.Vector3(0, 1.05, 0.42),
    );
  }

  if (tags.some((tag) => tag.includes("star"))) {
    addStarBadge(group, appearance.accentColor);
  }

  if (tags.some((tag) => tag.includes("armor"))) {
    for (const x of [-0.33, 0.33]) {
      addMesh(
        group,
        new THREE.SphereGeometry(0.14, 10, 7),
        accent,
        new THREE.Vector3(x, 0.98, -0.02),
        new THREE.Vector3(1.15, 0.55, 0.85),
      );
    }
  }
}

export function disposeCat(group: THREE.Group): void {
  group.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.geometry.dispose();
    if (Array.isArray(object.material)) {
      for (const meshMaterial of object.material) meshMaterial.dispose();
    } else {
      object.material.dispose();
    }
  });
  group.clear();
  delete group.userData.parts;
}

/** Apply a complete model to an existing player group. */
export function applyCatAppearance(group: THREE.Group, appearance: CatAppearance): void {
  disposeCat(group);

  const bodyColor = new THREE.Color(appearance.bodyColor);
  const headColor = bodyColor.clone().lerp(new THREE.Color(0xffffff), 0.16);
  const muzzleColor = bodyColor.clone().lerp(new THREE.Color(0xffffff), 0.42);
  const bellyColor = bodyColor.clone().lerp(new THREE.Color(0xffffff), 0.58);
  const bodyMaterial = clayMaterial(bodyColor);
  const headMaterial = clayMaterial(headColor);
  const muzzleMaterial = clayMaterial(muzzleColor);
  const bellyMaterial = clayMaterial(bellyColor);
  const innerEarMaterial = clayMaterial(bodyColor.clone().lerp(new THREE.Color(0xffb6b6), 0.32));

  const bodyScale = appearance.id === "blaze"
    ? new THREE.Vector3(1.12, 0.86, 1.14)
    : appearance.id === "dash"
      ? new THREE.Vector3(0.88, 0.78, 1.22)
      : new THREE.Vector3(0.95, 0.8, 1.16);

  addMesh(
    group,
    new THREE.SphereGeometry(0.56, 16, 12),
    bodyMaterial,
    new THREE.Vector3(0, 0.64, -0.04),
    bodyScale,
  );
  // Lighter underbelly/chest patch: a small, shared clay-cat feature (not a
  // per-character restyle) that keeps the round body sphere from reading as
  // a featureless blob at gameplay distance.
  addMesh(
    group,
    new THREE.SphereGeometry(0.4, 12, 8),
    bellyMaterial,
    new THREE.Vector3(0, 0.48, 0.28),
    new THREE.Vector3(0.62, 0.46, 0.6),
  );
  addMesh(
    group,
    new THREE.SphereGeometry(0.46, 16, 12),
    headMaterial,
    new THREE.Vector3(0, 1.34, 0.3),
    new THREE.Vector3(1, 0.96, 1.02),
  );

  // Legs use rounded capsules rather than floating pegs. Their broad feet
  // and slight stance are intentionally readable from the follow camera.
  // Each leg keeps its own phase so PlayerController can bob diagonal pairs
  // out of sync for a cheap trot cycle (no bones needed).
  const legs: CatLeg[] = [];
  for (const x of [-0.27, 0.27]) {
    for (const z of [-0.29, 0.29]) {
      const baseY = 0.34;
      const pawBaseY = 0.13;
      const leg = addMesh(
        group,
        new THREE.CapsuleGeometry(0.12, 0.34, 5, 8),
        bodyMaterial,
        new THREE.Vector3(x, baseY, z),
        new THREE.Vector3(0.92, 1, 0.88),
      );
      const paw = addMesh(
        group,
        new THREE.SphereGeometry(0.135, 10, 7),
        muzzleMaterial,
        new THREE.Vector3(x, pawBaseY, z + 0.045),
        new THREE.Vector3(1, 0.58, 1.18),
      );
      // Diagonal pairs (front-left/back-right vs front-right/back-left)
      // share a phase so the trot reads as alternating support, not a hop.
      const phase = (x < 0) === (z < 0) ? 0 : Math.PI;
      legs.push({ leg, paw, baseY, pawBaseY, phase });
    }
  }

  // Ears are pointed low-poly cones with inner clay inserts, which makes the
  // head silhouette read as a cat even from directly behind in silhouette.
  const ears: THREE.Mesh[] = [];
  for (const x of [-0.22, 0.22]) {
    const ear = addMesh(
      group,
      new THREE.ConeGeometry(0.19, 0.52, 4),
      headMaterial,
      new THREE.Vector3(x, 1.79, 0.24),
      new THREE.Vector3(1, 1, 0.8),
    );
    addMesh(
      group,
      new THREE.ConeGeometry(0.1, 0.26, 4),
      innerEarMaterial,
      new THREE.Vector3(x, 1.81, 0.29),
      new THREE.Vector3(1, 1, 0.55),
    );
    ears.push(ear);
  }

  // Muzzle, nose, bright eyes, and tiny eye glints establish a forward face.
  addMesh(group, new THREE.SphereGeometry(0.23, 12, 8), muzzleMaterial, new THREE.Vector3(0, 1.25, 0.68), new THREE.Vector3(1.1, 0.72, 0.72));
  addMesh(group, new THREE.SphereGeometry(0.07, 8, 6), clayMaterial(0x4b2430), new THREE.Vector3(0, 1.29, 0.85));
  const eyeMaterial = clayMaterial(0x17202a);
  const glintMaterial = clayMaterial(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.8 });
  for (const x of [-0.17, 0.17]) {
    addMesh(group, new THREE.SphereGeometry(0.105, 10, 8), eyeMaterial, new THREE.Vector3(x, 1.47, 0.67), new THREE.Vector3(0.82, 1.1, 0.42));
    addMesh(group, new THREE.SphereGeometry(0.026, 6, 6), glintMaterial, new THREE.Vector3(x - 0.025, 1.51, 0.71));
  }
  const whiskerMaterial = clayMaterial(0xf4ead8);
  for (const side of [-1, 1]) {
    for (let index = 0; index < 2; index += 1) {
      addCylinderBetween(
        group,
        new THREE.Vector3(side * 0.17, 1.26 + index * 0.06, 0.83),
        new THREE.Vector3(side * (0.5 + index * 0.035), 1.27 + index * 0.08, 0.89),
        0.012,
        whiskerMaterial,
      );
    }
  }

  // Big curved tube tail rises well above the shoulder line, so it is the
  // primary "this is a cat" cue when the follow camera only sees the back.
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.64, -0.5),
    new THREE.Vector3(0, 0.95, -0.98),
    new THREE.Vector3(0.34, 1.32, -1.18),
    new THREE.Vector3(0.5, 1.66, -0.9),
  ]);
  const tail = addMesh(group, new THREE.TubeGeometry(tailCurve, 20, 0.135, 8, false), bodyMaterial, new THREE.Vector3(0, 0, 0));
  addMesh(
    group,
    new THREE.SphereGeometry(0.15, 10, 8),
    muzzleMaterial,
    tailCurve.getPointAt(1),
    new THREE.Vector3(1, 1, 1),
  );

  if (appearance.id === "willow") {
    const fluff = clayMaterial(bodyColor.clone().lerp(new THREE.Color(0xffffff), 0.2));
    for (const position of [
      new THREE.Vector3(-0.45, 0.76, -0.16),
      new THREE.Vector3(0.45, 0.76, -0.16),
      new THREE.Vector3(0, 0.5, -0.52),
    ]) {
      addMesh(group, new THREE.IcosahedronGeometry(0.2, 1), fluff, position, new THREE.Vector3(1.1, 0.75, 1));
    }
  }

  addAccessories(group, appearance, bodyColor);
  group.userData.catId = appearance.id;
  const parts: CatParts = { tail, ears, legs };
  group.userData.parts = parts;
}
