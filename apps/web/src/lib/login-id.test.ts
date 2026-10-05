import { describe, expect, it } from "vitest";
import { isStudentId, toLoginEmail } from "./login-id";

describe("toLoginEmail", () => {
  it("email dipakai apa adanya", () => expect(toLoginEmail(" guru@sekolah.id ")).toBe("guru@sekolah.id"));
  it("ID murid dipetakan, huruf kecil", () => expect(toLoginEmail("BGB-2610001")).toBe("bgb-2610001@murid.edusmart.test"));
  it("ID murid tidak valid ditolak", () => {
    expect(toLoginEmail("abc")).toBeNull();
    expect(toLoginEmail("a b-123")).toBeNull();
    expect(toLoginEmail("")).toBeNull();
  });
  it("isStudentId", () => { expect(isStudentId("smk1-12345")).toBe(true); expect(isStudentId("12345")).toBe(false); });
});
