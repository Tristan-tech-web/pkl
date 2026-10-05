import { describe, expect, it } from "vitest";
import { callName } from "./names";

describe("callName", () => {
  it("melewati I dan Ni", () => { expect(callName("I Made Arya Pratama")).toBe("Made"); expect(callName("Ni Kadek Wulan Sari")).toBe("Kadek"); });
  it("nama biasa tetap", () => expect(callName("Ayu Lestari")).toBe("Ayu"));
  it("gelar dilewati", () => expect(callName("Dra. Sri Wahyuni")).toBe("Sri"));
  it("Anak Agung", () => expect(callName("Anak Agung Ngurah Bagus")).toBe("Agung"));
  it("kosong memakai cadangan", () => expect(callName("", "Anda")).toBe("Anda"));
  it("hanya I tetap terisi", () => expect(callName("I")).toBe("I"));
});
