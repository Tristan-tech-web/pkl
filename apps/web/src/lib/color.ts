// Utilitas warna murni (tanpa dependensi): kontras WCAG dan penurunan palet dari satu warna merek.
export type RGB = [number, number, number];

export function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "").trim();
  const f = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  if (!/^[0-9a-fA-F]{6}$/.test(f)) throw new Error(`warna tidak valid: ${hex}`);
  return [parseInt(f.slice(0, 2), 16), parseInt(f.slice(2, 4), 16), parseInt(f.slice(4, 6), 16)];
}
export const rgbToHex = ([r, g, b]: RGB) => "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");

const lin = (c: number) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
export const luminance = (hex: string) => { const [r, g, b] = hexToRgb(hex); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); };
export function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/** Campur dua warna: t=0 → a, t=1 → b. */
export const mix = (a: string, b: string, t: number) => {
  const [p, q] = [hexToRgb(a), hexToRgb(b)];
  return rgbToHex([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t]);
};

/** Menggelapkan (atau mencerahkan bila target gelap) `fg` sampai kontras terhadap `bg` ≥ min. */
export function ensureContrast(fg: string, bg: string, min = 4.5): string {
  if (contrast(fg, bg) >= min) return fg;
  const towards = luminance(bg) > 0.5 ? "#000000" : "#ffffff";
  for (let t = 0.05; t <= 1.0001; t += 0.05) {
    const c = mix(fg, towards, t);
    if (contrast(c, bg) >= min) return c;
  }
  return towards;
}

/** Teks di atas warna: hitam atau putih, mana yang kontrasnya lebih tinggi. */
export const readableOn = (bg: string) => (contrast("#ffffff", bg) >= contrast("#101418", bg) ? "#ffffff" : "#101418");

/** Turunkan token merek dari satu warna sekolah, kontras terjamin terhadap kertas dan kartu. */
export function brandTokens(brand: string, paper = "#f7f8fb", card = "#ffffff") {
  const pen = ensureContrast(ensureContrast(brand, paper, 4.5), card, 4.5);
  return { pen, penStrong: mix(pen, "#000000", 0.25), onPen: readableOn(pen), hi: mix(brand, "#ffffff", 0.7) };
}
