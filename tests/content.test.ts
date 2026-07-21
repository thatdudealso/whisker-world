import { describe, expect, it } from "vitest";
import {
  CATS,
  DEFAULT_CAT_ID,
  getCat,
  isCatId,
  tuningFor,
  type CatDefinition,
} from "../src/content/cats";
import { canEnterChapter, CHAPTERS, getChapter } from "../src/content/chapters";
import { DEFAULT_TUNING, type PlayerTuning } from "../src/entities/cats/locomotion";

const LOCKED_IDS = ["luna", "shadow", "blaze", "misty", "willow", "dash"];
const HEX_COLOR = /^#[0-9a-f]{6}$/;

describe("cat roster table", () => {
  it("has exactly the six locked WW-D1 cats, in order", () => {
    expect(CATS.map((cat) => cat.id)).toEqual(LOCKED_IDS);
  });

  it("has unique ids and names", () => {
    expect(new Set(CATS.map((cat) => cat.id)).size).toBe(CATS.length);
    expect(new Set(CATS.map((cat) => cat.name)).size).toBe(CATS.length);
  });

  it("gives every cat a role, blurb, colors, and at least one accessory tag", () => {
    for (const cat of CATS) {
      expect(cat.name.length, cat.id).toBeGreaterThan(0);
      expect(cat.role.length, cat.id).toBeGreaterThan(0);
      expect(cat.blurb.length, cat.id).toBeGreaterThan(0);
      expect(cat.bodyColor, cat.id).toMatch(HEX_COLOR);
      expect(cat.accentColor, cat.id).toMatch(HEX_COLOR);
      expect(cat.accessories.length, cat.id).toBeGreaterThan(0);
    }
  });

  it("defaults to Luna and resolves lookups", () => {
    expect(DEFAULT_CAT_ID).toBe("luna");
    expect(getCat("dash").name).toBe("Dash");
    expect(isCatId("misty")).toBe(true);
    expect(isCatId("garfield")).toBe(false);
  });

  it("keeps locomotion overrides as small deltas on the shared feel", () => {
    for (const cat of CATS) {
      const tuning = tuningFor(cat);
      for (const key of Object.keys(DEFAULT_TUNING) as (keyof PlayerTuning)[]) {
        const ratio = tuning[key] / DEFAULT_TUNING[key];
        expect(ratio, `${cat.id}.${key}`).toBeGreaterThanOrEqual(0.85);
        expect(ratio, `${cat.id}.${key}`).toBeLessThanOrEqual(1.15);
      }
    }
  });

  it("gives dash a higher sprint cap and blaze a lower one than default", () => {
    expect(tuningFor(getCat("dash")).sprintSpeed).toBeGreaterThan(DEFAULT_TUNING.sprintSpeed);
    expect(tuningFor(getCat("blaze")).sprintSpeed).toBeLessThan(DEFAULT_TUNING.sprintSpeed);
    expect(tuningFor(getCat("luna"))).toEqual(DEFAULT_TUNING);
  });
});

describe("chapter table", () => {
  it("has six chapters with unique ids", () => {
    expect(CHAPTERS.length).toBe(6);
    expect(new Set(CHAPTERS.map((chapter) => chapter.id)).size).toBe(6);
  });

  it("maps every chapter to a distinct roster cat", () => {
    const homeCats = CHAPTERS.map((chapter) => chapter.homeCatId);
    for (const id of homeCats) {
      expect(isCatId(id)).toBe(true);
    }
    expect(new Set(homeCats).size).toBe(CHAPTERS.length);
  });

  it("unlocks only chapter-1, the forest chapter with Luna at home", () => {
    const unlocked = CHAPTERS.filter((chapter) => canEnterChapter(chapter));
    expect(unlocked.map((chapter) => chapter.id)).toEqual(["chapter-1"]);
    const first = getChapter("chapter-1");
    expect(first.biome).toBe("forest");
    expect(first.homeCatId).toBe("luna");
  });

  it("reports every locked chapter as not enterable", () => {
    for (const chapter of CHAPTERS.filter((c) => c.locked)) {
      expect(canEnterChapter(chapter), chapter.id).toBe(false);
    }
  });
});

function findCat(id: string): CatDefinition | undefined {
  return CATS.find((cat) => cat.id === id);
}

describe("locked kit spot checks", () => {
  it("keeps the WW-D1 kit language in accessory tags", () => {
    expect(findCat("luna")?.accessories).toContain("star scarf");
    expect(findCat("shadow")?.accessories).toContain("utility pouch");
    expect(findCat("blaze")?.accessories).toContain("armor bit");
    expect(findCat("misty")?.accessories).toContain("wave pouch");
    expect(findCat("willow")?.accessories).toContain("herbal satchel");
    expect(findCat("dash")?.accessories).toContain("goggles");
  });
});
