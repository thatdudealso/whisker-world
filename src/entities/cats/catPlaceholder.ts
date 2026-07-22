/**
 * Hand-authored clay-toon cat factory.
 *
 * The geometry is deliberately simple, but the silhouette is not: four
 * planted legs, a long body, pointed ears, eyes, whiskers, a curled tail, and
 * a readable accessory kit make each roster entry unmistakably feline at the
 * third-person gameplay distance. Every mesh owns its resources so a roster
 * swap can safely rebuild the model in place.
 */
import * as THREE from "three";
import type { CatDefinition } from "../../content/cats";

export interface CatAppearance {
  bodyColor: string;
  accentColor: string;
  accessories?: readonly string[];
  id?: string;
}

function material(color: THREE.ColorRepresentation, options: { roughness?: number; emissive?: THREE.ColorRepresentation; emissiveIntensity?: number } = {}): THREE.MeshStandardMaterial {
  const parameters: THREE.MeshStandardMaterialParameters = {
    color,
    roughness: options.roughness ?? 0.88,
    metalness: 0,
    emissive: options.emissive,
    emissiveIntensity: options.emissiveIntensity,
    flatShading: false,
  };
  if (options.emissive === undefined) delete parameters.emissive;
  if (options.emissiveIntensity === undefined) delete parameters.emissiveIntensity;
  return new THREE.MeshStandardMaterial(parameters);
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
    material(color, { emissive: color, emissiveIntensity: 0.18 }),
    new THREE.Vector3(0, 0.84, 0.68),
  );
  badge.rotation.x = -Math.PI / 2;
  badge.rotation.z = Math.PI;
}

