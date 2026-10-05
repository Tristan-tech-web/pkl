import { DEFAULT_POLICY, resolveLook, type Group, type Look, type Policy, type Prefs } from "@/lib/appearance";
import { createClient } from "@/lib/supabase/server";

type PrefRow = { theme: string | null; experience: string | null; font_size: string | null; density: string | null; motion: string | null; scene3d: string | null; sound: boolean | null; relaxed: boolean | null; avatar?: unknown };

export const toPrefs = (r: PrefRow | null): Prefs => ({
  theme: r?.theme, experience: r?.experience as Prefs["experience"], fontSize: r?.font_size as Prefs["fontSize"], density: r?.density as Prefs["density"],
  motion: r?.motion as Prefs["motion"], scene3d: r?.scene3d as Prefs["scene3d"], sound: r?.sound, relaxed: r?.relaxed,
});

type PolicyRow = { brand_color: string | null; student_experience: string; staff_experience: string; staff_can_change: boolean; allowed_themes: string[] | null; default_theme: string | null; allow_3d: boolean; allow_sound: boolean; student_can_customize: boolean };
export const toPolicy = (r: PolicyRow | null): Policy =>
  r ? { brandColor: r.brand_color, studentExperience: r.student_experience as Policy["studentExperience"], staffExperience: r.staff_experience as Policy["staffExperience"], staffCanChange: r.staff_can_change, allowedThemes: r.allowed_themes, defaultTheme: r.default_theme, allow3d: r.allow_3d, allowSound: r.allow_sound, studentCanCustomize: r.student_can_customize } : DEFAULT_POLICY;

/** Tampilan efektif untuk permintaan ini: pilihan pengguna + kebijakan sekolah (dari header x-school yang diisi proxy). */
export type LookContext = { avatar: unknown; look: Look; schoolId: string | null; group: Group; grade: number | null; prefs: Prefs; policy: Policy };

export async function lookFor(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, schoolId: string | null): Promise<LookContext> {
  const user = { id: userId };
  const [{ data: prefRow }, { data: polRow }, { data: member }] = await Promise.all([
    supabase.from("user_preferences").select("theme,experience,font_size,density,motion,scene3d,sound,relaxed,avatar").eq("user_id", user.id).maybeSingle(),
    schoolId ? supabase.from("school_appearance").select("brand_color,student_experience,staff_experience,staff_can_change,allowed_themes,default_theme,allow_3d,allow_sound,student_can_customize").eq("school_id", schoolId).maybeSingle() : Promise.resolve({ data: null }),
    schoolId ? supabase.from("school_members").select("id,roles(code),class_group_students(class_groups(grade))").eq("school_id", schoolId).eq("user_id", user.id).eq("status", "active").maybeSingle() : Promise.resolve({ data: null }),
  ]);
  const role = ((Array.isArray(member?.roles) ? member?.roles[0] : member?.roles) as { code: string } | null)?.code;
  const group: Group = role === "student" ? "student" : role === "parent" ? "parent" : "staff";
  // Tingkat kelas ikut diambil dalam satu query yang sama (bukan query kedua sesudah peran diketahui).
  let grade: number | null = null;
  if (role === "student") {
    const cgs = member?.class_group_students as unknown as { class_groups: { grade: number } | { grade: number }[] | null }[] | undefined;
    const g = Array.isArray(cgs?.[0]?.class_groups) ? cgs?.[0]?.class_groups[0] : cgs?.[0]?.class_groups;
    grade = (g as { grade: number } | null | undefined)?.grade ?? null;
  }
  const prefs = toPrefs(prefRow as PrefRow | null), policy = toPolicy(polRow as PolicyRow | null);
  return { avatar: (prefRow as { avatar?: unknown } | null)?.avatar, look: resolveLook({ prefs, policy, group, grade }), schoolId, group, grade, prefs, policy };
}
