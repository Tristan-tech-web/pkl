"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSchoolContext, MANAGEMENT_ROLES } from "@/lib/school";

const q = encodeURIComponent;
const base = (id: string) => `/dashboard/sekolah/${id}/integritas`;
const int = (v: FormDataEntryValue | null, lo: number, hi: number, d: number) => Math.min(hi, Math.max(lo, Math.trunc(Number(v)) || d));

export async function savePolicy(schoolId: string, formData: FormData) {
  const { supabase, me } = await getSchoolContext(schoolId);
  if (!MANAGEMENT_ROLES.has(me.roleCode)) redirect(`${base(schoolId)}?error=${q("Hanya pengelola sekolah yang bisa mengubah kebijakan.")}`);
  const hold = int(formData.get("hold"), 10, 90, 40), pen = int(formData.get("penalty"), 30, 100, 70);
  if (pen <= hold) redirect(`${base(schoolId)}?error=${q("Ambang denda harus lebih tinggi daripada ambang tahan.")}`);
  const camera = formData.get("camera_mode") === "optional" ? "optional" : "off";
  const { error } = await supabase.from("school_integrity").upsert({
    school_id: schoolId, enabled: formData.get("enabled") === "on", camera_mode: camera, parental_consent_confirmed: formData.get("consent") === "on",
    hold_threshold: hold, penalty_threshold: pen, daily_penalty_cap: int(formData.get("cap"), 0, 500, 100), updated_at: new Date().toISOString(),
  });
  if (error) redirect(`${base(schoolId)}?error=${q("Kebijakan belum bisa disimpan.")}`);
  revalidatePath(base(schoolId));
  redirect(`${base(schoolId)}?info=${q("Kebijakan tersimpan.")}`);
}

export async function addExempt(schoolId: string, formData: FormData) {
  const { supabase } = await getSchoolContext(schoolId);
  const member = String(formData.get("member_id") ?? "");
  if (!member) redirect(base(schoolId));
  const { error } = await supabase.from("integrity_exempt").upsert({ school_id: schoolId, member_id: member, reason: String(formData.get("reason") ?? "").slice(0, 200) || null });
  revalidatePath(base(schoolId));
  redirect(error ? `${base(schoolId)}?error=${q("Pengecualian belum bisa disimpan.")}` : `${base(schoolId)}?info=${q("Pengecualian ditambahkan. Sinyal murid ini tidak lagi mengurangi XP.")}`);
}

export async function removeExempt(schoolId: string, memberId: string) {
  const { supabase } = await getSchoolContext(schoolId);
  await supabase.from("integrity_exempt").delete().eq("member_id", memberId).eq("school_id", schoolId);
  revalidatePath(base(schoolId));
  redirect(base(schoolId));
}

export async function decideCase(schoolId: string, caseId: string, decision: "bebaskan" | "kukuhkan", formData: FormData) {
  const { supabase } = await getSchoolContext(schoolId);
  const { error } = await supabase.rpc("integrity_decide", { p_case: caseId, p_decision: decision, p_note: String(formData.get("note") ?? "").slice(0, 300) || null });
  revalidatePath(base(schoolId));
  redirect(error ? `${base(schoolId)}?error=${q("Keputusan belum bisa disimpan.")}` : `${base(schoolId)}?info=${q(decision === "bebaskan" ? "Dibebaskan: XP dikembalikan penuh ke murid." : "Dikukuhkan: XP tetap tidak dikembalikan.")}`);
}
