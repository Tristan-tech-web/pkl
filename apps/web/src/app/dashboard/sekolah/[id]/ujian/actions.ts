"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { anonRpc } from "@/lib/anon-rpc";
import { requireModule } from "@/lib/modules";
import { getSchoolContext } from "@/lib/school";

const q = encodeURIComponent;
const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const base = (id: string) => `/dashboard/sekolah/${id}/ujian`;
// Input datetime-local dibaca sebagai waktu Jakarta (WIB, UTC+7).
const wib = (v: string) => { const d = new Date(`${v}:00+07:00`); return Number.isNaN(d.getTime()) ? null : d.toISOString(); };

export async function createExam(schoolId: string, formData: FormData) {
  const { supabase, me } = await getSchoolContext(schoolId);
  await requireModule(supabase, schoolId, "exams");
  const starts = wib(str(formData, "starts_at")), ends = wib(str(formData, "ends_at"));
  const title = str(formData, "title");
  const duration = Math.min(360, Math.max(5, Number(str(formData, "duration")) || 60));
  if (title.length < 3 || !starts || !ends || new Date(ends) <= new Date(starts)) redirect(`${base(schoolId)}?error=${q("Isi judul, waktu mulai, dan waktu selesai (selesai harus setelah mulai).")}`);
  const { data, error } = await supabase.from("exams").insert({
    school_id: schoolId, class_group_id: str(formData, "class_group_id"), school_subject_id: str(formData, "school_subject_id"), title, instructions: str(formData, "instructions") || null,
    starts_at: starts, ends_at: ends, duration_minutes: duration, secure_required: formData.get("secure_required") === "on",
    on_violation: str(formData, "on_violation") === "catat" ? "catat" : "bekukan", max_violations: Math.min(20, Math.max(1, Number(str(formData, "max_violations")) || 3)), created_by: me.memberId,
  }).select("id").single();
  if (error || !data) redirect(`${base(schoolId)}?error=${q("Ujian belum bisa dibuat. Anda butuh izin membuat ujian.")}`);
  redirect(`${base(schoolId)}/${data!.id}?info=${q("Ujian dibuat sebagai draf. Tambahkan soal lalu terbitkan.")}`);
}

export async function addExamQuestion(schoolId: string, examId: string, formData: FormData) {
  const { supabase } = await getSchoolContext(schoolId);
  const here = `${base(schoolId)}/${examId}`;
  const kind = (["mcq", "multi", "short", "essay"] as const).find((k) => k === str(formData, "kind")) ?? "mcq";
  const prompt = str(formData, "prompt");
  const points = Math.min(100, Math.max(0.5, Number(str(formData, "points")) || 1));
  if (prompt.length < 3) redirect(`${here}?error=${q("Isi pertanyaan (minimal 3 huruf).")}`);
  let options: string[] = [], answer: unknown = null;
  if (kind === "mcq" || kind === "multi") {
    options = str(formData, "options").split("\n").map((s) => s.trim()).filter(Boolean);
    if (options.length < 2 || options.length > 8) redirect(`${here}?error=${q("Pilihan ganda butuh 2-8 pilihan, satu per baris.")}`);
    const nums = str(formData, "correct").split(/[ ,]+/).filter(Boolean).map((n) => Number(n) - 1);
    if (nums.length === 0 || nums.some((n) => !Number.isInteger(n) || n < 0 || n >= options.length) || (kind === "mcq" && nums.length !== 1)) redirect(`${here}?error=${q(kind === "mcq" ? "Isi nomor satu jawaban benar." : "Isi nomor jawaban benar, pisahkan dengan koma.")}`);
    answer = kind === "mcq" ? nums[0] : [...new Set(nums)].sort();
  } else if (kind === "short") {
    const acc = str(formData, "accepted").split(",").map((s) => s.trim()).filter(Boolean);
    if (acc.length === 0) redirect(`${here}?error=${q("Isi minimal satu jawaban yang diterima (pisahkan koma).")}`);
    answer = acc;
  }
  const { data: last } = await supabase.from("exam_questions").select("position").eq("exam_id", examId).order("position", { ascending: false }).limit(1).maybeSingle();
  const { data: row, error } = await supabase.from("exam_questions").insert({ school_id: schoolId, exam_id: examId, kind, prompt, options, points, position: ((last?.position as number | undefined) ?? 0) + 1 }).select("id").single();
  if (error || !row) redirect(`${here}?error=${q("Soal belum bisa disimpan.")}`);
  if (answer !== null) {
    const { error: ke } = await supabase.from("exam_answer_keys").insert({ question_id: row!.id, school_id: schoolId, answer, explanation: str(formData, "explanation") || null });
    if (ke) { await supabase.from("exam_questions").delete().eq("id", row!.id); redirect(`${here}?error=${q("Kunci jawaban belum bisa disimpan.")}`); }
  }
  revalidatePath(here);
  redirect(`${here}?info=${q("Soal ditambahkan.")}`);
}

