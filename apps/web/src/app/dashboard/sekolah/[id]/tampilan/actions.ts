"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { EXPERIENCES } from "@/lib/appearance";
import { getSchoolContext } from "@/lib/school";
import { THEME_IDS } from "@/lib/themes";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export async function savePolicy(schoolId: string, formData: FormData) {
  const { supabase } = await getSchoolContext(schoolId, { management: true });
  const page = `/dashboard/sekolah/${schoolId}/tampilan`;
  const brand = str(formData, "brand_color");
  const allowed = formData.getAll("allowed").map(String).filter((t) => THEME_IDS.includes(t));
  const stud = str(formData, "student_experience"), staff = str(formData, "staff_experience"), dflt = str(formData, "default_theme");
  const row = {
    school_id: schoolId,
    brand_color: /^#[0-9a-fA-F]{6}$/.test(brand) && formData.get("use_brand") === "on" ? brand : null,
    student_experience: stud === "auto" || (EXPERIENCES as readonly string[]).includes(stud) ? stud : "auto",
    staff_experience: (EXPERIENCES as readonly string[]).includes(staff) ? staff : "ringkas",
    staff_can_change: formData.get("staff_can_change") === "on",
    allowed_themes: allowed.length === 0 || allowed.length === THEME_IDS.length ? null : allowed,
    default_theme: THEME_IDS.includes(dflt) ? dflt : null,
    allow_3d: formData.get("allow_3d") === "on",
    allow_sound: formData.get("allow_sound") === "on",
    student_can_customize: formData.get("student_can_customize") === "on",
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("school_appearance").upsert(row);
  if (error) redirect(`${page}?error=${encodeURIComponent("Aturan tampilan belum bisa disimpan.")}`);
  revalidatePath("/dashboard", "layout");
  redirect(`${page}?info=${encodeURIComponent("Aturan tampilan sekolah disimpan.")}`);
}
