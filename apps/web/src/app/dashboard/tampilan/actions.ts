"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DENSITIES, EXPERIENCES, FONT_SIZES, MOTIONS } from "@/lib/appearance";
import { THEME_IDS } from "@/lib/themes";
import { createClient } from "@/lib/supabase/server";

const pick = <T extends string>(list: readonly T[], v: FormDataEntryValue | null): T | null => (typeof v === "string" && (list as readonly string[]).includes(v) ? (v as T) : null);
const back = (msg: string, school?: string | null) => `/dashboard/tampilan?${school ? `sekolah=${school}&` : ""}info=${encodeURIComponent(msg)}`;

export async function savePrefs(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/masuk");
  const school = String(formData.get("school") ?? "") || null;
  const row = {
    user_id: user.id, theme: pick(THEME_IDS, formData.get("theme")), experience: pick(EXPERIENCES, formData.get("experience")), font_size: pick(FONT_SIZES, formData.get("font_size")),
    density: pick(DENSITIES, formData.get("density")), motion: pick(MOTIONS, formData.get("motion")), scene3d: pick(["auto", "mati"] as const, formData.get("scene3d")),
    sound: formData.get("sound") === "on", relaxed: formData.get("relaxed") === "on", updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("user_preferences").upsert(row);
  if (error) redirect(back("Tampilan belum bisa disimpan.", school));
  revalidatePath("/dashboard", "layout");
  redirect(back("Tampilan disimpan.", school));
}

export async function resetPrefs() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/masuk");
  await supabase.from("user_preferences").delete().eq("user_id", user.id);
  revalidatePath("/dashboard", "layout");
  redirect(back("Kembali ke tampilan bawaan."));
}
