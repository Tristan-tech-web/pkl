"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const q = encodeURIComponent;

export async function createSchool(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const authority = String(formData.get("authority") ?? "");
  const ownership = String(formData.get("ownership") ?? "swasta");
  const packCode = String(formData.get("pack") ?? "kurmer");
  const forms = formData.getAll("forms").map(String);
  const city = String(formData.get("city") ?? "").trim() || null;
  const province = String(formData.get("province") ?? "").trim() || null;
  const displayName = String(formData.get("display_name") ?? "").trim() || null;

  if (name.length < 2) redirect(`/dashboard/sekolah-baru?error=${q("Isi nama sekolah.")}`);
  if (forms.length === 0) redirect(`/dashboard/sekolah-baru?error=${q("Pilih minimal satu bentuk pendidikan.")}`);

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_school", {
    p_name: name,
    p_authority: authority,
    p_ownership: ownership,
    p_forms: forms,
    p_pack_code: packCode,
    p_city: city,
    p_province: province,
    p_display_name: displayName,
  });
  if (error || !data) {
    redirect(`/dashboard/sekolah-baru?error=${q("Sekolah belum bisa dibuat. Periksa isian lalu coba lagi.")}`);
  }
  redirect(`/dashboard/sekolah/${data}`);
}
