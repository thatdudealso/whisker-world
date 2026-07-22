/**
 * Whisker World Chapter 1 bootstrap.
 *
 * Runtime policy is intentionally small: build one Three.js scene, wire the
 * pure flow and objective systems to the DOM presentation, and keep the frame
 * loop responsible only for input, locomotion, objective checks, and render.
 */
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { CHAPTER1_BEATS } from "./content/cutscenes/chapter1";
import { getIntroStorage, markIntroSeen, shouldPlayIntro } from "./cutscenes/introGate";
import { playCutsceneOverlay } from "./cutscenes/overlay";
import { PlayerController } from "./entities/cats/playerController";
import { KeyboardInput } from "./input/keyboard";
import { GameAudio } from "./systems/audio";
import { CameraRig } from "./systems/cameraRig";
import { CatSelection } from "./systems/catSelection";
import { GameFlow } from "./systems/gameFlow";
import { createObjectiveState, updateObjectives, type ObjectiveState } from "./systems/objectives";
import { spawnBurst, updateBursts } from "./systems/particles";
import { GameUi } from "./ui/gameUi";
import { buildForestChapter1 } from "./world/chapters/forestChapter1";

const MAX_DT = 0.05;

const app = document.getElementById("app");
if (!app) throw new Error("#app missing");

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
app.appendChild(renderer.domElement);

const world = buildForestChapter1(scene);
const selection = new CatSelection();
const player = new PlayerController(selection.active, world.spawn);
scene.add(player.group);
const cameraRig = new CameraRig(window.innerWidth / window.innerHeight);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, cameraRig.camera));
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.55, // strength
  0.6, // radius
  0.32, // luminance threshold
);
composer.addPass(bloomPass);
composer.addPass(new OutputPass());

const input = new KeyboardInput();
input.attach(window);
input.setEnabled(false);
const audio = new GameAudio();

const flow = new GameFlow(selection.activeId);
let objectives: ObjectiveState = createObjectiveState(selection.activeId);

const resetChapter = (): void => {
  player.reset(world.spawn);
  objectives = createObjectiveState(selection.activeId);
  ui.setObjectives(objectives);
};

const startIntro = (): void => {
  input.setEnabled(false);
  playCutsceneOverlay(document.body, CHAPTER1_BEATS, {
    onComplete: () => {
      markIntroSeen(getIntroStorage());
      resetChapter();
      flow.beginPlay();
      input.setEnabled(true);
    },
  });
};

const ui = new GameUi(document.body, selection, {
  onStart: () => {
    audio.unlock();
    flow.openSelect();
  },
  onContinue: () => {
    if (shouldPlayIntro(window.location.search, getIntroStorage())) {
      flow.beginIntro();
      startIntro();
      return;
    }
    resetChapter();
    flow.skipIntro();
  },
  onReplay: () => {
    resetChapter();
    flow.replay();
    startIntro();
  },
  onReturnToTitle: () => {
    input.setEnabled(false);
    flow.returnToTitle();
  },
  onSelectCat: (id) => flow.chooseCat(id),
});
ui.installCatShortcuts(selection);
ui.setObjectives(objectives);

selection.subscribe((cat) => {
  player.setCat(cat);
  if (flow.current.stage !== "select" && flow.current.selectedCatId !== cat.id) flow.chooseCat(cat.id);
  if (!objectives.complete) {
    objectives = { ...objectives, catId: cat.id };
  }
});

flow.subscribe((state) => {
  ui.setStage(state.stage);
  if (state.stage === "title" || state.stage === "select") input.setEnabled(false);
  if (state.stage === "play") {
    ui.setObjectives(objectives);
    input.setEnabled(true);
  }
  if (state.stage === "complete") {
    ui.setUnlockedChapter(state.unlockedChapterId);
  }
});

if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).__ww = { player, selection, flow, world, ui };
}

window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  cameraRig.setAspect(width / height);
  renderer.setSize(width, height);
  composer.setSize(width, height);
  bloomPass.resolution.set(width, height);
});

/** Gold/mint/violet match the HUD objective dots so the burst reads as "that one". */
const OBJECTIVE_BURST_COLOR: Record<string, number> = {
  overlook: 0x9ce7bd,
  rift: 0xb87cff,
  return: 0xf2c879,
};

const clock = new THREE.Clock();
function tick(): void {
  const dt = Math.min(clock.getDelta(), MAX_DT);
  const stage = flow.current.stage;
  const snapshot = input.snapshot();

  if (stage === "play") {
    const events = player.update(dt, {
      move: snapshot.move,
      sprint: snapshot.sprint,
      jump: snapshot.jumpPressed,
    }, world.obstacles);
    if (events.jumped) audio.playJump();
    if (events.landed) {
      audio.playLand(events.landImpact);
      if (events.landImpact > 0.08) {
        spawnBurst(scene, player.position, 0xdce9d6, "dust");
      }
    }

    const nextObjectives = updateObjectives(objectives, player.position);
    if (nextObjectives !== objectives) {
      const justCompleted = nextObjectives.completed[nextObjectives.completed.length - 1];
      const burstPosition = player.position.clone();
      burstPosition.y += 0.9;
      spawnBurst(scene, burstPosition, OBJECTIVE_BURST_COLOR[justCompleted] ?? 0xf2c879, "sparkle");
      objectives = nextObjectives;
      ui.setObjectives(objectives);
      if (objectives.complete) {
        audio.playComplete();
        input.setEnabled(false);
        flow.completeChapter();
      } else {
        audio.playObjective();
      }
    }
  }

  world.update(dt, stage === "play" && !objectives.complete ? objectives.active : null);
  cameraRig.update(dt, player.position, stage === "play" ? snapshot.orbit : 0);
  updateBursts(scene, dt);
  composer.render(dt);
  requestAnimationFrame(tick);
}

tick();
