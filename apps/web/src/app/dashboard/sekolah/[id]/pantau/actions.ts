"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSchoolContext } from "@/lib/school";

const q = encodeURIComponent;
const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const KINDS = ["remedial", "bimbingan", "teman_sebaya", "orang_tua", "lainnya"];
const PRIORITIES = ["rendah", "sedang", "tinggi"];

export async function createIntervention(schoolId: string, formData: FormData) {
  const { supabase, me } = await getSchoolContext(schoolId);
  const base = `/dashboard/sekolah/${schoolId}/pantau`;
  const student = str(formData, "student_id");
  const kind = str(formData, "kind");
  const priority = str(formData, "priority");
  const note = str(formData, "note");
  const due = str(formData, "due_on") || null;
  if (!student || !KINDS.includes(kind) || !PRIORITIES.includes(priority) || note.length < 3) {
    redirect(`${base}?error=${q("Lengkapi jenis, prioritas, dan catatan (minimal 3 huruf).")}`);
  }
  const { error } = await supabase.from("interventions").insert({
    school_id: schoolId, student_member_id: student, created_by_member_id: me.memberId, kind, priority, note, due_on: due,
  });
  if (error) redirect(`${base}?error=${q("Tindak lanjut belum bisa disimpan.")}`);
  revalidatePath(base);
  redirect(`${base}?info=${q("Tindak lanjut disimpan.")}`);
}

export async function setInterventionStatus(schoolId: string, interventionId: string, status: string) {
  const { supabase } = await getSchoolContext(schoolId);
  const base = `/dashboard/sekolah/${schoolId}/pantau`;
  if (!["berjalan", "selesai", "batal"].includes(status)) redirect(base);
  await supabase.from("interventions").update({ status }).eq("id", interventionId).eq("school_id", schoolId);
  revalidatePath(base);
  redirect(`${base}?info=${q("Status diperbarui.")}`);
}
