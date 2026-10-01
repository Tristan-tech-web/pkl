"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseJsonLoose } from "@/lib/ai";
import {
  BANK_SYSTEM, DUP_THRESHOLD, ITEMS_PER_ROUND, SOLVER_SYSTEM, focusFor, initialStatus, itemsPrompt, maxSimilarity, parseSolver, quoteStatus, sanitizeItems, solverPrompt, solverStatus,
  type BankDraft, type Checks,
} from "@/lib/bank";
import { resolveAdminAi } from "@/lib/file-analysis";
import { requireModule } from "@/lib/modules";
import { getSchoolContext } from "@/lib/school";
import { chunkText } from "@/lib/study-plan";

const q = encodeURIComponent;
const base = (id: string) => `/dashboard/sekolah/${id}/bank`;

export type BankStep = { ok: true; done: boolean; pct: number; label: string } | { ok: false; error: string };

export async function startBank(schoolId: string, formData: FormData) {
  const { supabase, me } = await getSchoolContext(schoolId);
  await requireModule(supabase, schoolId, "learning");
  const fileId = String(formData.get("file_id") ?? ""), subjectId = String(formData.get("subject_id") ?? "");
  const grade = Math.min(13, Math.max(0, Number(formData.get("grade")) || 10));
  const target = Math.min(2000, Math.max(8, Number(formData.get("target")) || 80));
  const auto = formData.get("auto") === "on";
  const { data: f } = await supabase.from("school_files").select("category,text_content").eq("id", fileId).eq("school_id", schoolId).maybeSingle();
  if (!f || !subjectId) redirect(`${base(schoolId)}?error=${q("Pilih berkas dan mata pelajaran.")}`);
  if (String(f!.text_content ?? "").trim().length < 300) redirect(`${base(schoolId)}?error=${q("Isi berkas belum terbaca. Analisis ulang atau unggah versi teks.")}`);
  const { data, error } = await supabase.from("bank_jobs").insert({ school_id: schoolId, file_id: fileId, subject_id: subjectId, grade, target, auto_publish: auto, created_by: me.memberId }).select("id").single();
  if (error || !data) redirect(`${base(schoolId)}?error=${q("Tidak bisa memulai. Anda butuh izin menyusun materi.")}`);
  redirect(`${base(schoolId)}/${data!.id}`);
}

