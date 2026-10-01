import { describe, expect, it } from "vitest";
import { equation, formatNumber, roots, vertex } from "./math";

describe("math", () => {
  it("menghitung puncak dan akar", () => {
    expect(vertex({ a: 1, b: -2, c: -3 })).toEqual({ x: 1, y: -4 });
    expect(roots({ a: 1, b: -2, c: -3 })).toEqual([-1, 3]);
  });
  it("kasus tanpa akar, akar kembar, dan garis lurus", () => {
    expect(roots({ a: 1, b: 0, c: 1 })).toEqual([]);
    expect(roots({ a: 1, b: -2, c: 1 })).toEqual([1]);
    expect(roots({ a: 0, b: 2, c: -4 })).toEqual([2]);
    expect(vertex({ a: 0, b: 2, c: 1 })).toBeNull();
  });
  it("menulis persamaan dengan format Indonesia", () => {
    expect(equation({ a: 1, b: -2, c: -3 })).toBe("y = x² − 2x − 3");
    expect(equation({ a: -0.5, b: 0, c: 4 })).toBe("y = −0,5x² + 4");
    expect(equation({ a: 0, b: 0, c: 0 })).toBe("y = 0");
  });
  it("tidak menampilkan nol negatif", () => {
    expect(formatNumber(-0.01)).toBe("0");
  });
});
