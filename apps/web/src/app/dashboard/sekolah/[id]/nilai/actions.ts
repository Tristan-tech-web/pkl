"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { KIND_LABEL } from "@/lib/grades";
import { requireModule } from "@/lib/modules";
import { getSchoolContext } from "@/lib/school";

const q = encodeURIComponent;
const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const base = (id: string) => `/dashboard/sekolah/${id}/nilai`;

export async function createAssessment(schoolId: string, formData: FormData) {
  const { supabase, me } = await getSchoolContext(schoolId);
  await requireModule(supabase, schoolId, "gradebook");
  const classId = str(formData, "class_id");
  const subjectId = str(formData, "subject_id");
  const termId = str(formData, "term_id");
  const here = `${base(schoolId)}?pair=${classId}:${subjectId}&term=${termId}`;
  const title = str(formData, "title");
  const kind = str(formData, "kind");
  const weight = Math.min(100, Math.max(1, Number(str(formData, "weight")) || 1));
  const max = Number(str(formData, "max_score")) || 100;
  if (title.length < 2 || !(kind in KIND_LABEL) || max <= 0) redirect(`${here}&error=${q("Isi judul, jenis, dan nilai maksimum dengan benar.")}`);
  const { data, error } = await supabase
    .from("assessments")
    .insert({ school_id: schoolId, class_group_id: classId, school_subject_id: subjectId, term_id: termId, title, kind, weight, max_score: max, held_on: str(formData, "held_on") || null, created_by: me.memberId })
    .select("id").single();
  if (error || !data) redirect(`${here}&error=${q("Penilaian belum bisa dibuat. Anda mungkin tidak mengajar mapel ini di rombel tersebut.")}`);
  revalidatePath(base(schoolId));
  redirect(`${base(schoolId)}/${data.id}?info=${q("Penilaian dibuat. Isi nilai siswa di bawah.")}`);
}

export async function saveScores(schoolId: string, assessmentId: string, formData: FormData) {
  const { supabase } = await getSchoolContext(schoolId);
  await requireModule(supabase, schoolId, "gradebook");
  const page = `${base(schoolId)}/${assessmentId}`;
  const { data: a } = await supabase.from("assessments").select("max_score").eq("id", assessmentId).maybeSingle();
  if (!a) redirect(`${base(schoolId)}?error=${q("Penilaian tidak ditemukan.")}`);
  const max = Number(a!.max_score);
  const rows: { assessment_id: string; member_id: string; school_id: string; score: number | null; note: string | null; updated_at: string }[] = [];
  for (const [k, v] of formData.entries()) {
    if (!k.startsWith("score:")) continue;
    const memberId = k.slice(6);
    const raw = String(v).trim().replace(",", ".");
    let score: number | null = null;
    if (raw !== "") {
      score = Number(raw);
      if (!Number.isFinite(score) || score < 0 || score > max) redirect(`${page}?error=${q(`Nilai harus antara 0 dan ${max}.`)}`);
    }
    rows.push({ assessment_id: assessmentId, member_id: memberId, school_id: schoolId, score, note: str(formData, `note:${memberId}`).slice(0, 300) || null, updated_at: new Date().toISOString() });
  }
  const { error } = await supabase.from("assessment_scores").upsert(rows, { onConflict: "assessment_id,member_id" });
  if (error) redirect(`${page}?error=${q("Nilai belum bisa disimpan.")}`);
  revalidatePath(page);
  redirect(`${page}?info=${q(`Nilai ${rows.filter((r) => r.score !== null).length} siswa tersimpan.`)}`);
}

export async function deleteAssessment(schoolId: string, assessmentId: string) {
  const { supabase } = await getSchoolContext(schoolId);
  await supabase.from("assessments").delete().eq("id", assessmentId).eq("school_id", schoolId);
  revalidatePath(base(schoolId));
  redirect(`${base(schoolId)}?info=${q("Penilaian dihapus.")}`);
}
