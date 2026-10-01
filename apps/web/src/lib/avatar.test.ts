import { describe, expect, it } from "vitest";
import { DEFAULT_AVATAR, decodeAvatar, encodeAvatar, sanitizeAvatar } from "./avatar";

describe("avatar", () => {
  it("nilai tak dikenal kembali ke bawaan", () => expect(sanitizeAvatar({ hat: "aneh", glasses: "ya", color: "biru-tua" })).toEqual(DEFAULT_AVATAR));
  it("pulang-pergi encode/decode", () => { const a = { hat: "mahkota", glasses: false, color: "ungu" } as const; expect(decodeAvatar(encodeAvatar(a))).toEqual(a); });
  it("kosong dan sampah aman", () => { expect(decodeAvatar(null)).toEqual(DEFAULT_AVATAR); expect(decodeAvatar("x.y.z")).toEqual({ ...DEFAULT_AVATAR, glasses: true }); });
});
