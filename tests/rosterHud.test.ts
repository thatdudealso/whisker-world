import { afterEach, describe, expect, it, vi } from "vitest";
import { CATS } from "../src/content/cats";
import { createRosterHud } from "../src/ui/rosterHud";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function makeElement(): any {
  return {
    style: { cssText: "", borderLeft: "" },
    textContent: "",
    appendChild: vi.fn(),
    addEventListener: vi.fn(),
  };
}

describe("rosterHud", () => {
  it("ignores held roster keys", () => {
    const listeners = new Map<string, (event: KeyboardEvent) => void>();
    const root = makeElement();
    const selection = {
      active: CATS[0],
      cycle: vi.fn(),
      select: vi.fn(),
      subscribe: vi.fn(() => vi.fn()),
    };

    vi.stubGlobal("window", {
      addEventListener: (type: string, listener: (event: KeyboardEvent) => void) => {
        listeners.set(type, listener);
      },
      removeEventListener: vi.fn(),
    });
    vi.stubGlobal("document", {
      createElement: vi.fn(() => makeElement()),
    });

    createRosterHud(root as never, selection as never);

    const handler = listeners.get("keydown");
    expect(handler).toBeDefined();

    handler?.({
      key: "]",
      metaKey: false,
      ctrlKey: false,
      altKey: false,
      repeat: false,
    } as KeyboardEvent);
    handler?.({
      key: "]",
      metaKey: false,
      ctrlKey: false,
      altKey: false,
      repeat: true,
    } as KeyboardEvent);

    expect(selection.cycle).toHaveBeenCalledTimes(1);
    expect(selection.cycle).toHaveBeenCalledWith(1);
  });
});
