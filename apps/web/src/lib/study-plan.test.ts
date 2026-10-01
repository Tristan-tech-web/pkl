import { describe, expect, it } from "vitest";
import { chunkText, sanitizeChapter, sanitizeMap, sanitizeOutline, sanitizePlan, sanitizeSchedule } from "./study-plan";

describe("chunkText", () => {
  it("memotong di batas paragraf dan menjaga seluruh isi", () => {
    const t = Array.from({ length: 30 }, (_, i) => `Paragraf ${i} ` + "x".repeat(900)).join("\n\n");
    const c = chunkText(t, 9000, 20);
    expect(c.length).toBeGreaterThan(2); expect(c.every((x) => x.length <= 9000)).toBe(true);
    expect(c.join("\n\n")).toContain("Paragraf 29");
  });
  it("berkas sangat panjang digabung ke batas maksimum potongan", () => {
    const t = Array.from({ length: 400 }, (_, i) => `P${i} ` + "y".repeat(2000)).join("\n\n");
    expect(chunkText(t, 9000, 20).length).toBeLessThanOrEqual(20);
  });
});
describe("sanitizers", () => {
  it("map: buang bab tanpa judul dan elemen kosong, perbaiki jenis tak dikenal", () => {
    const r = sanitizeMap({ chapters: [{ title: "Fungsi", elements: [{ name: "Grafik", type: "aneh", difficulty: 9 }, { name: "" }], prerequisites: ["Aljabar"] }, { title: "" }] });
    expect(r).toHaveLength(1); expect(r[0].elements).toEqual([{ name: "Grafik", type: "konsep", difficulty: 2 }]);
  });
  it("outline menjaga ringkasan", () => expect(sanitizeOutline({ chapters: [{ title: "Bab A", summary: "s", elements: [{ name: "x1", type: "fakta" }] }] })[0].elements[0].type).toBe("fakta"));
  it("chapter: batas menit dan aktivitas", () => {
    const c = sanitizeChapter({ minutes: 99999, elements: [{ name: "Rumus", type: "prosedur", method: "m", why: "w", activities: ["a", "", "b"] }], tasks: ["t"] }, { title: "B", summary: "", prerequisites: [] });
    expect(c.minutes).toBeNull(); expect(c.elements[0].activities).toEqual(["a", "b"]);
  });
  it("jadwal: minggu di luar rentang dan jenis salah dibuang, diurutkan", () => {
    const r = sanitizeSchedule({ schedule: [{ week: 5, kind: "tugas", chapter: "A", what: "w", why: "y" }, { week: 99, kind: "tugas" }, { week: 2, kind: "salah" }, { week: 1, kind: "ulangan_harian", chapter: "A", what: "w", why: "y" }], spaced: [{ after_days: 3, chapter: "A", what: "w" }, { after_days: 0 }] }, 18);
    expect(r.schedule.map((x) => x.week)).toEqual([1, 5]); expect(r.spaced).toHaveLength(1);
  });
  it("plan lengkap dari jalur salin-tempel", () => {
    const p = sanitizePlan({ chapters: [{ title: "Bab 1", summary: "s", elements: [{ name: "Konsep A", type: "konsep" }] }], schedule: [{ week: 3, kind: "ulangan_harian", chapter: "Bab 1", what: "w", why: "y" }] }, 18);
    expect(p.chapters).toHaveLength(1); expect(p.schedule).toHaveLength(1);
  });
});
