/**
 * Tiny procedural SFX layer: soft sine/triangle blips for jump, landing,
 * objective progress, and chapter completion. No audio assets - every cue is
 * synthesized on the fly with WebAudio, so it costs nothing to ship and never
 * clashes with the whimsical, non-harsh tone the art bible calls for.
 *
 * The AudioContext is created lazily and resumed on the first call, which
 * happens from a real user gesture (Start/Continue click, first keypress) so
 * browser autoplay policies never block it.
 */

type Wave = OscillatorType;

interface Tone {
  freq: number;
  start: number;
  duration: number;
  gain: number;
  wave?: Wave;
}

export class GameAudio {
  private context: AudioContext | null = null;
  private readonly master: { gain: number } = { gain: 0.16 };

  /** Prime the AudioContext from a real user gesture (e.g. the title button). */
  unlock(): void {
    this.ensureContext();
  }

  private ensureContext(): AudioContext | null {
    if (this.context) {
      if (this.context.state === "suspended") void this.context.resume();
      return this.context;
    }
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    this.context = new Ctor();
    return this.context;
  }

  private playTones(tones: readonly Tone[]): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    for (const tone of tones) {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.type = tone.wave ?? "sine";
      oscillator.frequency.setValueAtTime(tone.freq, now + tone.start);
      const peak = tone.gain * this.master.gain;
      const attackEnd = now + tone.start + Math.min(0.02, tone.duration * 0.3);
      const releaseEnd = now + tone.start + tone.duration;
      gainNode.gain.setValueAtTime(0.0001, now + tone.start);
      gainNode.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0001), attackEnd);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, releaseEnd);
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.start(now + tone.start);
      oscillator.stop(releaseEnd + 0.02);
    }
  }

  /** Soft upward chirp on takeoff. */
  playJump(): void {
    this.playTones([{ freq: 520, start: 0, duration: 0.16, gain: 0.55, wave: "triangle" }]);
  }

  /** Low, brief thud on landing - loudness eases in proportion to impact speed. */
  playLand(impact: number): void {
    const strength = Math.min(Math.max(impact, 0), 1);
    this.playTones([{ freq: 160 - strength * 40, start: 0, duration: 0.14, gain: 0.35 + strength * 0.35, wave: "sine" }]);
  }

  /** Bright two-note chime when an objective completes. */
  playObjective(): void {
    this.playTones([
      { freq: 660, start: 0, duration: 0.16, gain: 0.5, wave: "triangle" },
      { freq: 880, start: 0.09, duration: 0.22, gain: 0.5, wave: "triangle" },
    ]);
  }

  /** Small rising arpeggio for chapter completion. */
  playComplete(): void {
    this.playTones([
      { freq: 523, start: 0, duration: 0.18, gain: 0.5, wave: "triangle" },
      { freq: 659, start: 0.11, duration: 0.18, gain: 0.5, wave: "triangle" },
      { freq: 784, start: 0.22, duration: 0.28, gain: 0.55, wave: "triangle" },
      { freq: 1047, start: 0.36, duration: 0.36, gain: 0.45, wave: "triangle" },
    ]);
  }
}
