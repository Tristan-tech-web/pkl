"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DRAFT_SYSTEM, draftPrompt, sanitizeDraft } from "@/lib/curriculum-draft";
import { parseJsonLoose } from "@/lib/ai";
import { resolveAdminAi } from "@/lib/file-analysis";
import { requireModule } from "@/lib/modules";
import { getSchoolContext } from "@/lib/school";
import {
  PLAN_SYSTEM, chunkText, detailPrompt, mapPrompt, outlinePrompt, sanitizeChapter, sanitizeMap, sanitizeOutline, sanitizePlan, sanitizeSchedule, schedulePrompt,
  type MapOut, type PlanChapter,
} from "@/lib/study-plan";

const q = encodeURIComponent;
const base = (id: string) => `/dashboard/sekolah/${id}/rencana`;

type Work = { stage: "map" | "outline" | "detail" | "schedule"; i: number; maps: MapOut[]; outline: { title: string; summary: string; elements: MapOut[number]["elements"]; prerequisites: string[] }[]; chapters: PlanChapter[] };
const EMPTY: Work = { stage: "map", i: 0, maps: [], outline: [], chapters: [] };

function excerptFor(text: string, title: string, size = 3500): string {
  const lower = text.toLowerCase();
  const words = title.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((w) => w.length >= 4);
  const hits = words.map((w) => lower.indexOf(w)).filter((i) => i >= 0);
  if (!hits.length) return "";
  const at = Math.max(0, Math.min(...hits) - 200);
  return text.slice(at, at + size);
}

export async function startPlan(schoolId: string, fileId: string, formData: FormData) {
  const { supabase, me } = await getSchoolContext(schoolId);
  await requireModule(supabase, schoolId, "data_hub");
  const subjectId = String(formData.get("subject_id") ?? "");
  const grade = Math.min(13, Math.max(0, Number(formData.get("grade")) || 10));
  const weeks = Math.min(40, Math.max(4, Number(formData.get("weeks")) || 18));
  const [{ data: f }, { data: subj }] = await Promise.all([
    supabase.from("school_files").select("name,category,text_content").eq("id", fileId).eq("school_id", schoolId).maybeSingle(),
    supabase.from("school_subjects").select("id,name").eq("school_id", schoolId).eq("id", subjectId).maybeSingle(),
  ]);
  const back = `/dashboard/sekolah/${schoolId}/berkas`;
  if (!f || !subj) redirect(`${back}?error=${q("Pilih berkas dan mata pelajaran yang valid.")}`);
  if (!["kurikulum", "buku_paket", "lks"].includes(f!.category as string)) redirect(`${back}?error=${q("Rencana belajar hanya dari berkas kurikulum, buku paket, atau LKS.")}`);
  if (String(f!.text_content ?? "").trim().length < 300) redirect(`${back}?error=${q("Isi berkas belum terbaca (mungkin hasil pindai). Analisis ulang atau unggah versi teks.")}`);
  const { data, error } = await supabase.from("study_plans").insert({
    school_id: schoolId, file_id: fileId, subject_id: subjectId, title: `${subj!.name as string} · ${f!.name as string}`.slice(0, 160), grade, weeks, created_by: me.memberId, work: EMPTY,
  }).select("id").single();
  if (error || !data) redirect(`${back}?error=${q("Rencana belum bisa dibuat. Anda butuh izin menyusun materi.")}`);
  redirect(`${base(schoolId)}/${data!.id}`);
}

export type Step = { ok: true; done: boolean; pct: number; label: string } | { ok: false; error: string };

