/**
 * Greybox placeholder cat: capsule body + head blob, intentionally ugly.
 * Local +Z is "forward" (the head sits toward +Z), so setting `group.rotation.y`
 * to the locomotion yaw makes the cat face its travel direction.
 * Clay/soft-toon models replace this later (art style locked: WW-D0 hybrid).
 */
import * as THREE from "three";

export function createCatPlaceholder(): THREE.Group {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.35, 0.7, 4, 8),
    new THREE.MeshStandardMaterial({ color: 0xc48a4a }),
  );
  body.position.set(0, 0.7, 0);
  group.add(body);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xd4a05a }),
  );
  head.position.set(0, 1.5, 0.18);
  group.add(head);

  // Nose nub on +Z so facing is readable at a glance.
  const nose = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 6, 6),
    new THREE.MeshStandardMaterial({ color: 0x8a5a2a }),
  );
  nose.position.set(0, 1.46, 0.46);
  group.add(nose);

  return group;
}
