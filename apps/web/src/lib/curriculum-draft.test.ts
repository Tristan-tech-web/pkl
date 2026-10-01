import { describe, expect, it } from "vitest";
import { sanitizeDraft } from "./curriculum-draft";

describe("sanitizeDraft", () => {
  it("menyaring soal yang tidak valid dan membatasi jumlah", () => {
    const r = sanitizeDraft({ nodes: [
      { title: "Fungsi kuadrat", summary: "x", minutes: 30, objectives: ["a", ""], body_md: "## Isi", questions: [
        { prompt: "Bentuk grafik?", options: ["Parabola", "Garis"], answer: 0, explanation: "Karena pangkat dua" },
        { prompt: "Rusak", options: ["A"], answer: 0, explanation: "xx" },
        { prompt: "Indeks salah", options: ["A", "B"], answer: 5, explanation: "xx" },
      ] },
      { title: "", questions: [] },
      { title: "Kedua" }, { title: "Ketiga" },
    ] }, 3);
    expect(r).toHaveLength(2);
    expect(r[0].questions).toHaveLength(1);
    expect(r[0].objectives).toEqual(["a"]);
    expect(r[1].body_md).toBe("## Kedua");
  });
  it("bukan objek valid → kosong", () => { expect(sanitizeDraft(null, 5)).toEqual([]); expect(sanitizeDraft({ nodes: "x" }, 5)).toEqual([]); });
});