function addAccessories(group: THREE.Group, appearance: CatAppearance, body: THREE.Color): void {
  const accent = material(appearance.accentColor, { roughness: 0.78 });
  const pale = material(body.clone().lerp(new THREE.Color(0xffffff), 0.48));
  const tags = appearance.accessories ?? [];

  // Every cat carries a soft scarf collar. The trailing end gives the player
  // a clear facing cue even when the cat is moving through dark foliage.
  addMesh(
    group,
    new THREE.TorusGeometry(0.39, 0.065, 8, 18),
    accent,
    new THREE.Vector3(0, 1.13, 0.02),
  ).rotation.x = Math.PI / 2;
  const scarfTail = addMesh(
    group,
    new THREE.CapsuleGeometry(0.075, 0.36, 4, 8),
    accent,
    new THREE.Vector3(0.26, 1.06, 0.29),
    new THREE.Vector3(0.75, 0.7, 0.9),
  );
  scarfTail.rotation.x = -0.22;

  if (tags.some((tag) => tag.includes("satchel") || tag.includes("pouch"))) {
    addMesh(
      group,
      new THREE.SphereGeometry(0.23, 12, 8),
      accent,
      new THREE.Vector3(-0.48, 0.68, -0.18),
      new THREE.Vector3(0.7, 0.95, 0.9),
    );
    const strap = addMesh(
      group,
      new THREE.TorusGeometry(0.43, 0.027, 6, 18, Math.PI * 1.1),
      pale,
      new THREE.Vector3(0, 0.88, -0.03),
    );
    strap.rotation.x = Math.PI / 2;
    strap.rotation.z = Math.PI / 2;
  }

  if (tags.some((tag) => tag.includes("goggles"))) {
    const lensMaterial = material(0x263d51, { emissive: 0x3a86ff, emissiveIntensity: 0.25 });
    for (const x of [-0.18, 0.18]) {
      addMesh(
        group,
        new THREE.TorusGeometry(0.115, 0.035, 8, 16),
        accent,
        new THREE.Vector3(x, 1.5, 0.45),
      );
      addMesh(
        group,
        new THREE.CircleGeometry(0.085, 12),
        lensMaterial,
        new THREE.Vector3(x, 1.5, 0.451),
      ).rotation.y = Math.PI;
    }
    addCylinderBetween(
      group,
      new THREE.Vector3(-0.12, 1.5, 0.45),
      new THREE.Vector3(0.12, 1.5, 0.45),
      0.025,
      accent,
    );
  }

  if (tags.some((tag) => tag.includes("bell"))) {
    addMesh(
      group,
      new THREE.SphereGeometry(0.09, 10, 8),
      material(0xf2c14e, { emissive: 0xf2c14e, emissiveIntensity: 0.2 }),
      new THREE.Vector3(0, 1.08, 0.41),
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
        new THREE.Vector3(x, 1.02, -0.02),
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
}

/** Apply a complete model to an existing player group. */
export function applyCatAppearance(group: THREE.Group, appearance: CatAppearance): void {
  disposeCat(group);

  const bodyColor = new THREE.Color(appearance.bodyColor);
  const headColor = bodyColor.clone().lerp(new THREE.Color(0xffffff), 0.16);
  const muzzleColor = bodyColor.clone().lerp(new THREE.Color(0xffffff), 0.42);
  const bodyMaterial = material(bodyColor);
  const headMaterial = material(headColor);
  const muzzleMaterial = material(muzzleColor);
  const innerEarMaterial = material(bodyColor.clone().lerp(new THREE.Color(0xffb6b6), 0.32));

  const bodyScale = appearance.id === "blaze"
    ? new THREE.Vector3(1.16, 0.9, 1.08)
    : appearance.id === "dash"
      ? new THREE.Vector3(0.92, 0.82, 1.16)
      : new THREE.Vector3(1, 0.83, 1.1);

  addMesh(
    group,
    new THREE.SphereGeometry(0.6, 16, 12),
    bodyMaterial,
    new THREE.Vector3(0, 0.68, -0.02),
    bodyScale,
  );
  addMesh(
    group,
    new THREE.SphereGeometry(0.48, 16, 12),
    headMaterial,
    new THREE.Vector3(0, 1.35, 0.28),
    new THREE.Vector3(1, 0.96, 1.02),
  );

  // Legs use rounded capsules rather than floating pegs. Their broad feet
  // and slight stance are intentionally readable from the follow camera.
  for (const x of [-0.29, 0.29]) {
    for (const z of [-0.3, 0.3]) {
      addMesh(
        group,
        new THREE.CapsuleGeometry(0.13, 0.36, 5, 8),
        bodyMaterial,
        new THREE.Vector3(x, 0.36, z),
        new THREE.Vector3(0.92, 1, 0.88),
      );
      addMesh(
        group,
        new THREE.SphereGeometry(0.14, 10, 7),
        muzzleMaterial,
        new THREE.Vector3(x, 0.14, z + 0.045),
        new THREE.Vector3(1, 0.58, 1.18),
      );
    }
  }

  // Ears are low-poly cones with inner clay inserts, which makes the head
  // silhouette read as a cat even in a dark silhouette.
  for (const x of [-0.23, 0.23]) {
    addMesh(
      group,
      new THREE.ConeGeometry(0.22, 0.43, 4),
      headMaterial,
      new THREE.Vector3(x, 1.75, 0.24),
      new THREE.Vector3(1, 1, 0.8),
    );
    addMesh(
      group,
      new THREE.ConeGeometry(0.11, 0.22, 4),
      innerEarMaterial,
      new THREE.Vector3(x, 1.77, 0.285),
      new THREE.Vector3(1, 1, 0.55),
    );
  }

  // Muzzle, nose, bright eyes, and tiny eye glints establish a forward face.
  addMesh(group, new THREE.SphereGeometry(0.24, 12, 8), muzzleMaterial, new THREE.Vector3(0, 1.26, 0.67), new THREE.Vector3(1.1, 0.72, 0.72));
  addMesh(group, new THREE.SphereGeometry(0.07, 8, 6), material(0x4b2430), new THREE.Vector3(0, 1.3, 0.84));
  const eyeMaterial = material(0x17202a, { roughness: 0.48 });
  const glintMaterial = material(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.6 });
  for (const x of [-0.17, 0.17]) {
    addMesh(group, new THREE.SphereGeometry(0.105, 10, 8), eyeMaterial, new THREE.Vector3(x, 1.48, 0.66), new THREE.Vector3(0.82, 1.1, 0.42));
    addMesh(group, new THREE.SphereGeometry(0.026, 6, 6), glintMaterial, new THREE.Vector3(x - 0.025, 1.52, 0.705));
  }
  const whiskerMaterial = material(0xf4ead8, { roughness: 0.75 });
  for (const side of [-1, 1]) {
    for (let index = 0; index < 2; index += 1) {
      addCylinderBetween(
        group,
        new THREE.Vector3(side * 0.17, 1.27 + index * 0.06, 0.82),
        new THREE.Vector3(side * (0.5 + index * 0.035), 1.28 + index * 0.08, 0.88),
        0.012,
        whiskerMaterial,
      );
    }
  }

  // Curved tube tail rises behind the body and keeps the silhouette lively.
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.67, -0.48),
    new THREE.Vector3(0, 0.8, -0.87),
    new THREE.Vector3(0.31, 0.98, -1.06),
    new THREE.Vector3(0.43, 1.3, -0.88),
  ]);
  addMesh(group, new THREE.TubeGeometry(tailCurve, 16, 0.105, 8, false), bodyMaterial, new THREE.Vector3(0, 0, 0));

  if (appearance.id === "willow") {
    const fluff = material(bodyColor.clone().lerp(new THREE.Color(0xffffff), 0.2));
    for (const position of [
      new THREE.Vector3(-0.45, 0.8, -0.18),
      new THREE.Vector3(0.45, 0.8, -0.18),
      new THREE.Vector3(0, 0.52, -0.55),
    ]) {
      addMesh(group, new THREE.IcosahedronGeometry(0.2, 1), fluff, position, new THREE.Vector3(1.1, 0.75, 1));
    }
  }

  addAccessories(group, appearance, bodyColor);
  group.userData.catId = appearance.id;
}

export function createCatModel(cat: CatDefinition): THREE.Group {
  const group = new THREE.Group();
  applyCatAppearance(group, cat);
  return group;
}

/** Backward-compatible name kept for callers while the factory is upgraded. */
export function createCatPlaceholder(appearance: CatAppearance): THREE.Group {
  const group = new THREE.Group();
  applyCatAppearance(group, appearance);
  return group;
}
