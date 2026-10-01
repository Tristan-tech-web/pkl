import { describe, expect, it } from "vitest";
import { findHeaderRow, guessCategory, guessMapping, normalizePeople, parseDate } from "./intake";

describe("guessMapping", () => {
  it("judul Dapodik", () => {
    const m = guessMapping(["No", "Nama", "NIPD", "JK", "NISN", "Tempat Lahir", "Tanggal Lahir", "Rombel Saat Ini", "No HP"]);
    expect(m).toMatchObject({ full_name: 1, gender: 3, nisn: 4, birth_place: 5, birth_date: 6, class_name: 7, phone: 8 });
  });
  it("Excel sekolah bebas", () => expect(guessMapping(["Nama Siswa", "Kelas", "Nama Ayah", "HP Ortu"])).toMatchObject({ full_name: 0, class_name: 1, guardian_name: 2, guardian_phone: 3 }));
  it("satu kolom satu bidang", () => { const m = guessMapping(["Nama", "Telepon"]); expect(new Set(Object.values(m)).size).toBe(Object.values(m).length); });
});
describe("findHeaderRow", () => it("melewati judul di atas", () => expect(findHeaderRow([["DAFTAR PESERTA DIDIK"], [""], ["No", "Nama", "NISN", "Kelas"], ["1", "Ayu", "123", "X"]])).toBe(2)));
describe("guessCategory", () => {
  it("tabel siswa", () => expect(guessCategory("data.xlsx", ["Nama", "NISN", "Kelas"]).category).toBe("siswa"));
  it("tabel guru", () => expect(guessCategory("ptk.xlsx", ["Nama", "NIP", "Jabatan", "HP"]).category).toBe("guru"));
  it("dari nama berkas", () => expect([guessCategory("Tata Tertib Siswa 2026.pdf", null).category, guessCategory("LKS Matematika kelas 10.pdf", null).category, guessCategory("random.bin", null).category]).toEqual(["peraturan", "lks", "belum_dipilah"]));
});
describe("parseDate", () => {
  it("format umum", () => expect([parseDate("14/03/2010"), parseDate("2010-3-4"), parseDate("14 Maret 2010"), parseDate("14.03.10"), parseDate("40000"), parseDate("31/02/2010"), parseDate("abc")]).toEqual(["2010-03-14", "2010-03-04", "2010-03-14", "2010-03-14", "2009-07-06", null, null]));
});
describe("normalizePeople", () => {
  const header = ["Nama", "NISN", "JK", "Tgl Lahir", "HP"];
  const rows = [header, ["Ayu  Lestari", "98765432", "Perempuan", "14/03/2010", "+6281200000001"], ["", "1", "", "", ""], ["Budi", "0098765432", "L", "", ""], ["Citra", "1234567890", "x", "", "812"]];
  const r = normalizePeople(rows, 0, guessMapping(header));
  it("membersihkan dan melengkapi", () => expect(r[0].values).toMatchObject({ full_name: "Ayu Lestari", nisn: "0098765432", gender: "P", birth_date: "2010-03-14", phone: "081200000001" }));
  it("menolak nama kosong", () => expect(r[1].errors).toContain("nama kosong"));
  it("NISN ganda di berkas", () => expect(r[2].errors).toContain("NISN ganda di berkas"));
  it("peringatan tidak memblokir", () => { expect(r[3].values).not.toBeNull(); expect(r[3].warnings).toContain("jenis kelamin tidak dikenali"); });
});
