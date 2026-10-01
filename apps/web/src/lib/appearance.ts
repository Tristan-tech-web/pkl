import { brandTokens } from "./color";
import { THEME_IDS, themeById } from "./themes";

// Tampilan efektif = bawaan platform ← kebijakan sekolah ← pilihan pengguna ← kemampuan perangkat.
export const EXPERIENCES = ["ceria", "seru", "ringkas"] as const;
export type Experience = (typeof EXPERIENCES)[number];
export const EXPERIENCE_INFO: Record<Experience, { label: string; blurb: string }> = {
  ceria: { label: "Ceria", blurb: "Bulat, besar, penuh warna dan maskot. Cocok untuk SD." },
  seru: { label: "Seru", blurb: "Tegas, bercahaya, penuh status dan tantangan. Cocok untuk SMP–SMA." },
  ringkas: { label: "Ringkas", blurb: "Tenang, huruf besar, sedikit gerak. Cocok untuk guru, staf, dan orang tua." },
};
export const FONT_SIZES = ["normal", "besar", "sangat-besar"] as const;
export const DENSITIES = ["rapat", "normal", "longgar"] as const;
export const MOTIONS = ["penuh", "kurangi"] as const;
export type FontSize = (typeof FONT_SIZES)[number];
export type Density = (typeof DENSITIES)[number];
export type Motion = (typeof MOTIONS)[number];
export type Group = "student" | "staff" | "parent";

export type Prefs = {
  theme?: string | null; experience?: Experience | null; fontSize?: FontSize | null; density?: Density | null;
  motion?: Motion | null; scene3d?: "auto" | "mati" | null; sound?: boolean | null; relaxed?: boolean | null;
};
export type Policy = {
  brandColor: string | null; studentExperience: "auto" | Experience; staffExperience: Experience; staffCanChange: boolean;
  allowedThemes: string[] | null; defaultTheme: string | null; allow3d: boolean; allowSound: boolean; studentCanCustomize: boolean;
};
export const DEFAULT_POLICY: Policy = {
  brandColor: null, studentExperience: "auto", staffExperience: "ringkas", staffCanChange: false,
  allowedThemes: null, defaultTheme: null, allow3d: true, allowSound: true, studentCanCustomize: true,
};
export type Look = {
  theme: string; experience: Experience; fontSize: FontSize; density: Density; motion: Motion;
  scene3d: "auto" | "mati"; sound: boolean; relaxed: boolean;
  brand: { pen: string; penStrong: string; onPen: string; hi: string } | null;
};

const oneOf = <T extends string>(list: readonly T[], v: unknown): T | null => (typeof v === "string" && (list as readonly string[]).includes(v) ? (v as T) : null);

export function experienceForGrade(grade: number | null): Experience {
  if (grade === null || grade === undefined) return "seru";
  return grade <= 6 ? "ceria" : "seru";
}

const THEME_FOR_EXPERIENCE: Record<Experience, string> = { ceria: "permen", seru: "luar-angkasa", ringkas: "kertas" };

export function usableThemes(policy: Policy): string[] {
  const all = THEME_IDS.filter((id) => id !== "warna-sekolah" || !!policy.brandColor);
  return policy.allowedThemes ? all.filter((id) => policy.allowedThemes!.includes(id)) : all;
}

export function resolveLook(a: { prefs?: Prefs | null; policy?: Policy | null; group: Group; grade?: number | null }): Look {
  const prefs = a.prefs ?? {};
  const policy = a.policy ?? DEFAULT_POLICY;
  const staffLike = a.group !== "student";

  // 1) Pengalaman
  const fixed = staffLike ? policy.staffExperience : policy.studentExperience === "auto" ? experienceForGrade(a.grade ?? null) : policy.studentExperience;
  const canPick = staffLike ? policy.staffCanChange : policy.studentCanCustomize;
  const experience = (canPick ? oneOf(EXPERIENCES, prefs.experience) : null) ?? fixed;

  // 2) Tema: pilihan pengguna bila diizinkan, selain itu bawaan sekolah/pengalaman
  const usable = usableThemes(policy);
  const wanted = canPick ? prefs.theme ?? null : null;
  const dflt = policy.defaultTheme ?? (staffLike ? (policy.brandColor ? "warna-sekolah" : "kertas") : THEME_FOR_EXPERIENCE[experience]);
  const theme = [wanted, dflt, "kertas"].find((t): t is string => !!t && usable.includes(t)) ?? usable[0] ?? "kertas";

  // 3) Lainnya
  const motion = oneOf(MOTIONS, prefs.motion) ?? (experience === "ringkas" ? "kurangi" : "penuh");
  const scene3d = experience === "ringkas" || !policy.allow3d ? "mati" : oneOf(["auto", "mati"] as const, prefs.scene3d) ?? "auto";
  const paletteBase = themeById(theme).tokens;
  const brand = theme === "warna-sekolah" && policy.brandColor ? { ...brandTokens(policy.brandColor, paletteBase.paper, paletteBase.card) } : null;
  return {
    theme, experience, motion, scene3d, brand,
    fontSize: oneOf(FONT_SIZES, prefs.fontSize) ?? "normal",
    density: oneOf(DENSITIES, prefs.density) ?? "normal",
    sound: policy.allowSound && (prefs.sound ?? experience !== "ringkas"),
    relaxed: prefs.relaxed ?? false,
  };
}

// Cookie `es_look` dibaca skrip kecil di <head> sebelum cat pertama agar tidak berkedip.
export const LOOK_COOKIE = "es_look";
export function encodeLook(l: Look): string {
  const b = l.brand;
  return ["v1", l.theme, l.experience, l.fontSize, l.density, l.motion, l.scene3d, b?.pen ?? "", b?.penStrong ?? "", b?.onPen ?? "", b?.hi ?? ""].join("|");
}
export function attrsOf(l: Look) {
  return { "data-theme": l.theme, "data-experience": l.experience, "data-fs": l.fontSize, "data-density": l.density, "data-motion": l.motion, "data-3d": l.scene3d } as const;
}

export const NO_FLASH_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|; )${LOOK_COOKIE}=([^;]*)/);if(!m)return;var p=decodeURIComponent(m[1]).split("|");if(p[0]!=="v1")return;var h=document.documentElement;h.dataset.theme=p[1];h.dataset.experience=p[2];h.dataset.fs=p[3];h.dataset.density=p[4];h.dataset.motion=p[5];h.dataset["3d"]=p[6];if(p[7]){h.style.setProperty("--pen",p[7]);h.style.setProperty("--pen-strong",p[8]);h.style.setProperty("--on-pen",p[9]);h.style.setProperty("--hi",p[10]);}}catch(e){}})();`;
