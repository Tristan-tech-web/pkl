import { describe, expect, it } from "vitest";
import { brandTokens, contrast, ensureContrast, hexToRgb, readableOn } from "./color";

describe("color", () => {
  it("kontras hitam-putih = 21", () => expect(contrast("#000000", "#ffffff")).toBeCloseTo(21, 0));
  it("hex 3 digit", () => expect(hexToRgb("#fff")).toEqual([255, 255, 255]));
  it("ensureContrast menggelapkan warna terang di atas putih", () => expect(contrast(ensureContrast("#ffe34d", "#ffffff"), "#ffffff")).toBeGreaterThanOrEqual(4.5));
  it("readableOn memilih sisi dengan kontras terbaik", () => { expect(readableOn("#ffe34d")).toBe("#101418"); expect(readableOn("#1d3fa8")).toBe("#ffffff"); });
  it("brandTokens menjamin pen terbaca di kertas dan kartu", () => {
    for (const c of ["#ffcc00", "#00bcd4", "#e91e63", "#0b3d91", "#8bc34a"]) {
      const t = brandTokens(c);
      expect(contrast(t.pen, "#f7f8fb")).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.onPen, t.pen)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
