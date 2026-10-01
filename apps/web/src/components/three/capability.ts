// Gerbang kemampuan 3D: hanya jalan bila pengguna, sekolah, dan perangkat mengizinkan. Tanpa efek samping saat impor.
export type Capability = { ok: boolean; reason?: string; still: boolean; quality: 0 | 1 | 2 };

export function detectCapability(): Capability {
  if (typeof window === "undefined") return { ok: false, reason: "server", still: true, quality: 0 };
  const h = document.documentElement;
  if (h.dataset["3d"] === "mati") return { ok: false, reason: "dimatikan", still: true, quality: 0 };
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return { ok: false, reason: "hemat-data", still: true, quality: 0 };
  if ((nav.deviceMemory ?? 4) <= 1) return { ok: false, reason: "memori-rendah", still: true, quality: 0 };
  try {
    const c = document.createElement("canvas");
    if (!(c.getContext("webgl2") || c.getContext("webgl"))) return { ok: false, reason: "tanpa-webgl", still: true, quality: 0 };
  } catch {
    return { ok: false, reason: "tanpa-webgl", still: true, quality: 0 };
  }
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches || h.dataset.motion === "kurangi";
  const weak = (nav.hardwareConcurrency ?? 4) <= 4 || (nav.deviceMemory ?? 4) <= 2;
  return { ok: true, still, quality: weak ? 1 : 2 };
}
