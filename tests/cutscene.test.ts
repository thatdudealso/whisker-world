import { describe, expect, it } from "vitest";
import { CHAPTER1_BEATS, type CutsceneBeat } from "../src/content/cutscenes/chapter1";
import { CutscenePlayer } from "../src/cutscenes/player";
import {
  INTRO_SEEN_KEY,
  markIntroSeen,
  shouldPlayIntro,
  type StorageLike,
} from "../src/cutscenes/introGate";

function makeStorage(initial: Record<string, string> = {}): StorageLike {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, value),
  };
}

describe("chapter 1 content (WW-D4 lock)", () => {
  it("has the six locked beats in storyboard order", () => {
    expect(CHAPTER1_BEATS.map((b) => b.id)).toEqual([
      "c1-opening-tear",
      "c2-velvets-offer",
      "c3-crew-map",
      "c4-rift-wisp",
      "c5-boss-setpiece",
      "c6-aftermath",
    ]);
  });

  it("every beat has full card data", () => {
    for (const beat of CHAPTER1_BEATS) {
      for (const field of ["id", "title", "speaker", "line", "biomeTag", "notes"] as const) {
        expect(beat[field], `${beat.id}.${field}`).toBeTruthy();
      }
    }
  });
});

describe("CutscenePlayer state machine", () => {
  const beats = CHAPTER1_BEATS;

  it("walks idle -> playing -> finished through every beat in order", () => {
    const seen: string[] = [];
    let finished = 0;
    const player = new CutscenePlayer(beats, {
      onBeat: (beat) => seen.push(beat.id),
      onFinished: () => finished++,
    });

    expect(player.status).toBe("idle");
    expect(player.currentBeat).toBeNull();

    expect(player.start()).toBe(true);
    expect(player.status).toBe("playing");
    expect(player.beatCount).toBe(6);

    for (let i = 0; i < beats.length - 1; i++) {
      expect(player.currentBeat?.id).toBe(beats[i].id);
      expect(player.beatNumber).toBe(i + 1);
      player.advance();
    }
    expect(player.status).toBe("playing");
    player.advance(); // past the last beat
    expect(player.status).toBe("finished");
    expect(seen).toEqual(beats.map((b) => b.id));
    expect(finished).toBe(1);
  });

  it("cannot double-trigger: start is a no-op unless idle", () => {
    const player = new CutscenePlayer(beats);
    expect(player.start()).toBe(true);
    player.advance();
    expect(player.start()).toBe(false);
    expect(player.beatNumber).toBe(2); // restart did not rewind

    player.skip();
    expect(player.start()).toBe(false);
    expect(player.status).toBe("finished");
  });

  it("skip jumps straight to finished and reports skipped", () => {
    const results: boolean[] = [];
    const player = new CutscenePlayer(beats, { onFinished: (s) => results.push(s) });
    player.start();
    player.skip();
    expect(player.status).toBe("finished");
    expect(results).toEqual([true]);
  });

  it("completing normally reports not-skipped", () => {
    const results: boolean[] = [];
    const player = new CutscenePlayer(beats, { onFinished: (s) => results.push(s) });
    player.start();
    for (let i = 0; i < beats.length; i++) player.advance();
    expect(results).toEqual([false]);
  });

  it("advance and skip are no-ops when idle or finished", () => {
    let finished = 0;
    const player = new CutscenePlayer(beats, { onFinished: () => finished++ });
    player.advance();
    player.skip();
    expect(player.status).toBe("idle");

    player.start();
    player.skip();
    player.skip();
    player.advance();
    expect(finished).toBe(1);
  });

  it("rejects an empty beat list", () => {
    expect(() => new CutscenePlayer([] as CutsceneBeat[])).toThrow();
  });
});

describe("intro seen-flag gate", () => {
  it("plays on cold start when the flag is unset", () => {
    expect(shouldPlayIntro("", makeStorage())).toBe(true);
  });

  it("does not replay once the flag is set", () => {
    const storage = makeStorage();
    markIntroSeen(storage);
    expect(storage.getItem(INTRO_SEEN_KEY)).toBe("1");
    expect(shouldPlayIntro("", storage)).toBe(false);
  });

  it("?cutscene=1 forces a replay even when already seen", () => {
    const storage = makeStorage({ [INTRO_SEEN_KEY]: "1" });
    expect(shouldPlayIntro("?cutscene=1", storage)).toBe(true);
    expect(shouldPlayIntro("?cutscene=0", storage)).toBe(false);
  });

  it("treats throwing storage as never-seen and swallows write errors", () => {
    const broken: StorageLike = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };
    expect(shouldPlayIntro("", broken)).toBe(true);
    expect(() => markIntroSeen(broken)).not.toThrow();
  });
});
