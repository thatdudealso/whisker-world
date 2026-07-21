/**
 * Locked six-cat roster (captain lavish board WW-D1).
 *
 * Names, ids, and roles are LOCKED - do not rename without a needs-decision.
 * Identity here is data only: placeholder tint + accessory tags. Clay/toon
 * bodies and real wardrobe assets come from the art board (WW-D0 hybrid),
 * they do not change this schema.
 */
import { DEFAULT_TUNING, type PlayerTuning } from "../entities/cats/locomotion";

export type CatId = "luna" | "shadow" | "blaze" | "misty" | "willow" | "dash";

export interface CatDefinition {
  /** Stable id used in saves, content tables, and chapter homeCatId refs. */
  id: CatId;
  name: string;
  role: string;
  blurb: string;
  /** Greybox body tint (#rrggbb). Clay/toon materials replace this later. */
  bodyColor: string;
  /** Accessory marker tint (#rrggbb): the scarf band on the placeholder. */
  accentColor: string;
  /** Wardrobe language tags (labels only until WW-D0 assets exist). */
  accessories: readonly string[];
  /**
   * Small per-cat deltas on the shared locomotion feel. Keep within ~10% of
   * DEFAULT_TUNING; omit entirely to use the shared feel unchanged.
   */
  locomotion?: Partial<PlayerTuning>;
}

export const CATS: readonly CatDefinition[] = [
  {
    id: "luna",
    name: "Luna",
    role: "Explorer",
    blurb: "Calico scout with a nose for hidden trails and a bell that never lies.",
    bodyColor: "#c9915a",
    accentColor: "#f2c14e",
    accessories: ["star scarf", "bell collar", "leaf satchel"],
  },
  {
    id: "shadow",
    name: "Shadow",
    role: "Stealth",
    blurb: "Gray tuxedo ghost - if you saw Shadow, Shadow wanted you to.",
    bodyColor: "#5b6068",
    accentColor: "#33343b",
    accessories: ["charcoal scarf", "utility pouch"],
  },
  {
    id: "blaze",
    name: "Blaze",
    role: "Tank",
    blurb: "Stocky ginger tabby who walks through trouble instead of around it.",
    bodyColor: "#d9742f",
    accentColor: "#c0392b",
    accessories: ["red bandana", "satchel", "armor bit"],
    // Heavier build: a touch slower across the board.
    locomotion: { walkSpeed: 4.2, sprintSpeed: 6.6 },
  },
  {
    id: "misty",
    name: "Misty",
    role: "Agile puzzle",
    blurb: "Snowshoe puzzle-dancer who reads rooms the way others read scents.",
    bodyColor: "#e6d9c4",
    accentColor: "#2a9d8f",
    accessories: ["teal scarf", "shell charm", "wave pouch"],
  },
  {
    id: "willow",
    name: "Willow",
    role: "Support",
    blurb: "Fluffy ragdoll herbalist; the syndicate's softest shoulder and sharpest tea.",
    bodyColor: "#e3dcd2",
    accentColor: "#f2b8c6",
    accessories: ["pastel knit scarf", "herbal satchel"],
  },
  {
    id: "dash",
    name: "Dash",
    role: "Speed",
    blurb: "Bengal sprinter with a boyish smirk and no patience for scenic routes.",
    bodyColor: "#b07a3c",
    accentColor: "#3a86ff",
    accessories: ["racing scarf", "goggles", "sprint pouch"],
    // Sprinter: noticeably faster top end, same walk feel.
    locomotion: { sprintSpeed: 7.6 },
  },
];

export const DEFAULT_CAT_ID: CatId = "luna";

const CAT_BY_ID = new Map<CatId, CatDefinition>(CATS.map((cat) => [cat.id, cat]));

export function isCatId(value: string): value is CatId {
  return CAT_BY_ID.has(value as CatId);
}

export function getCat(id: CatId): CatDefinition {
  const cat = CAT_BY_ID.get(id);
  if (!cat) {
    throw new Error(`Unknown cat id: ${id}`);
  }
  return cat;
}

/** Shared locomotion feel with this cat's small deltas applied. */
export function tuningFor(cat: CatDefinition): PlayerTuning {
  return { ...DEFAULT_TUNING, ...cat.locomotion };
}
