"use client";

/** Tiny synthesized UI sounds via the Web Audio API — no audio assets, no
 *  copyright. Gated by the desktop's mute/volume settings (kept in sync by
 *  XPDesktop calling setSoundConfig). The AudioContext is created lazily on the
 *  first play, which always follows a user gesture (boot/click), satisfying
 *  browser autoplay policies. */

export type SoundName = "startup" | "click" | "error" | "notify" | "open" | "trash";

let ctx: AudioContext | null = null;
let config = { muted: false, volume: 70 };

export function setSoundConfig(c: { muted: boolean; volume: number }): void {
  config = c;
}

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  } catch {
    return null;
  }
}

/** One short note with a quick attack/decay envelope. */
function tone(ac: AudioContext, freq: number, start: number, dur: number, gain: number, type: OscillatorType = "sine"): void {
  const osc = ac.createOscillator();
  const g = ac.createGain();
  const t = ac.currentTime + start;
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export function play(name: SoundName): void {
  if (config.muted) return;
  const ac = audio();
  if (!ac) return;
  const v = Math.max(0, Math.min(1, config.volume / 100));
  switch (name) {
    case "startup": // gentle XP-ish four-note rise
      tone(ac, 392.0, 0.0, 0.5, 0.18 * v, "triangle");
      tone(ac, 587.3, 0.12, 0.5, 0.16 * v, "triangle");
      tone(ac, 784.0, 0.24, 0.55, 0.16 * v, "triangle");
      tone(ac, 659.3, 0.40, 0.7, 0.14 * v, "sine");
      break;
    case "click":
      tone(ac, 900, 0, 0.05, 0.05 * v, "square");
      break;
    case "open":
      tone(ac, 520, 0, 0.09, 0.08 * v, "triangle");
      tone(ac, 780, 0.05, 0.1, 0.06 * v, "triangle");
      break;
    case "notify":
      tone(ac, 740, 0, 0.12, 0.1 * v, "sine");
      tone(ac, 988, 0.1, 0.16, 0.09 * v, "sine");
      break;
    case "error":
      tone(ac, 220, 0, 0.18, 0.14 * v, "sawtooth");
      tone(ac, 180, 0.16, 0.22, 0.12 * v, "sawtooth");
      break;
    case "trash":
      tone(ac, 300, 0, 0.18, 0.09 * v, "sawtooth");
      tone(ac, 140, 0.08, 0.26, 0.08 * v, "triangle");
      break;
  }
}