// Satu langkah = satu putaran: ±8 butir dari satu potongan buku, lalu pemeriksaan (skema, duplikat, kutipan, pemecah independen).
export async function advanceBank(schoolId: string, jobId: string): Promise<BankStep> {
  const { supabase, me } = await getSchoolContext(schoolId);
  await requireModule(supabase, schoolId, "learning");
  const { data: job } = await supabase.from("bank_jobs").select("*").eq("id", jobId).eq("school_id", schoolId).maybeSingle();
  if (!job) return { ok: false, error: "Pekerjaan tidak ditemukan." };
  const target = job.target as number;
  if (job.status === "selesai") return { ok: true, done: true, pct: 100, label: "Selesai" };
  const { data: f } = await supabase.from("school_files").select("text_content").eq("id", job.file_id as string).maybeSingle();
  const chunks = chunkText(String(f?.text_content ?? ""));
  if (chunks.length === 0) return { ok: false, error: "Isi berkas tidak terbaca." };
  const ai = await resolveAdminAi(supabase, schoolId);
  if (!ai.run) return { ok: false, error: ai.reason ?? "AI belum bisa dipakai." };
  const { data: subj } = await supabase.from("school_subjects").select("name").eq("id", job.subject_id as string).maybeSingle();
  const step = job.step as number, made = job.made as number;
  const maxSteps = Math.ceil(target / ITEMS_PER_ROUND) * 2 + chunks.length;
  const chunk = chunks[step % chunks.length];
  const { data: ex } = await supabase.from("bank_items").select("stem").eq("school_id", schoolId).eq("subject_id", job.subject_id as string).order("created_at", { ascending: false }).limit(500);
  const existing = (ex ?? []).map((r) => r.stem as string);

  let drafts: BankDraft[] = [];
  const prompt = itemsPrompt({ subject: (subj?.name as string) ?? "Pelajaran", grade: job.grade as number, count: Math.min(ITEMS_PER_ROUND, target - made), focus: focusFor(step), text: chunk, avoid: existing.slice(0, 15) });
  for (const extra of ["", "\nPENTING: JSON ringkas satu baris tanpa indentasi."]) {
    try { drafts = sanitizeItems(parseJsonLoose(await ai.run(BANK_SYSTEM, prompt + extra, undefined, 6000))); break; } catch (e) { console.error("advanceBank gagal", e instanceof Error ? e.message.slice(0, 120) : "?"); }
  }
  if (drafts.length === 0) {
    if (step + 1 >= maxSteps) { await supabase.from("bank_jobs").update({ status: "selesai", step: step + 1 }).eq("id", jobId); return { ok: true, done: true, pct: Math.round((made / target) * 100), label: "Berhenti: AI tidak menghasilkan butir yang layak" }; }
    return { ok: false, error: "AI belum menghasilkan butir yang layak. Tekan Lanjutkan untuk mencoba lagi." };
  }

  // duplikat (terhadap bank dan sesama butir putaran ini)
  const accepted: { d: BankDraft; dup: number }[] = [];
  let rejected = 0;
  for (const d of drafts) {
    const dup = maxSimilarity(d.stem, [...existing, ...accepted.map((a) => a.d.stem)]);
    if (dup >= DUP_THRESHOLD) { rejected++; continue; }
    accepted.push({ d, dup });
  }
  // pemecah independen: tanpa kunci, tanpa kutipan
  let got: number[] = accepted.map(() => -1);
  if (accepted.length) {
    try { got = parseSolver(parseJsonLoose(await ai.run(SOLVER_SYSTEM, solverPrompt(accepted.map((a) => a.d)), undefined, 1500)), accepted.length); } catch { /* semua 'tidak' */ }
  }
  let inserted = 0;
  for (const [i, a] of accepted.entries()) {
    const checks: Checks = { solver: solverStatus(a.d, got[i]), quote: quoteStatus(a.d.quote, chunk), dup: Math.round(a.dup * 100) / 100 };
    const status = initialStatus(checks, job.auto_publish as boolean);
    const { data: row } = await supabase.from("bank_items").insert({
      school_id: schoolId, subject_id: job.subject_id, node_id: job.node_id, file_id: job.file_id, stem: a.d.stem, options: a.d.options, bloom: a.d.bloom, rating: a.d.rating,
      source_quote: a.d.quote || null, status, checks, created_by: me.memberId,
    }).select("id").single();
    if (!row) { rejected++; continue; }
    const { error: ke } = await supabase.from("bank_keys").insert({ item_id: row.id, school_id: schoolId, answer: a.d.answer, explanation: a.d.explanation });
    if (ke) { await supabase.from("bank_items").delete().eq("id", row.id); rejected++; continue; }
    inserted++;
  }
  const nowMade = made + inserted;
  const done = nowMade >= target || step + 1 >= maxSteps;
  await supabase.from("bank_jobs").update({ step: step + 1, made: nowMade, rejected: (job.rejected as number) + rejected, status: done ? "selesai" : "berjalan" }).eq("id", jobId);
  if (done) revalidatePath(base(schoolId));
  return { ok: true, done, pct: Math.min(100, Math.round((nowMade / target) * 100)), label: `${nowMade} dari ${target} butir (${(job.rejected as number) + rejected} ditolak)` };
}

const back = (schoolId: string, formData: FormData) => String(formData.get("back") ?? "").startsWith(base(schoolId)) ? String(formData.get("back")) : base(schoolId);

export async function setItemStatus(schoolId: string, itemId: string, status: "siap" | "ditarik" | "draf", formData: FormData) {
  const { supabase } = await getSchoolContext(schoolId);
  await supabase.from("bank_items").update({ status }).eq("id", itemId).eq("school_id", schoolId);
  revalidatePath(base(schoolId));
  redirect(back(schoolId, formData));
}

// Setujui sekaligus semua draf yang lolos pemecah independen DAN kutipan sumber.
export async function approvePassing(schoolId: string, subjectId: string, formData: FormData) {
  const { supabase } = await getSchoolContext(schoolId);
  let upd = supabase.from("bank_items").update({ status: "siap" }).eq("school_id", schoolId).eq("status", "draf").eq("checks->>solver", "ok").eq("checks->>quote", "ok");
  if (subjectId) upd = upd.eq("subject_id", subjectId);
  const { data } = await upd.select("id");
  revalidatePath(base(schoolId));
  redirect(`${back(schoolId, formData).split("?")[0]}?info=${q(`${data?.length ?? 0} butir disetujui dan masuk bank siswa.`)}`);
}

export async function deleteJob(schoolId: string, jobId: string) {
  const { supabase } = await getSchoolContext(schoolId);
  await supabase.from("bank_jobs").delete().eq("id", jobId).eq("school_id", schoolId);
  revalidatePath(base(schoolId));
  redirect(base(schoolId));
}
