/**
 * Chapter table stub: six biome chapters, one home cat each (WW-D2).
 *
 * Data only - biome geometry lives in the chapter builders under src/world,
 * not in this table. Titles, ids, homeCatId mapping, and the chapter-1
 * forest/Luna unlock are the content contract.
 */
import type { CatId } from "./cats";

export type ChapterId =
  | "chapter-1"
  | "chapter-2"
  | "chapter-3"
  | "chapter-4"
  | "chapter-5"
  | "chapter-6";

export interface ChapterDefinition {
  id: ChapterId;
  title: string;
  /** Biome keyword from WW-D2 (drives future world building, not geometry yet). */
  biome: string;
  /** The cat whose story anchors this chapter. */
  homeCatId: CatId;
  /** Locked chapters show "coming soon" in the select stub. */
  locked: boolean;
}

export const CHAPTERS: readonly ChapterDefinition[] = [
  {
    id: "chapter-1",
    title: "Whisperleaf Forest",
    biome: "forest",
    homeCatId: "luna",
    locked: false,
  },
  {
    id: "chapter-2",
    title: "Moonlit Rooftops",
    biome: "rooftops",
    homeCatId: "shadow",
    locked: true,
  },
  {
    id: "chapter-3",
    title: "Ember Canyon",
    biome: "canyon",
    homeCatId: "blaze",
    locked: true,
  },
  {
    id: "chapter-4",
    title: "Tidepool Shores",
    biome: "coast",
    homeCatId: "misty",
    locked: true,
  },
  {
    id: "chapter-5",
    title: "Willowmere Gardens",
    biome: "gardens",
    homeCatId: "willow",
    locked: true,
  },
  {
    id: "chapter-6",
    title: "Dune Runner Flats",
    biome: "dunes",
    homeCatId: "dash",
    locked: true,
  },
];

const CHAPTER_BY_ID = new Map<ChapterId, ChapterDefinition>(
  CHAPTERS.map((chapter) => [chapter.id, chapter]),
);

export function getChapter(id: ChapterId): ChapterDefinition {
  const chapter = CHAPTER_BY_ID.get(id);
  if (!chapter) {
    throw new Error(`Unknown chapter id: ${id}`);
  }
  return chapter;
}

/** Lock rule for the select stub: only unlocked chapters can be entered. */
export function canEnterChapter(chapter: ChapterDefinition): boolean {
  return !chapter.locked;
}
