/**
 * Progressive chapter unlock (captain playtest fix): a fresh profile only
 * has chapter 1 unlocked; completing a chapter unlocks the next one in
 * `CHAPTERS` order. This is separate from `locked` on `ChapterDefinition`,
 * which marks chapters whose world isn't built yet - a chapter can become
 * "unlocked" here while still reporting `canEnterChapter() === false` until
 * its content ships.
 *
 * Pure decision logic over an injectable storage so tests need no browser,
 * matching `cutscenes/introGate.ts`. localStorage can throw (private mode,
 * blocked storage) - treat that as "only chapter 1" on read and swallow on
 * write so the game always boots.
 */
import { CHAPTERS, type ChapterId } from "./chapters";
import type { StorageLike } from "../cutscenes/introGate";

export const UNLOCKED_CHAPTERS_KEY = "ww_unlocked_chapters";

const FIRST_CHAPTER_ID: ChapterId = CHAPTERS[0].id;

const NOOP_STORAGE: StorageLike = {
  getItem: () => null,
  setItem: () => {},
};

/**
 * Resolve a StorageLike from window.localStorage, tolerating environments
 * where even accessing the property throws (Firefox with cookies disabled,
 * sandboxed iframe without allow-same-origin).
 */
export function getChapterProgressStorage(): StorageLike {
  try {
    return window.localStorage ?? NOOP_STORAGE;
  } catch {
    return NOOP_STORAGE;
  }
}

function readUnlocked(storage: StorageLike): ChapterId[] {
  const validIds = new Set(CHAPTERS.map((chapter) => chapter.id));
  try {
    const raw = storage.getItem(UNLOCKED_CHAPTERS_KEY);
    if (raw === null) {
      return [FIRST_CHAPTER_ID];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [FIRST_CHAPTER_ID];
    }
    const ids = parsed.filter((id): id is ChapterId => validIds.has(id as ChapterId));
    return ids.includes(FIRST_CHAPTER_ID) ? ids : [FIRST_CHAPTER_ID, ...ids];
  } catch {
    return [FIRST_CHAPTER_ID];
  }
}

/** Chapter ids unlocked so far, in `CHAPTERS` order. Always includes the first chapter. */
export function getUnlockedChapterIds(storage: StorageLike): ChapterId[] {
  const unlocked = new Set(readUnlocked(storage));
  return CHAPTERS.filter((chapter) => unlocked.has(chapter.id)).map((chapter) => chapter.id);
}

export function isChapterUnlocked(id: ChapterId, storage: StorageLike): boolean {
  return getUnlockedChapterIds(storage).includes(id);
}

/**
 * Unlock the chapter immediately after `completedId` in `CHAPTERS` order, if
 * any, and persist it. Returns the newly unlocked id, or null when the
 * completed chapter is already last, or the next chapter was already
 * unlocked (no-op on repeat completions / replays).
 */
export function unlockNextChapter(completedId: ChapterId, storage: StorageLike): ChapterId | null {
  const index = CHAPTERS.findIndex((chapter) => chapter.id === completedId);
  const next = index >= 0 ? CHAPTERS[index + 1] : undefined;
  if (!next) {
    return null;
  }
  const unlocked = readUnlocked(storage);
  if (unlocked.includes(next.id)) {
    return null;
  }
  try {
    storage.setItem(UNLOCKED_CHAPTERS_KEY, JSON.stringify([...unlocked, next.id]));
  } catch {
    // Storage unavailable: the unlock won't persist, but this session still proceeds.
  }
  return next.id;
}
