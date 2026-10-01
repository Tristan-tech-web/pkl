import { describe, expect, it } from "vitest";
import { DEFAULT_REPORT_CONFIG, describeAchievement, gradeLabel, groupsToText, parseGroups, parseScale, sanitizeConfig } from "./report-config";

describe("sanitizeConfig", () => {
  it("masukan sampah jadi bawaan", () => expect(sanitizeConfig(null)).toEqual(DEFAULT_REPORT_CONFIG));
  it("memangkas dan membatasi", () => {
    const c = sanitizeConfig({ title: "X".repeat(200), signatures: ["a", "b", "c", "d", "e", ""], groups: [{ name: "A", subjects: ["Mat", 5, ""] }, { name: "" }], scale: [{ min: 50, label: "C" }, { min: 90, label: "A" }, { min: 150, label: "" }] });
    expect(c.title.length).toBe(80);
    expect(c.signatures).toHaveLength(4);
    expect(c.groups).toEqual([{ name: "A", subjects: ["Mat"] }]);
    expect(c.scale.map((s) => s.label)).toEqual(["A", "C"]);
  });
  it("tipe salah diabaikan", () => expect(sanitizeConfig({ columns: { nilai: "ya" }, sections: { sikap: 1 } }).columns.nilai).toBe(true));
});
describe("gradeLabel", () => it("sesuai skala sekolah", () => {
  const s = parseScale("93=Sangat Baik, 80=Baik, 0=Cukup");
  expect([gradeLabel(s, 95), gradeLabel(s, 80), gradeLabel(s, 10), gradeLabel(s, null)]).toEqual(["Sangat Baik", "Baik", "Cukup", "–"]);
}));
describe("describeAchievement", () => {
  it("kekuatan dan penguatan", () => expect(describeAchievement([{ title: "UH 1", pct: 92 }, { title: "UTS", pct: 60 }, { title: "Kuis", pct: 80 }], 70)).toBe("Menunjukkan capaian baik pada UH 1. Perlu penguatan pada UTS."));
  it("sesuai harapan", () => expect(describeAchievement([{ title: "UH", pct: 75 }], 70)).toBe("Capaian sesuai harapan."));
  it("kosong", () => expect(describeAchievement([], 70)).toBe(""));
});
describe("kelompok", () => it("bolak-balik", () => {
  const g = parseGroups("Kelompok A: Matematika; Bahasa Indonesia\nKelompok B: Seni");
  expect(g).toEqual([{ name: "Kelompok A", subjects: ["Matematika", "Bahasa Indonesia"] }, { name: "Kelompok B", subjects: ["Seni"] }]);
  expect(parseGroups(groupsToText(g))).toEqual(g);
}));
