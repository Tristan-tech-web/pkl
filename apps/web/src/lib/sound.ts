// Bunyi singkat saat menjawab. Mati bawaan: baru menyala kalau murid menyalakannya sendiri (disimpan di peramban ini saja).
import type { Pulse } from "./haptic";

const KEY = "edusmart:suara";
// Nada (Hz) dan lama (detik) per kejadian. Benar naik, salah turun lembut, selesai tiga nada naik.
const TONES: Record<Pulse, [number, number][]> = {
  benar: [[660, 0.09], [880, 0.12]],
  salah: [[330, 0.12], [262, 0.16]],
  selesai: [[523, 0.1], [659, 0.1], [784, 0.2]],
};

export function soundOn(): boolean {
  try { return localStorage.getItem(KEY) === "1"; } catch { return false; }
}
export function setSound(on: boolean): void {
  try { localStorage.setItem(KEY, on ? "1" : "0"); } catch { /* peramban memblokir penyimpanan: abaikan */ }
}

let ctx: AudioContext | null = null;
export function playSound(kind: Pulse): void {
  if (typeof window === "undefined" || !soundOn()) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    let t = ctx.currentTime;
    for (const [freq, dur] of TONES[kind]) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + dur + 0.02);
      t += dur * 0.9;
    }
  } catch { /* tidak didukung: abaikan */ }
}
