/**
 * Greybox placeholder cat: capsule body + head blob, intentionally ugly.
 * Local +Z is "forward" (the head sits toward +Z), so setting `group.rotation.y`
 * to the locomotion yaw makes the cat face its travel direction.
 *
 * Identity is data-driven: body tint plus a scarf band in the cat's accent
 * color (the accessory marker for the roster). Clay/soft-toon models replace
 * all of this later (art style locked: WW-D0 hybrid).
 */
import * as THREE from "three";

export interface CatAppearance {
  /** Body tint (#rrggbb); head and nose shades derive from it. */
  bodyColor: string;
  /** Scarf band tint (#rrggbb) - the placeholder accessory marker. */
  accentColor: string;
}

/** Replace the group's meshes with a placeholder skinned for `appearance`. */
export function applyCatAppearance(group: THREE.Group, appearance: CatAppearance): void {
  for (const child of [...group.children]) {
    group.remove(child);
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();
      (child.material as THREE.Material).dispose();
    }
  }

  const bodyColor = new THREE.Color(appearance.bodyColor);
  const headColor = bodyColor.clone().lerp(new THREE.Color(0xffffff), 0.2);
  const noseColor = bodyColor.clone().lerp(new THREE.Color(0x000000), 0.4);

  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.35, 0.7, 4, 8),
    new THREE.MeshStandardMaterial({ color: bodyColor }),
  );
  body.position.set(0, 0.7, 0);
  group.add(body);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 8, 8),
    new THREE.MeshStandardMaterial({ color: headColor }),
  );
  head.position.set(0, 1.5, 0.18);
  group.add(head);

  // Nose nub on +Z so facing is readable at a glance.
  const nose = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 6, 6),
    new THREE.MeshStandardMaterial({ color: noseColor }),
  );
  nose.position.set(0, 1.46, 0.46);
  group.add(nose);

  // Scarf band at the neck: the one accessory marker each cat gets for now.
  const scarf = new THREE.Mesh(
    new THREE.TorusGeometry(0.28, 0.08, 6, 12),
    new THREE.MeshStandardMaterial({ color: new THREE.Color(appearance.accentColor) }),
  );
  scarf.position.set(0, 1.24, 0.04);
  scarf.rotation.x = Math.PI / 2;
  group.add(scarf);
}

export function createCatPlaceholder(appearance: CatAppearance): THREE.Group {
  const group = new THREE.Group();
  applyCatAppearance(group, appearance);
  return group;
}
