import { describe, expect, it } from "vitest";
import { CHAPTERS } from "../src/content/chapters";
import {
  getUnlockedChapterIds,
  isChapterUnlocked,
  UNLOCKED_CHAPTERS_KEY,
  unlockNextChapter,
} from "../src/content/chapterProgress";
import type { StorageLike } from "../src/cutscenes/introGate";

function makeStorage(initial: Record<string, string> = {}): StorageLike {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, value),
  };
}

describe("progressive chapter unlock", () => {
  it("unlocks only chapter 1 on a fresh profile", () => {
    const storage = makeStorage();
    expect(getUnlockedChapterIds(storage)).toEqual(["chapter-1"]);
    expect(isChapterUnlocked("chapter-1", storage)).toBe(true);
    for (const chapter of CHAPTERS.slice(1)) {
      expect(isChapterUnlocked(chapter.id, storage), chapter.id).toBe(false);
    }
  });

  it("unlocks chapter 2 (and only chapter 2) after completing chapter 1", () => {
    const storage = makeStorage();
    const unlocked = unlockNextChapter("chapter-1", storage);
    expect(unlocked).toBe("chapter-2");
    expect(getUnlockedChapterIds(storage)).toEqual(["chapter-1", "chapter-2"]);
    for (const chapter of CHAPTERS.slice(2)) {
      expect(isChapterUnlocked(chapter.id, storage), chapter.id).toBe(false);
    }
  });

  it("persists the unlock to storage under a stable key", () => {
    const storage = makeStorage();
    unlockNextChapter("chapter-1", storage);
    const raw = storage.getItem(UNLOCKED_CHAPTERS_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw as string)).toEqual(["chapter-1", "chapter-2"]);
  });

  it("is idempotent: replaying chapter 1's completion does not unlock chapter 3", () => {
    const storage = makeStorage();
    unlockNextChapter("chapter-1", storage);
    const second = unlockNextChapter("chapter-1", storage);
    expect(second).toBeNull();
    expect(getUnlockedChapterIds(storage)).toEqual(["chapter-1", "chapter-2"]);
  });

  it("returns null for the last chapter (nothing further to unlock)", () => {
    const storage = makeStorage();
    const lastId = CHAPTERS[CHAPTERS.length - 1].id;
    expect(unlockNextChapter(lastId, storage)).toBeNull();
  });

  it("treats throwing storage as chapter-1-only and swallows write errors", () => {
    const broken: StorageLike = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };
    expect(getUnlockedChapterIds(broken)).toEqual(["chapter-1"]);
    expect(() => unlockNextChapter("chapter-1", broken)).not.toThrow();
  });
});
