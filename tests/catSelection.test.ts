import { describe, expect, it } from "vitest";
import { CATS, DEFAULT_CAT_ID } from "../src/content/cats";
import { CatSelection, type StorageLike } from "../src/systems/catSelection";

function fakeStorage(initial: Record<string, string> = {}): StorageLike & {
  data: Record<string, string>;
} {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = value;
    },
  };
}

describe("CatSelection", () => {
  it("starts on Luna with no stored pick", () => {
    const selection = new CatSelection(fakeStorage());
    expect(selection.activeId).toBe(DEFAULT_CAT_ID);
    expect(selection.active.name).toBe("Luna");
  });

  it("lists the whole roster", () => {
    const selection = new CatSelection(fakeStorage());
    expect(selection.list()).toEqual(CATS);
  });

  it("persists a pick and restores it in a new instance", () => {
    const storage = fakeStorage();
    new CatSelection(storage).select("dash");
    expect(new CatSelection(storage).activeId).toBe("dash");
  });

  it("falls back to Luna when the stored id is stale or garbage", () => {
    const storage = fakeStorage({ "ww.activeCatId": "garfield" });
    expect(new CatSelection(storage).activeId).toBe(DEFAULT_CAT_ID);
  });

  it("works memory-only when storage is unavailable", () => {
    const selection = new CatSelection(null);
    selection.select("misty");
    expect(selection.activeId).toBe("misty");
  });

  it("cycles through the roster in order and wraps at both ends", () => {
    const selection = new CatSelection(fakeStorage());
    selection.cycle(-1);
    expect(selection.activeId).toBe("dash");
    selection.cycle(1);
    expect(selection.activeId).toBe(DEFAULT_CAT_ID);
    for (let i = 0; i < CATS.length; i++) {
      selection.cycle(1);
    }
    expect(selection.activeId).toBe(DEFAULT_CAT_ID);
  });

  it("notifies subscribers on change and honors unsubscribe", () => {
    const selection = new CatSelection(fakeStorage());
    const seen: string[] = [];
    const unsubscribe = selection.subscribe((cat) => seen.push(cat.id));
    selection.select("shadow");
    selection.select("shadow"); // no-op: same id must not re-fire
    unsubscribe();
    selection.select("blaze");
    expect(seen).toEqual(["shadow"]);
  });
});
