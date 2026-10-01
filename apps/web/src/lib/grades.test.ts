import { describe, expect, it } from "vitest";
import { currentTerm, finalGrade, predicate } from "./grades";

describe("finalGrade", () => {
  it("rata-rata berbobot", () => expect(finalGrade([{ weight: 1, maxScore: 100, score: 80 }, { weight: 3, maxScore: 100, score: 90 }])).toBe(87.5));
  it("menormalkan skala maksimum", () => expect(finalGrade([{ weight: 1, maxScore: 20, score: 15 }])).toBe(75));
  it("mengabaikan yang belum diisi", () => expect(finalGrade([{ weight: 1, maxScore: 100, score: 60 }, { weight: 5, maxScore: 100, score: null }])).toBe(60));
  it("kosong = null", () => expect(finalGrade([])).toBeNull());
});
describe("predicate", () => {
  it("batas", () => expect([predicate(90), predicate(89.9), predicate(80), predicate(70), predicate(69.9), predicate(null)]).toEqual(["A", "B", "B", "C", "D", "–"]));
});
describe("currentTerm", () => {
  const t = [{ id: "1", starts_on: "2026-07-01", ends_on: "2026-12-31" }, { id: "2", starts_on: "2027-01-01", ends_on: "2027-06-30" }];
  it("memilih semester berjalan", () => expect(currentTerm(t, "2027-02-01")?.id).toBe("2"));
  it("cadangan ke pertama", () => expect(currentTerm(t, "2030-01-01")?.id).toBe("1"));
});
