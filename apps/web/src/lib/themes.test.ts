import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { contrast } from "./color";
import { THEMES, generateThemeCss } from "./themes";

describe("tema: kontras terjamin", () => {
  for (const th of THEMES) {
    const k = th.tokens;
    it(`${th.id}: teks utama ≥ 7:1 di kertas dan kartu`, () => {
      expect(contrast(k.ink, k.paper)).toBeGreaterThanOrEqual(7);
      expect(contrast(k.ink, k.card)).toBeGreaterThanOrEqual(7);
    });
    it(`${th.id}: teks sekunder ≥ 4,5:1`, () => {
      expect(contrast(k.inkSoft, k.paper)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(k.inkSoft, k.card)).toBeGreaterThanOrEqual(4.5);
    });
    it(`${th.id}: warna utama terbaca sebagai teks dan tombol`, () => {
      expect(contrast(k.pen, k.paper)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(k.pen, k.card)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(k.onPen, k.pen)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(k.onAccent, k.accent)).toBeGreaterThanOrEqual(4.5);
    });
    it(`${th.id}: status ok/warn/bad terbaca di latarnya dan di kartu`, () => {
      for (const [fg, bg] of [["ok", "okBg"], ["warn", "warnBg"], ["bad", "badBg"]] as const) {
        expect(contrast(k[fg], k[bg])).toBeGreaterThanOrEqual(4.5);
        expect(contrast(k[fg], k.card)).toBeGreaterThanOrEqual(4.5);
      }
    });
  }
  it("themes.generated.css sinkron dengan themes.ts (jalankan: pnpm gen:themes)", () => {
    expect(readFileSync(new URL("../app/themes.generated.css", import.meta.url), "utf8")).toBe(generateThemeCss());
  });
});
