"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireModule } from "@/lib/modules";
import { getSchoolContext } from "@/lib/school";

const q = encodeURIComponent;
const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function addSlot(schoolId: string, formData: FormData) {
  const { supabase } = await getSchoolContext(schoolId, { management: true });
  await requireModule(supabase, schoolId, "schedule");
  const classId = str(formData, "class_id");
  const page = `/dashboard/sekolah/${schoolId}/jadwal?class=${classId}`;
  const weekday = Number(str(formData, "weekday"));
  const start = str(formData, "starts_at");
  const end = str(formData, "ends_at");
  if (!classId || !str(formData, "subject_id") || !(weekday >= 1 && weekday <= 7) || !TIME.test(start) || !TIME.test(end) || end <= start) {
    redirect(`${page}&error=${q("Pilih mapel, hari, dan jam (jam selesai harus setelah jam mulai).")}`);
  }
  const { error } = await supabase.from("schedule_slots").insert({
    school_id: schoolId, class_group_id: classId, school_subject_id: str(formData, "subject_id"),
    teacher_member_id: str(formData, "teacher_id") || null, weekday, starts_at: start, ends_at: end, room: str(formData, "room").slice(0, 40) || null,
  });
  if (error) redirect(`${page}&error=${q(error.message.includes("bentrok") ? error.message.replace(/^.*jadwal bentrok: /, "Jadwal bentrok: ") : "Jadwal belum bisa disimpan.")}`);
  revalidatePath(`/dashboard/sekolah/${schoolId}/jadwal`);
  redirect(`${page}&info=${q("Jam pelajaran ditambahkan.")}`);
}

export async function removeSlot(schoolId: string, classId: string, slotId: string) {
  const { supabase } = await getSchoolContext(schoolId, { management: true });
  await supabase.from("schedule_slots").delete().eq("id", slotId).eq("school_id", schoolId);
  revalidatePath(`/dashboard/sekolah/${schoolId}/jadwal`);
  redirect(`/dashboard/sekolah/${schoolId}/jadwal?class=${classId}&info=${q("Jam pelajaran dihapus.")}`);
}
