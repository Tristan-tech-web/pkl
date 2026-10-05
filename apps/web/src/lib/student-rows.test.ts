import { describe, expect, it } from "vitest";
import { accountsToCsv, parseStudentRows } from "./student-rows";

describe("parseStudentRows", () => {
  it("nama saja", () => expect(parseStudentRows("Ayu Lestari\nBudi").rows).toEqual([{ name: "Ayu Lestari" }, { name: "Budi" }]));
  it("titik koma, koma, dan tab memisahkan NIS", () => {
    const r = parseStudentRows("Ayu; 2610001\nBudi, 2610002\nCitra\t2610003").rows;
    expect(r).toEqual([{ name: "Ayu", nis: "2610001" }, { name: "Budi", nis: "2610002" }, { name: "Citra", nis: "2610003" }]);
  });
  it("koma di dalam nama tanpa NIS tidak memecah", () => expect(parseStudentRows("Surya, Made").rows[0].name).toBe("Surya, Made"));
  it("baris kosong dan tak valid dilewati", () => {
    const r = parseStudentRows("\nA\nAyu; x!\nBudi");
    expect(r.rows).toEqual([{ name: "Budi" }]);
    expect(r.skipped).toBe(2);
  });
  it("dibatasi 200", () => {
    const r = parseStudentRows(Array.from({ length: 230 }, (_, i) => `Murid ${i}`).join("\n"));
    expect(r.rows).toHaveLength(200);
    expect(r.skipped).toBe(30);
  });
});

describe("accountsToCsv", () => {
  it("meloloskan tanda kutip", () => expect(accountsToCsv([{ name: 'A "B"', login_id: "x-1", password: "pw", status: "dibuat" }])).toContain('"A ""B"""'));
});
