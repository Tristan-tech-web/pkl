import { describe, expect, it } from "vitest";
import { DEFAULT_POLICY, encodeLook, experienceForGrade, resolveLook, usableThemes } from "./appearance";

describe("resolveLook", () => {
  it("bawaan murid mengikuti jenjang", () => {
    expect(resolveLook({ group: "student", grade: 3 }).experience).toBe("ceria");
    expect(resolveLook({ group: "student", grade: 10 }).experience).toBe("seru");
    expect(experienceForGrade(null)).toBe("seru");
  });
  it("staf: Ringkas, tanpa 3D, gerak dikurangi, pilihan dikunci", () => {
    const l = resolveLook({ group: "staff", prefs: { experience: "seru", theme: "kota-neon" } });
    expect(l).toMatchObject({ experience: "ringkas", scene3d: "mati", motion: "kurangi", theme: "kertas" });
  });
  it("staf boleh memilih bila sekolah mengizinkan", () => {
    const l = resolveLook({ group: "staff", policy: { ...DEFAULT_POLICY, staffCanChange: true }, prefs: { theme: "laut" } });
    expect(l.theme).toBe("laut"); expect(l.experience).toBe("ringkas");
  });
  it("tema di luar daftar izin ditolak dan jatuh ke bawaan", () => {
    const policy = { ...DEFAULT_POLICY, allowedThemes: ["kertas", "hutan"], defaultTheme: "hutan" };
    expect(resolveLook({ group: "student", grade: 9, policy, prefs: { theme: "kota-neon" } }).theme).toBe("hutan");
  });
  it("warna sekolah hanya tersedia bila ada warna merek, dan kontrasnya terjamin", () => {
    expect(usableThemes(DEFAULT_POLICY)).not.toContain("warna-sekolah");
    const l = resolveLook({ group: "staff", policy: { ...DEFAULT_POLICY, brandColor: "#ffcc00" } });
    expect(l.theme).toBe("warna-sekolah"); expect(l.brand?.onPen).toMatch(/^#/);
  });
  it("sekolah mematikan 3D dan kustomisasi siswa", () => {
    const l = resolveLook({ group: "student", grade: 5, policy: { ...DEFAULT_POLICY, allow3d: false, studentCanCustomize: false }, prefs: { theme: "kota-neon", experience: "seru" } });
    expect(l).toMatchObject({ scene3d: "mati", experience: "ceria", theme: "permen" });
  });
  it("cookie berformat v1 dengan 11 bagian", () => expect(encodeLook(resolveLook({ group: "student", grade: 3 })).split("|")).toHaveLength(11));
});
