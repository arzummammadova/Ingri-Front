/**
 * Ingri UI sounds — original, synthesized at runtime with the Web Audio API (no audio files).
 * Audio is created lazily and only after the first user gesture (browser autoplay rules).
 */
export type SoundName = "correct" | "wrong" | "fanfare" | "levelup" | "streak" | "click" | "pop" | "send" | "saved";

export const SOUND_EVENT = "ingri:sound";
const KEY = "ingri:prefs";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let unlocked = false;

function settings() {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) || "{}");
    return { on: p.sound !== false, volume: typeof p.volume === "number" ? Math.min(1, Math.max(0, p.volume)) : 0.6, reduced: !!p.reducedMotion };
  } catch {
    return { on: true, volume: 0.6, reduced: false };
  }
}

function audio(): AudioContext | null {
  if (typeof window === "undefined" || !unlocked) return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

if (typeof window !== "undefined") {
  const unlock = () => {
    unlocked = true;
    audio();
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };
  window.addEventListener("pointerdown", unlock, { once: false });
  window.addEventListener("keydown", unlock, { once: false });
}

type Note = { f: number; t: number; d: number; type?: OscillatorType; g?: number; to?: number };

function tone(ac: AudioContext, out: AudioNode, { f, t, d, type = "sine", g = 0.3, to }: Note) {
  const start = ac.currentTime + t;
  const osc = ac.createOscillator();
  const env = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(f, start);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, start + d);
  env.gain.setValueAtTime(0.0001, start);
  env.gain.exponentialRampToValueAtTime(g, start + 0.012);
  env.gain.exponentialRampToValueAtTime(0.0001, start + d);
  osc.connect(env).connect(out);
  osc.start(start);
  osc.stop(start + d + 0.05);
}

const C5 = 523.25, D5 = 587.33, E5 = 659.25, G5 = 783.99, A5 = 880, B5 = 987.77, C6 = 1046.5, D6 = 1174.66, E6 = 1318.51, G6 = 1567.98;

const RECIPES: Record<SoundName, Note[]> = {
  // bright two-step chime
  correct: [
    { f: E5, t: 0, d: 0.14, type: "triangle", g: 0.28 },
    { f: E6, t: 0, d: 0.14, g: 0.08 },
    { f: A5, t: 0.09, d: 0.32, type: "triangle", g: 0.3 },
    { f: A5 * 2, t: 0.09, d: 0.25, g: 0.07 },
  ],
  // soft, friendly low "bloop" (not harsh)
  wrong: [
    { f: 330, to: 210, t: 0, d: 0.22, type: "sine", g: 0.3 },
    { f: 250, to: 160, t: 0.12, d: 0.26, type: "sine", g: 0.22 },
  ],
  // little celebration arpeggio + chord
  fanfare: [
    { f: C5, t: 0, d: 0.16, type: "triangle", g: 0.25 },
    { f: E5, t: 0.1, d: 0.16, type: "triangle", g: 0.25 },
    { f: G5, t: 0.2, d: 0.16, type: "triangle", g: 0.25 },
    { f: C6, t: 0.32, d: 0.55, type: "triangle", g: 0.28 },
    { f: E6, t: 0.32, d: 0.55, g: 0.1 },
    { f: G5, t: 0.32, d: 0.55, g: 0.12 },
  ],
  levelup: [
    { f: G5, t: 0, d: 0.12, type: "square", g: 0.07 },
    { f: C6, t: 0.09, d: 0.12, type: "square", g: 0.07 },
    { f: E6, t: 0.18, d: 0.12, type: "square", g: 0.07 },
    { f: G6, t: 0.27, d: 0.5, type: "triangle", g: 0.22 },
    { f: C6, t: 0.27, d: 0.5, type: "triangle", g: 0.16 },
  ],
  // whoosh up + sparkle
  streak: [
    { f: 300, to: 1200, t: 0, d: 0.28, type: "sawtooth", g: 0.05 },
    { f: G5, t: 0.18, d: 0.18, type: "triangle", g: 0.22 },
    { f: B5, t: 0.27, d: 0.18, type: "triangle", g: 0.22 },
    { f: D6, t: 0.36, d: 0.4, type: "triangle", g: 0.24 },
  ],
  click: [{ f: 1400, to: 900, t: 0, d: 0.05, type: "triangle", g: 0.14 }],
  pop: [
    { f: 520, to: 1250, t: 0, d: 0.09, type: "sine", g: 0.25 },
    { f: 1250, t: 0.07, d: 0.08, type: "sine", g: 0.08 },
  ],
  send: [{ f: 600, to: 1100, t: 0, d: 0.12, type: "sine", g: 0.16 }],
  saved: [
    { f: A5, t: 0, d: 0.12, type: "triangle", g: 0.2 },
    { f: D6, t: 0.08, d: 0.25, type: "triangle", g: 0.22 },
  ],
};

export function playSound(name: SoundName, opts: { force?: boolean } = {}) {
  if (typeof window === "undefined") return;
  const s = settings();
  window.dispatchEvent(new CustomEvent(SOUND_EVENT, { detail: { name, reduced: s.reduced } }));
  if (!s.on && !opts.force) return;
  const ac = audio();
  if (!ac || !master) return;
  master.gain.setValueAtTime(s.volume * 0.9, ac.currentTime);
  for (const note of RECIPES[name]) tone(ac, master, note);
}

/** React convenience. */
export function useSound() {
  return playSound;
}
