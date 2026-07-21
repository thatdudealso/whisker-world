/**
 * Chapter 1 intro cutscene beats - locked WW-D4 storyboard (six beats).
 *
 * This is data only: the runtime lives in src/cutscenes/. Dialogue is the
 * working copy from the WW-D4 lock; captain may polish lines later, but the
 * beat order, speakers, and arc are locked. Storyboard reference frames
 * (when produced) land under assets/storyboards/ww-d4/ - none required here.
 */

export interface CutsceneBeat {
  /** Stable id, used by tests and future save/telemetry hooks. */
  id: string;
  /** Card title shown above the line. */
  title: string;
  /** Who is speaking (or "Crew" for the ensemble). */
  speaker: string;
  /** The spoken line for this card. */
  line: string;
  /** Biome / setting tag; the overlay maps this to a solid-color plate. */
  biomeTag: string;
  /** Staging notes from the storyboard lock (not rendered). */
  notes: string;
}

export const CHAPTER1_BEATS: readonly CutsceneBeat[] = [
  {
    id: "c1-opening-tear",
    title: "The Opening Tear",
    speaker: "Luna",
    line: "Something's wrong with the stars…",
    biomeTag: "glowing-forest",
    notes: "Luna alone in the Glowing Forest, looking up as the first tear splits the sky.",
  },
  {
    id: "c2-velvets-offer",
    title: "Velvet's Offer",
    speaker: "Velvet",
    line: "Join the winning side. The Rift pays.",
    biomeTag: "neon-shadow",
    notes: "Velvet in shadow against neon signage; the offer that frames the villain.",
  },
  {
    id: "c3-crew-map",
    title: "Six Trails, One Tear",
    speaker: "Crew",
    line: "Six trails. One tear. We go together.",
    biomeTag: "crew-den",
    notes: "All six cats around the map table; the party forms.",
  },
  {
    id: "c4-rift-wisp",
    title: "The Rift-Wisp",
    speaker: "Rift-Wisp",
    line: "Oh. Visitors.",
    biomeTag: "rift",
    notes: "First Rift creature emerges from the tear; curious, not yet hostile.",
  },
  {
    id: "c5-boss-setpiece",
    title: "Hold the Lanes",
    speaker: "Luna",
    line: "Hold the lanes - seal the tear!",
    biomeTag: "rift",
    notes: "Boss setpiece tease: lane defense around the tear.",
  },
  {
    id: "c6-aftermath",
    title: "Aftermath",
    speaker: "Velvet",
    line: "Cute. Try that in my city.",
    biomeTag: "neon-shadow",
    notes: "Velvet watching from the neon skyline; hook into chapter 2.",
  },
];
