/**
 * Active-cat selection: list the roster, pick by id, cycle with a step.
 *
 * Persistence choice: `sessionStorage` - the pick survives a reload in the
 * same tab (nice while iterating) but resets per tab/session, so it never
 * pretends to be a save system. Falls back to memory-only when storage is
 * unavailable (tests, private mode); tests inject a fake StorageLike.
 */
import {
  CATS,
  DEFAULT_CAT_ID,
  getCat,
  isCatId,
  type CatDefinition,
  type CatId,
} from "../content/cats";

const STORAGE_KEY = "ww.activeCatId";

export type StorageLike = Pick<Storage, "getItem" | "setItem">;

function defaultStorage(): StorageLike | null {
  try {
    return typeof sessionStorage === "undefined" ? null : sessionStorage;
  } catch {
    // Some embeddings throw on any storage access; run memory-only.
    return null;
  }
}

export class CatSelection {
  private id: CatId;
  private readonly storage: StorageLike | null;
  private readonly listeners = new Set<(cat: CatDefinition) => void>();

  constructor(storage: StorageLike | null = defaultStorage()) {
    this.storage = storage;
    const stored = this.storage?.getItem(STORAGE_KEY);
    this.id = stored && isCatId(stored) ? stored : DEFAULT_CAT_ID;
  }

  get activeId(): CatId {
    return this.id;
  }

  get active(): CatDefinition {
    return getCat(this.id);
  }

  list(): readonly CatDefinition[] {
    return CATS;
  }

  select(id: CatId): void {
    if (id === this.id) {
      return;
    }
    this.id = id;
    try {
      this.storage?.setItem(STORAGE_KEY, id);
    } catch {
      // Quota / private-mode failures just lose persistence, not the swap.
    }
    for (const listener of this.listeners) {
      listener(this.active);
    }
  }

  /** Step through the roster in table order, wrapping at both ends. */
  cycle(step: 1 | -1): void {
    const index = CATS.findIndex((cat) => cat.id === this.id);
    const next = (index + step + CATS.length) % CATS.length;
    this.select(CATS[next].id);
  }

  /** Called with the new active cat after every change. Returns unsubscribe. */
  subscribe(listener: (cat: CatDefinition) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
