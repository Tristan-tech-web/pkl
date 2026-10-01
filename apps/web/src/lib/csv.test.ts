import { describe, expect, it } from "vitest";
import { csvEscape, parseCsv } from "./csv";

describe("parseCsv", () => {
  it("koma dan baris kosong diabaikan", () => expect(parseCsv("nama,kelas\nAyu,X 1\n\nBudi,X 2\n")).toEqual([["nama", "kelas"], ["Ayu", "X 1"], ["Budi", "X 2"]]));
  it("titik koma (Excel Indonesia) dan BOM", () => expect(parseCsv("﻿nama;kelas\nAyu;X 1")).toEqual([["nama", "kelas"], ["Ayu", "X 1"]]));
  it("tab dari tempel spreadsheet", () => expect(parseCsv("nama\tkelas\nAyu\tX 1")).toEqual([["nama", "kelas"], ["Ayu", "X 1"]]));
  it("tanda kutip berisi pemisah dan kutip ganda", () => expect(parseCsv('nama,catatan\n"Lestari, Ayu","Dia ""juara"""')).toEqual([["nama", "catatan"], ["Lestari, Ayu", 'Dia "juara"']]));
  it("CRLF", () => expect(parseCsv("a,b\r\n1,2\r\n")).toEqual([["a", "b"], ["1", "2"]]));
});
describe("csvEscape", () => {
  it("memberi kutip bila perlu", () => expect([csvEscape("Ayu"), csvEscape("a,b"), csvEscape('x"y')]).toEqual(["Ayu", '"a,b"', '"x""y"']));
});
