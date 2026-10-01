// Kustomisasi maskot "Pena": topi, kacamata, dan warna badan. Disimpan di user_preferences.avatar (jsonb), diterapkan lewat data-avatar di <html>.
export const HATS = ["toga", "kupluk", "mahkota", "tanpa"] as const;
export const COLORS = ["tema", "merah", "hijau", "ungu", "oranye", "pink", "toska"] as const;
export type Hat = (typeof HATS)[number];
export type BodyColor = (typeof COLORS)[number];
export type Avatar = { hat: Hat; glasses: boolean; color: BodyColor };

export const DEFAULT_AVATAR: Avatar = { hat: "toga", glasses: true, color: "tema" };
export const HAT_LABEL: Record<Hat, string> = { toga: "Topi toga 🎓", kupluk: "Kupluk 🧶", mahkota: "Mahkota 👑", tanpa: "Tanpa topi" };
export const COLOR_HEX: Record<Exclude<BodyColor, "tema">, string> = { merah: "#d8433b", hijau: "#2a9d5c", ungu: "#7a4fd6", oranye: "#ee8a1c", pink: "#e0489e", toska: "#139aa8" };
export const COLOR_LABEL: Record<BodyColor, string> = { tema: "Warna tema", merah: "Merah", hijau: "Hijau", ungu: "Ungu", oranye: "Oranye", pink: "Pink", toska: "Toska" };

export function sanitizeAvatar(raw: unknown): Avatar {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    hat: (HATS as readonly string[]).includes(String(o.hat)) ? (o.hat as Hat) : DEFAULT_AVATAR.hat,
    glasses: typeof o.glasses === "boolean" ? o.glasses : DEFAULT_AVATAR.glasses,
    color: (COLORS as readonly string[]).includes(String(o.color)) ? (o.color as BodyColor) : DEFAULT_AVATAR.color,
  };
}
export const encodeAvatar = (a: Avatar) => `${a.hat}.${a.glasses ? 1 : 0}.${a.color}`;
export function decodeAvatar(s: string | null | undefined): Avatar {
  const [hat, g, color] = String(s ?? "").split(".");
  return sanitizeAvatar({ hat, glasses: g !== "0", color });
}
