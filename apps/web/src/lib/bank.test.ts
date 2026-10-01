import { describe, expect, it } from "vitest";
import { initialStatus, maxSimilarity, parseSolver, quoteStatus, sanitizeItems, shuffleKeep, similarity, solverStatus } from "./bank";

const good = { stem: "Apa fungsi utama variabel dalam program?", options: ["Menyimpan nilai", "Mencetak layar", "Menghapus berkas", "Mengulang langkah"], answer: 0, explanation: "Variabel menyimpan nilai.", bloom: "pahami", difficulty: 1, quote: "Variabel menyimpan nilai yang dapat berubah" };

describe("sanitizeItems", () => {
  it("menjaga kunci setelah opsi diacak", () => {
    for (let s = 0; s < 20; s++) { let x = s + 1; const rnd = () => ((x = (x * 9301 + 49297) % 233280) / 233280); const r = sanitizeItems({ items: [good] }, rnd)[0]; expect(r.options[r.answer]).toBe("Menyimpan nilai"); }
  });
  it("membuang opsi kembar, 'semua benar', kunci di luar rentang, dan butir pendek", () => {
    const r = sanitizeItems({ items: [{ ...good, options: ["a", "A", "b", "c"] }, { ...good, options: ["x1", "y1", "Semua jawaban benar", "z1"] }, { ...good, answer: 9 }, { ...good, stem: "pendek" }, good] });
    expect(r).toHaveLength(1);
  });
  it("bloom tak dikenal jadi 'pahami'; kesulitan memberi rating awal", () => {
    const r = sanitizeItems({ items: [{ ...good, bloom: "aneh", difficulty: 3 }] })[0]; expect(r.bloom).toBe("pahami"); expect(r.rating).toBe(1400);
  });
  it("bukan objek yang benar → kosong", () => expect(sanitizeItems("x")).toEqual([]));
});
describe("shuffleKeep", () => it("permutasi dengan kunci tetap menunjuk opsi yang sama", () => { const r = shuffleKeep(["a", "b", "c", "d"], 2, () => 0.3); expect(r.options[r.answer]).toBe("c"); expect([...r.options].sort()).toEqual(["a", "b", "c", "d"]); }));
describe("quoteStatus", () => {
  const src = "Pada pelajaran ini, variabel menyimpan nilai yang dapat berubah selama program berjalan. Percabangan memilih jalur.";
  it("persis → ok (abaikan huruf besar dan tanda baca)", () => expect(quoteStatus("Variabel menyimpan nilai yang dapat berubah", src)).toBe("ok"));
  it("selisih kecil masih ok, mengarang → lemah, kosong → tanpa", () => {
    expect(quoteStatus("variabel menyimpan nilai yang dapat berubah selama program berjalan ya", src)).toBe("ok");
    expect(quoteStatus("Kucing adalah hewan berkaki empat yang suka tidur siang", src)).toBe("lemah");
    expect(quoteStatus("", src)).toBe("tanpa");
  });
});
describe("kemiripan", () => {
  it("soal hampir sama tinggi, soal berbeda rendah", () => {
    expect(similarity("Apa fungsi utama variabel dalam program?", "Apa fungsi utama variabel dalam sebuah program?")).toBeGreaterThan(0.5);
    expect(similarity("Apa fungsi utama variabel dalam program?", "Sebutkan struktur perulangan yang menguji kondisi lebih dulu")).toBeLessThan(0.1);
    expect(maxSimilarity("sama persis soal ini", ["sama persis soal ini", "lain"])).toBe(1);
    expect(maxSimilarity("x", [])).toBe(0);
  });
});
describe("pemecah dan status", () => {
  it("parseSolver menambal jawaban yang hilang", () => expect(parseSolver({ answers: [1, "x"] }, 3)).toEqual([1, -1, -1]));
  it("status awal", () => {
    const d = sanitizeItems({ items: [good] }, () => 0)[0];
    expect(solverStatus(d, d.answer)).toBe("ok"); expect(solverStatus(d, -1)).toBe("tidak"); expect(solverStatus(d, (d.answer + 1) % 4)).toBe("beda");
    expect(initialStatus({ solver: "ok", quote: "ok", dup: 0 }, false)).toBe("draf");
    expect(initialStatus({ solver: "ok", quote: "ok", dup: 0 }, true)).toBe("siap");
    expect(initialStatus({ solver: "beda", quote: "ok", dup: 0 }, true)).toBe("ditinjau");
    expect(initialStatus({ solver: "ok", quote: "lemah", dup: 0 }, true)).toBe("ditinjau");
  });
});
