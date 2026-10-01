"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireModule } from "@/lib/modules";
import { getSchoolContext } from "@/lib/school";

const q = encodeURIComponent;
const STATUSES = ["hadir", "terlambat", "izin", "sakit", "alpa"];

export async function saveAttendance(schoolId: string, classId: string, date: string, formData: FormData) {
  const { supabase, me } = await getSchoolContext(schoolId);
  await requireModule(supabase, schoolId, "attendance");
  const page = `/dashboard/sekolah/${schoolId}/absensi`;
  const back = (kind: "error" | "info", text: string) => redirect(`${page}?class=${classId}&date=${date}&${kind}=${q(text)}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) back("error", "Tanggal tidak valid.");
  const rows: { school_id: string; class_group_id: string; member_id: string; on_date: string; status: string; note: string | null; recorded_by: string; updated_at: string }[] = [];
  for (const [k, v] of formData.entries()) {
    if (!k.startsWith("status:")) continue;
    const memberId = k.slice(7);
    const status = String(v);
    if (!STATUSES.includes(status)) continue;
    const note = String(formData.get(`note:${memberId}`) ?? "").trim().slice(0, 300) || null;
    rows.push({ school_id: schoolId, class_group_id: classId, member_id: memberId, on_date: date, status, note, recorded_by: me.memberId, updated_at: new Date().toISOString() });
  }
  if (rows.length === 0) back("error", "Belum ada status yang dipilih.");
  const { error } = await supabase.from("attendance_records").upsert(rows, { onConflict: "class_group_id,member_id,on_date" });
  if (error) back("error", "Absensi belum bisa disimpan. Anda mungkin tidak ditugaskan di rombel ini.");
  revalidatePath(page);
  back("info", `Absensi ${rows.length} siswa tersimpan.`);
}
