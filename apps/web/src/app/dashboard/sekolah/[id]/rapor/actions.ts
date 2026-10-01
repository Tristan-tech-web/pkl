"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireModule } from "@/lib/modules";
import { getSchoolContext } from "@/lib/school";

const q = encodeURIComponent;

export async function saveReportNote(schoolId: string, memberId: string, termId: string, formData: FormData) {
  const { supabase, me } = await getSchoolContext(schoolId);
  await requireModule(supabase, schoolId, "gradebook");
  const page = `/dashboard/sekolah/${schoolId}/rapor/${memberId}?term=${termId}`;
  const note = String(formData.get("note") ?? "").trim().slice(0, 1000);
  const { error } = note
    ? await supabase.from("report_notes").upsert({ school_id: schoolId, term_id: termId, member_id: memberId, note, written_by: me.memberId, updated_at: new Date().toISOString() }, { onConflict: "term_id,member_id" })
    : await supabase.from("report_notes").delete().eq("term_id", termId).eq("member_id", memberId);
  if (error) redirect(`${page}&error=${q("Catatan belum bisa disimpan. Hanya wali kelas atau pengelola yang boleh menulis.")}`);
  revalidatePath(`/dashboard/sekolah/${schoolId}/rapor/${memberId}`);
  redirect(`${page}&info=${q("Catatan wali kelas tersimpan.")}`);
}