export async function deleteExamQuestion(schoolId: string, examId: string, questionId: string) {
  const { supabase } = await getSchoolContext(schoolId);
  await supabase.from("exam_questions").delete().eq("id", questionId).eq("exam_id", examId);
  revalidatePath(`${base(schoolId)}/${examId}`);
  redirect(`${base(schoolId)}/${examId}?info=${q("Soal dihapus.")}`);
}

export async function setExamStatus(schoolId: string, examId: string, status: "draf" | "terbit" | "ditutup") {
  const { supabase } = await getSchoolContext(schoolId);
  const here = `${base(schoolId)}/${examId}`;
  if (status === "terbit") {
    const { count } = await supabase.from("exam_questions").select("id", { count: "exact", head: true }).eq("exam_id", examId);
    if (!count) redirect(`${here}?error=${q("Tambahkan minimal satu soal sebelum menerbitkan.")}`);
  }
  const { error } = await supabase.from("exams").update({ status }).eq("id", examId).eq("school_id", schoolId);
  if (error) redirect(`${here}?error=${q("Status belum bisa diubah.")}`);
  revalidatePath(here);
  redirect(`${here}?info=${q(status === "terbit" ? "Ujian diterbitkan. Siswa kelas ini bisa memulai pada waktunya." : status === "ditutup" ? "Ujian ditutup." : "Ujian dikembalikan ke draf.")}`);
}

export async function unfreezeSession(schoolId: string, examId: string, sessionId: string, formData: FormData) {
  const { supabase } = await getSchoolContext(schoolId);
  const extra = Math.min(60, Math.max(0, Number(str(formData, "extra")) || 0));
  const { error } = await supabase.rpc("exam_unfreeze", { p_session: sessionId, p_extra_minutes: extra });
  const here = `${base(schoolId)}/${examId}`;
  if (error) redirect(`${here}?error=${q("Tidak bisa melanjutkan siswa ini.")}`);
  revalidatePath(here);
  redirect(`${here}?info=${q("Siswa dilanjutkan.")}`);
}

// Cadangan tanpa aplikasi: hanya untuk ujian yang tidak mewajibkan perangkat terkunci.
export async function startInBrowser(schoolId: string, examId: string) {
  const { supabase } = await getSchoolContext(schoolId);
  const { data: e } = await supabase.from("exams").select("secure_required").eq("id", examId).maybeSingle();
  if (!e || e.secure_required) redirect(`${base(schoolId)}?error=${q("Ujian ini wajib memakai aplikasi ujian.")}`);
  const { data: code, error } = await supabase.rpc("exam_issue_launch", { p_exam: examId });
  if (error || !code) redirect(`${base(schoolId)}?error=${q("Ujian belum bisa dimulai.")}`);
  const r = (await anonRpc("exam_redeem", { p_code: code, p_platform: "web", p_app_version: null })) as { token: string };
  redirect(`/ujian/main#t=${r.token}`);
}
