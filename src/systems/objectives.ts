import type { CatId } from "../content/cats";

export type ObjectiveId = "overlook" | "rift" | "return";

export interface ObjectiveDefinition {
  id: ObjectiveId;
  title: string;
  detail: string;
  target: { x: number; z: number };
  radius: number;
}

export const CHAPTER1_OBJECTIVES: readonly ObjectiveDefinition[] = [
  {
    id: "overlook",
    title: "Reach the overlook",
    detail: "Follow the starlight trail and climb above the clearing.",
    target: { x: -1, z: -11.5 },
    radius: 2.5,
  },
  {
    id: "rift",
    title: "Investigate the Rift shard",
    detail: "The violet light is calling from the eastern trail.",
    target: { x: 12.5, z: 2.5 },
    radius: 2.8,
  },
  {
    id: "return",
    title: "Return to the clearing",
    detail: "Bring what you learned home to Luna's ring.",
    target: { x: 0, z: 3.5 },
    radius: 2.4,
  },
];

export interface ObjectiveState {
  active: ObjectiveId;
  completed: readonly ObjectiveId[];
  complete: boolean;
  catId: CatId;
}

export interface ObjectivePose {
  x: number;
  y: number;
  z: number;
}

export function createObjectiveState(catId: CatId): ObjectiveState {
  return { active: "overlook", completed: [], complete: false, catId };
}

export function objectiveDefinition(id: ObjectiveId): ObjectiveDefinition {
  const definition = CHAPTER1_OBJECTIVES.find((objective) => objective.id === id);
  if (!definition) {
    throw new Error(`Unknown objective id: ${id}`);
  }
  return definition;
}

function isAtObjective(pose: ObjectivePose, objective: ObjectiveDefinition): boolean {
  const distance = Math.hypot(pose.x - objective.target.x, pose.z - objective.target.z);
  // The overlook is deliberately elevated. Requiring the cat to be on a
  // terrace keeps a player from checking it from the path below.
  if (objective.id === "overlook" && pose.y < 1.7) {
    return false;
  }
  return distance <= objective.radius;
}

/** Advance the short Chapter 1 chain from a world pose. Pure and idempotent. */
export function updateObjectives(state: ObjectiveState, pose: ObjectivePose): ObjectiveState {
  if (state.complete) {
    return state;
  }
  const active = objectiveDefinition(state.active);
  if (!isAtObjective(pose, active)) {
    return state;
  }

  const completed = [...state.completed, active.id] as ObjectiveId[];
  const nextIndex = CHAPTER1_OBJECTIVES.findIndex((objective) => objective.id === active.id) + 1;
  if (nextIndex >= CHAPTER1_OBJECTIVES.length) {
    return { ...state, completed, complete: true };
  }
  return {
    ...state,
    active: CHAPTER1_OBJECTIVES[nextIndex].id,
    completed,
  };
}

