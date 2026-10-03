import { playSound } from "./sound";

// Getar singkat sebagai umpan balik sentuhan (HP Android). Mati bila pengguna memilih hemat gerak.
// Pola pendek sengaja: benar = satu ketukan ringan, salah = dua ketukan lembut.
export type Pulse = "benar" | "salah" | "selesai";
const PATTERNS: Record<Pulse, number | number[]> = { benar: 14, salah: [10, 50, 10], selesai: [18, 40, 18, 40, 40] };

export function haptic(kind: Pulse): void {
  playSound(kind);
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  if (document.documentElement.dataset.motion === "kurangi") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  try { navigator.vibrate(PATTERNS[kind]); } catch { /* tidak didukung: abaikan */ }
}
