/**
 * First-visit gate for the chapter 1 intro cutscene.
 *
 * Pure decision logic over an injectable storage so tests need no browser:
 * play on cold start (flag unset), replay only when forced via ?cutscene=1.
 * localStorage can throw (private mode, blocked storage) - treat that as
 * "never seen" on read and swallow on write so the game always boots.
 */

export const INTRO_SEEN_KEY = "ww_ch1_intro_seen";

/** The subset of the Storage API the gate needs (localStorage satisfies it). */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/**
 * Decide whether the chapter 1 intro should play.
 * @param search window.location.search (e.g. "?cutscene=1")
 */
export function shouldPlayIntro(search: string, storage: StorageLike): boolean {
  if (new URLSearchParams(search).get("cutscene") === "1") {
    return true;
  }
  try {
    return storage.getItem(INTRO_SEEN_KEY) === null;
  } catch {
    return true;
  }
}

/** Record that the intro was seen, making future autoplays opt-in. */
export function markIntroSeen(storage: StorageLike): void {
  try {
    storage.setItem(INTRO_SEEN_KEY, "1");
  } catch {
    // Storage unavailable: the intro will replay next visit, which is fine.
  }
}
