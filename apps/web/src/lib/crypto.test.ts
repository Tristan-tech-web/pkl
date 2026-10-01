import { describe, expect, it } from "vitest";
import { decryptSecret, encryptSecret, keyHint } from "./crypto";

const S = "rahasia-uji-minimal-16-karakter";
describe("crypto kunci sekolah", () => {
  it("bolak-balik", () => expect(decryptSecret(encryptSecret("sk-abc123", S), S)).toBe("sk-abc123"));
  it("acak tiap kali dan tidak memuat teks asli", () => {
    const a = encryptSecret("sk-abc123", S);
    expect(a).not.toContain("sk-abc123");
    expect(a).not.toBe(encryptSecret("sk-abc123", S));
  });
  it("rahasia salah ditolak", () => expect(() => decryptSecret(encryptSecret("x", S), "rahasia-lain-16-karakter!")).toThrow());
  it("data diubah ditolak", () => {
    const e = encryptSecret("sk-abc123", S);
    expect(() => decryptSecret(e.slice(0, -2) + "AA", S)).toThrow();
  });
  it("tanpa rahasia gagal", () => expect(() => encryptSecret("x", "")).toThrow());
  it("petunjuk hanya 4 karakter akhir", () => expect(keyHint("AIzaSyABCDwxyz")).toBe("…wxyz"));
});
