import { describe, expect, it } from "vitest";
import { scrubAi, VOICE_RULES } from "./voice";

describe("scrubAi", () => {
  it("mengganti tanda pisah panjang dengan koma", () => {
    expect(scrubAi("Puncak parabola — titik tertinggi atau terendah — ada di x = -b/2a")).toBe("Puncak parabola, titik tertinggi atau terendah, ada di x = -b/2a");
  });
  it("tidak merusak rentang angka", () => expect(scrubAi("Baca halaman 10–12 dulu")).toBe("Baca halaman 10–12 dulu"));
  it("membuang pembuka basa-basi", () => {
    expect(scrubAi("Tentu! Pertanyaan bagus. Akar persamaan adalah nilai x yang membuat y = 0.")).toBe("Akar persamaan adalah nilai x yang membuat y = 0.");
    expect(scrubAi("Baik, mari kita mulai dari contoh.")).toBe("Ayo mulai dari contoh.");
  });
  it("membuang penutup basa-basi", () => {
    expect(scrubAi("Diskriminan menentukan jumlah akar. Semoga penjelasan ini membantu!")).toBe("Diskriminan menentukan jumlah akar.");
    expect(scrubAi("Coba hitung D dulu. Jangan ragu untuk bertanya lagi ya.")).toBe("Coba hitung D dulu.");
  });
  it("mengganti kata khas AI", () => expect(scrubAi("Ini krusial untuk ujian.")).toBe("Ini penting untuk ujian."));
  it("plain membuang huruf tebal dan judul markdown", () => expect(scrubAi("## Langkah\n**D** = b^2 - 4ac", { plain: true })).toBe("Langkah\nD = b^2 - 4ac"));
  it("plain membuang cetak miring tapi tidak perkalian", () => expect(scrubAi("angka *real* dan 2*3*4", { plain: true })).toBe("angka real dan 2*3*4"));
  it("idempoten", () => { const a = scrubAi("Tentu! Ini — contoh. Semoga membantu!"); expect(scrubAi(a)).toBe(a); });
  it("aturan gaya menyebut larangan inti", () => { expect(VOICE_RULES).toContain("tanda pisah panjang"); expect(VOICE_RULES).toContain("Semoga membantu"); });
});
