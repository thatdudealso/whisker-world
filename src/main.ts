/**
 * Whisker World Chapter 1 bootstrap.
 *
 * Runtime policy is intentionally small: build one Three.js scene, wire the
 * pure flow and objective systems to the DOM presentation, and keep the frame
 * loop responsible only for input, locomotion, objective checks, and render.
 */
import * as THREE from "three";
import { CHAPTER1_BEATS } from "./content/cutscenes/chapter1";
import { getIntroStorage, markIntroSeen, shouldPlayIntro } from "./cutscenes/introGate";
import { playCutsceneOverlay } from "./cutscenes/overlay";
import { PlayerController } from "./entities/cats/playerController";
import { KeyboardInput } from "./input/keyboard";
import { CameraRig } from "./systems/cameraRig";
import { CatSelection } from "./systems/catSelection";
import { GameFlow } from "./systems/gameFlow";
import { createObjectiveState, updateObjectives, type ObjectiveState } from "./systems/objectives";
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
renderer.toneMappingExposure = 1.08;
app.appendChild(renderer.domElement);

const world = buildForestChapter1(scene);
const selection = new CatSelection();
const player = new PlayerController(selection.active, world.spawn);
scene.add(player.group);
const cameraRig = new CameraRig(window.innerWidth / window.innerHeight);
const input = new KeyboardInput();
input.attach(window);
input.setEnabled(false);

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
  onStart: () => flow.openSelect(),
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
});

const clock = new THREE.Clock();
function tick(): void {
  const dt = Math.min(clock.getDelta(), MAX_DT);
  const stage = flow.current.stage;
  const snapshot = input.snapshot();

  if (stage === "play") {
    player.update(dt, {
      move: snapshot.move,
      sprint: snapshot.sprint,
      jump: snapshot.jumpPressed,
    }, world.obstacles);
    const nextObjectives = updateObjectives(objectives, player.position);
    if (nextObjectives !== objectives) {
      objectives = nextObjectives;
      ui.setObjectives(objectives);
      if (objectives.complete) {
        input.setEnabled(false);
        flow.completeChapter();
      }
    }
  }

  world.update(dt, stage === "play" && !objectives.complete ? objectives.active : null);
  cameraRig.update(dt, player.position, stage === "play" ? snapshot.orbit : 0);
  renderer.render(scene, cameraRig.camera);
  requestAnimationFrame(tick);
}

tick();
