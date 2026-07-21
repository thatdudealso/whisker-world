/**
 * Whisker World - Phase 0 locomotion slice.
 * Thin bootstrap: build the world, the player, the camera, the input,
 * then run the frame loop. Feel lives in the modules, not here.
 */
import * as THREE from "three";
import { KeyboardInput } from "./input/keyboard";
import { PlayerController } from "./entities/cats/playerController";
import { CameraRig } from "./systems/cameraRig";
import { buildForestChapter1 } from "./world/chapters/forestChapter1";
import { createHud } from "./ui/hud";

const MAX_DT = 0.05; // clamp huge frames (tab refocus) so physics stays stable

const app = document.getElementById("app");
if (!app) {
  throw new Error("#app missing");
}

createHud(document.body);

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
app.appendChild(renderer.domElement);

// The chapter owns the scene mood: background, fog, and all lights.
const world = buildForestChapter1(scene);
const player = new PlayerController(world.spawn);
scene.add(player.group);
const cameraRig = new CameraRig(window.innerWidth / window.innerHeight);
const input = new KeyboardInput();
input.attach(window);

if (import.meta.env.DEV) {
  // Dev-only playtest hook: lets the browser console / E2E drivers read live
  // player state. Tree-shaken out of production builds.
  (window as unknown as Record<string, unknown>).__ww = { player };
}

window.addEventListener("resize", () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  cameraRig.setAspect(w / h);
  renderer.setSize(w, h);
});

const clock = new THREE.Clock();

function tick(): void {
  const dt = Math.min(clock.getDelta(), MAX_DT);
  const snapshot = input.snapshot();

  player.update(dt, {
    move: snapshot.move,
    sprint: snapshot.sprint,
    jump: snapshot.jumpPressed,
  }, world.obstacles);
  cameraRig.update(dt, player.position, snapshot.orbit);

  renderer.render(scene, cameraRig.camera);
  requestAnimationFrame(tick);
}

tick();
