import { describe, expect, it } from "vitest";
import { authorityLabel, categoryLabel, featureLabel, formatEntitlement } from "./format";

describe("format", () => {
  it("memberi label fitur dikenal dan fallback", () => {
    expect(featureLabel("ai_tutor")).toBe("Tutor AI");
    expect(featureLabel("fitur_baru")).toBe("fitur baru");
  });
  it("memformat entitlement", () => {
    expect(formatEntitlement(false, null)).toBe("Tidak tersedia");
    expect(formatEntitlement(true, null)).toBe("Tanpa batas");
    expect(formatEntitlement(true, 100)).toBe("Hingga 100");
  });
  it("memberi label otoritas dan kategori", () => {
    expect(authorityLabel("kemenag")).toBe("Kemenag");
    expect(categoryLabel("khusus")).toBe("Pendidikan khusus (SLB)");
    expect(categoryLabel("tidak-ada")).toBe("tidak-ada");
  });
});
