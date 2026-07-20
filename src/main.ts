/**
 * Whisker World - Phase 0 greybox
 * Minimal Three.js scene: ground, capsule cat placeholder, simple camera, WASD stub.
 * Intentionally ugly. Art and polish come later.
 */
import * as THREE from "three";

const app = document.getElementById("app");
if (!app) {
  throw new Error("#app missing");
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2a2a32);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  200,
);
camera.position.set(0, 4, 8);
camera.lookAt(0, 0.8, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
app.appendChild(renderer.domElement);

// Lights
const ambient = new THREE.AmbientLight(0xffffff, 0.55);
scene.add(ambient);
const dir = new THREE.DirectionalLight(0xffffff, 0.85);
dir.position.set(5, 10, 4);
scene.add(dir);

// Ground plane
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(40, 40),
  new THREE.MeshStandardMaterial({ color: 0x3d4a3a }),
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Grid helper for greybox orientation
const grid = new THREE.GridHelper(40, 40, 0x555555, 0x333333);
scene.add(grid);

// Capsule placeholder cat (ugly on purpose)
const catBody = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.35, 0.7, 4, 8),
  new THREE.MeshStandardMaterial({ color: 0xc48a4a }),
);
catBody.position.set(0, 0.7, 0);
scene.add(catBody);

// Tiny "head" blob so it reads as a creature, not a pill
const catHead = new THREE.Mesh(
  new THREE.SphereGeometry(0.28, 8, 8),
  new THREE.MeshStandardMaterial({ color: 0xd4a05a }),
);
catHead.position.set(0, 1.25, 0.2);
scene.add(catHead);

// WASD movement stub
const keys = new Set<string>();
window.addEventListener("keydown", (e) => {
  keys.add(e.key.toLowerCase());
});
window.addEventListener("keyup", (e) => {
  keys.delete(e.key.toLowerCase());
});

const moveSpeed = 4;
const catPos = new THREE.Vector3(0, 0, 0);
const clock = new THREE.Clock();

function handleResize(): void {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
window.addEventListener("resize", handleResize);

function tick(): void {
  const dt = clock.getDelta();
  let dx = 0;
  let dz = 0;
  if (keys.has("w") || keys.has("arrowup")) dz -= 1;
  if (keys.has("s") || keys.has("arrowdown")) dz += 1;
  if (keys.has("a") || keys.has("arrowleft")) dx -= 1;
  if (keys.has("d") || keys.has("arrowright")) dx += 1;

  if (dx !== 0 || dz !== 0) {
    const len = Math.hypot(dx, dz);
    dx = (dx / len) * moveSpeed * dt;
    dz = (dz / len) * moveSpeed * dt;
    catPos.x += dx;
    catPos.z += dz;
  }

  catBody.position.x = catPos.x;
  catBody.position.z = catPos.z;
  catHead.position.x = catPos.x;
  catHead.position.z = catPos.z + 0.2;

  // Simple follow camera
  camera.position.x = catPos.x;
  camera.position.z = catPos.z + 8;
  camera.lookAt(catPos.x, 0.8, catPos.z);

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

tick();