export async function advancePlan(schoolId: string, planId: string): Promise<Step> {
  const { supabase } = await getSchoolContext(schoolId);
  await requireModule(supabase, schoolId, "data_hub");
  const { data: p } = await supabase.from("study_plans").select("id,file_id,subject_id,grade,weeks,status,work,school_subjects(name)").eq("id", planId).eq("school_id", schoolId).maybeSingle();
  if (!p) return { ok: false, error: "Rencana tidak ditemukan." };
  if (p.status === "selesai") return { ok: true, done: true, pct: 100, label: "Selesai" };
  const { data: f } = await supabase.from("school_files").select("text_content").eq("id", p.file_id as string).maybeSingle();
  const text = String(f?.text_content ?? "");
  const chunks = chunkText(text);
  if (chunks.length === 0) return { ok: false, error: "Isi berkas tidak terbaca." };
  const sj = p.school_subjects as { name: string } | { name: string }[] | null;
  const subject = (Array.isArray(sj) ? sj[0]?.name : sj?.name) ?? "Pelajaran";
  const grade = p.grade as number, weeks = p.weeks as number;
  const w: Work = { ...EMPTY, ...((p.work as Partial<Work>) ?? {}) };
  const ai = await resolveAdminAi(supabase, schoolId);
  if (!ai.run) return { ok: false, error: ai.reason ?? "AI belum bisa dipakai." };

  const save = async (patch: Record<string, unknown>) => { await supabase.from("study_plans").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", planId); };
  const total = () => chunks.length + 1 + Math.max(w.outline.length, 6) + 1;
  const pct = (done: number) => Math.min(99, Math.round((done / total()) * 100));
  try {
    if (w.stage === "map") {
      const raw = await ai.run(PLAN_SYSTEM, mapPrompt({ subject, index: w.i, total: chunks.length, text: chunks[w.i] }));
      w.maps.push(sanitizeMap(parseJsonLoose(raw)));
      w.i += 1;
      if (w.i >= chunks.length) { w.stage = "outline"; w.i = 0; }
      await save({ work: w });
      return { ok: true, done: false, pct: pct(w.maps.length), label: `Membaca bagian ${Math.min(w.maps.length + 1, chunks.length)} dari ${chunks.length}` };
    }
    if (w.stage === "outline") {
      const raw = await ai.run(PLAN_SYSTEM, outlinePrompt({ subject, grade, maps: w.maps }));
      w.outline = sanitizeOutline(parseJsonLoose(raw));
      if (w.outline.length === 0) return { ok: false, error: "AI belum menemukan bab. Coba lanjutkan lagi." };
      w.stage = "detail"; w.i = 0; w.maps = [];
      await save({ work: w });
      return { ok: true, done: false, pct: pct(chunks.length + 1), label: `Ditemukan ${w.outline.length} bab` };
    }
    if (w.stage === "detail") {
      const ch = w.outline[w.i];
      const raw = await ai.run(PLAN_SYSTEM, detailPrompt({ subject, grade, chapter: ch, excerpt: excerptFor(text, ch.title) }));
      w.chapters.push(sanitizeChapter(parseJsonLoose(raw), ch));
      w.i += 1;
      if (w.i >= w.outline.length) w.stage = "schedule";
      await save({ work: w });
      return { ok: true, done: false, pct: pct(chunks.length + 1 + w.chapters.length), label: `Menyusun cara belajar: bab ${w.chapters.length} dari ${w.outline.length}` };
    }
    const raw = await ai.run(PLAN_SYSTEM, schedulePrompt({ subject, weeks, chapters: w.chapters }));
    const sched = sanitizeSchedule(parseJsonLoose(raw), weeks);
    await save({ status: "selesai", plan: { chapters: w.chapters, ...sched }, work: {} });
    revalidatePath(base(schoolId));
    return { ok: true, done: true, pct: 100, label: "Selesai" };
  } catch {
    return { ok: false, error: "AI gagal menjawab untuk langkah ini. Tekan Lanjutkan untuk mencoba lagi; kemajuan tersimpan." };
  }
}

export async function importBridge(schoolId: string, planId: string, formData: FormData) {
  const { supabase } = await getSchoolContext(schoolId);
  const here = `${base(schoolId)}/${planId}`;
  const { data: p } = await supabase.from("study_plans").select("weeks").eq("id", planId).eq("school_id", schoolId).maybeSingle();
  if (!p) redirect(`${base(schoolId)}?error=${q("Rencana tidak ditemukan.")}`);
  let raw: unknown;
  try { raw = parseJsonLoose(String(formData.get("result") ?? "").slice(0, 400_000)); } catch { redirect(`${here}?error=${q("Jawaban belum berupa JSON yang valid. Minta AI membalas hanya dengan blok JSON.")}`); }
  const plan = sanitizePlan(raw, p!.weeks as number);
  if (plan.chapters.length === 0) redirect(`${here}?error=${q("Tidak ada bab yang terbaca dari jawaban itu.")}`);
  await supabase.from("study_plans").update({ status: "selesai", plan, work: {}, updated_at: new Date().toISOString() }).eq("id", planId);
  revalidatePath(here);
  redirect(`${here}?info=${q(`${plan.chapters.length} bab dan ${plan.schedule.length} jadwal dimuat dari jawaban AI Anda.`)}`);
}

export async function deletePlan(schoolId: string, planId: string) {
  const { supabase } = await getSchoolContext(schoolId);
  await supabase.from("study_plans").delete().eq("id", planId).eq("school_id", schoolId);
  revalidatePath(base(schoolId));
  redirect(`${base(schoolId)}?info=${q("Rencana dihapus.")}`);
}

// Jadikan satu bab sebagai draf materi (cara belajar tiap elemen ikut jadi acuan isi dan soal).
export async function draftFromChapter(schoolId: string, planId: string, index: number) {
  const { supabase } = await getSchoolContext(schoolId);
  const here = `${base(schoolId)}/${planId}`;
  const { data: p } = await supabase.from("study_plans").select("file_id,subject_id,grade,plan,school_subjects(name)").eq("id", planId).eq("school_id", schoolId).maybeSingle();
  const ch = (p?.plan as { chapters?: PlanChapter[] } | null)?.chapters?.[index];
  if (!p || !ch || !p.subject_id) redirect(`${here}?error=${q("Bab tidak ditemukan.")}`);
  const ai = await resolveAdminAi(supabase, schoolId);
  if (!ai.run) redirect(`${here}?error=${q(ai.reason ?? "AI belum bisa dipakai.")}`);
  const { data: f } = await supabase.from("school_files").select("text_content").eq("id", p!.file_id as string).maybeSingle();
  const sj = p!.school_subjects as { name: string } | { name: string }[] | null;
  const subject = (Array.isArray(sj) ? sj[0]?.name : sj?.name) ?? "Pelajaran";
  const guide = `Bab: ${ch!.title}. Elemen dan cara belajar yang dipilih: ${JSON.stringify(ch!.elements.map((e) => ({ name: e.name, type: e.type, method: e.method, activities: e.activities })))}.\nCuplikan isi:\n${excerptFor(String(f?.text_content ?? ""), ch!.title, 6000)}`;
  let nodes;
  try {
    nodes = sanitizeDraft(parseJsonLoose(await ai.run!(DRAFT_SYSTEM, draftPrompt({ fileName: "rencana belajar", subject, grade: p!.grade as number, maxNodes: 1, text: guide }))), 1);
  } catch { redirect(`${here}?error=${q("AI gagal menyusun draf. Coba lagi.")}`); }
  const n = nodes?.[0];
  if (!n) redirect(`${here}?error=${q("AI tidak menghasilkan draf yang layak.")}`);
  const { data: last } = await supabase.from("competency_nodes").select("position").eq("school_id", schoolId).eq("subject_id", p!.subject_id as string).order("position", { ascending: false }).limit(1).maybeSingle();
  const position = ((last?.position as number | undefined) ?? 0) + 1;
  const { data: node, error } = await supabase.from("competency_nodes").insert({ school_id: schoolId, subject_id: p!.subject_id, grade: p!.grade, code: `RB-${Date.now().toString(36).slice(-4).toUpperCase()}-${position}`, title: n!.title || ch!.title, summary: n!.summary || ch!.summary || null, position, status: "draft", estimated_minutes: ch!.minutes ?? n!.minutes }).select("id").single();
  if (error || !node) redirect(`${here}?error=${q("Draf tidak bisa disimpan. Anda butuh izin menulis materi.")}`);
  await supabase.from("lessons").insert({ school_id: schoolId, node_id: node!.id, body_md: n!.body_md, objectives: n!.objectives });
  let pos = 0;
  for (const qn of n!.questions) {
    const { data: row } = await supabase.from("quiz_questions").insert({ school_id: schoolId, node_id: node!.id, kind: "mcq", prompt: qn.prompt, options: qn.options, position: ++pos }).select("id").single();
    if (row) { const { error: ke } = await supabase.from("quiz_answer_keys").insert({ question_id: row.id, school_id: schoolId, answer: qn.answer, explanation: qn.explanation }); if (ke) await supabase.from("quiz_questions").delete().eq("id", row.id); }
  }
  redirect(`/dashboard/sekolah/${schoolId}/materi/${node!.id}?info=${q("Draf dibuat dari rencana. Tinjau lalu terbitkan.")}`);
}
