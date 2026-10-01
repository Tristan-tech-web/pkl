import { describe, expect, it } from "vitest";
import { safeNext } from "./nav";

describe("safeNext", () => {
  it("menerima jalur internal", () => {
    expect(safeNext("/gabung?kode=ABCD2345")).toBe("/gabung?kode=ABCD2345");
  });
  it("menolak tujuan eksternal dan nilai aneh", () => {
    expect(safeNext("https://jahat.example")).toBe("/dashboard");
    expect(safeNext("//jahat.example")).toBe("/dashboard");
    expect(safeNext("/\\jahat.example")).toBe("/dashboard");
    expect(safeNext(undefined)).toBe("/dashboard");
    expect(safeNext(42)).toBe("/dashboard");
  });
});
