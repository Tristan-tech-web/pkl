import { describe, expect, it } from "vitest";
import { guessFinMapping, matchStudents, normalizeFinance, parseAmount } from "./finance-import";

describe("finance-import", () => {
  const rows = [["Nama Siswa", "Kelas", "Tagihan", "Nominal", "Status Bayar"], ["Dewi Anggraini", "X PPLG 1", "SPP Oktober", "250.000", "Lunas"], ["Putu Sedana", "X PPLG 1", "LKS", "Rp 45.000", "Belum"], ["", "", "", "", ""], ["Budi", "X", "SPP", "abc", ""]];
  it("memetakan kolom", () => expect(guessFinMapping(rows[0])).toMatchObject({ name: 0, class_name: 1, amount: 3, status: 4 }));
  it("parse nominal", () => { expect(parseAmount("Rp 1.250.000")).toBe(1250000); expect(parseAmount("45000,50")).toBe(45001); expect(parseAmount("-5")).toBeNull(); });
  it("normalisasi dan status", () => {
    const r = normalizeFinance(rows, 0, guessFinMapping(rows[0]));
    expect(r).toHaveLength(3); expect(r[0].row?.paid).toBe(true); expect(r[1].row?.paid).toBe(false); expect(r[2].error).toBe("Nominal tidak valid");
  });
  it("mencocokkan nama (unik saja) dan NIS", () => {
    const f = normalizeFinance(rows, 0, guessFinMapping(rows[0])).flatMap((x) => (x.row ? [x.row] : []));
    const res = matchStudents(f, [{ id: "a", name: "DEWI anggraini", nis: null }, { id: "b", name: "Putu Sedana", nis: "1" }, { id: "c", name: "Putu Sedana", nis: "2" }]);
    expect(res.matched.map((m) => m.memberId)).toEqual(["a"]); expect(res.unmatched).toHaveLength(1);
  });
});
