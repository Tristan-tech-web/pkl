"use server";

import { redirect } from "next/navigation";
import { getSchoolContext } from "@/lib/school";

export type PracticeItem = { id: string; stem: string; options: string[]; bloom: string };
export type Next = { ok: true; integrity?: Integrity; done: boolean; index?: number; total: number; xp: number; item?: PracticeItem; empty?: boolean } | { ok: false; error: string };
export type Integrity = { level: "rendah" | "sedang" | "tinggi"; score?: number; case_id?: string; xp_reversed?: number; xp_penalty?: number } | null;
export type Answered = { ok: true; integrity: Integrity; correct: boolean; answer: number; explanation: string | null; xp: number; flags: string[]; sessionXp: number; answered: number; total: number; done: boolean } | { ok: false; error: string };

export async function practiceStart(schoolId: string, subjectId: string, formData: FormData) {
  const { supabase } = await getSchoolContext(schoolId);
  const { data, error } = await supabase.rpc("practice_open", { p_school: schoolId, p_subject: subjectId, p_count: 10, p_camera: formData.get("camera") === "on" });
  if (error || !data) redirect(`/dashboard/sekolah/${schoolId}/latihan?error=${encodeURIComponent("Belum ada soal untuk mapel ini.")}`);
  redirect(`/dashboard/sekolah/${schoolId}/latihan/${data as string}`);
}

export async function practiceNext(schoolId: string, sessionId: string): Promise<Next> {
  const { supabase } = await getSchoolContext(schoolId);
  const { data, error } = await supabase.rpc("practice_next", { p_session: sessionId });
  if (error || !data) return { ok: false, error: "Soal belum bisa dimuat." };
  const r = data as { done: boolean; index?: number; total: number; xp: number; item?: PracticeItem; empty?: boolean; integrity?: Integrity };
  return { ok: true, ...r };
}

export async function practiceAnswer(schoolId: string, sessionId: string, itemId: string, choice: number, meta: { blurs?: number; cam?: { noface_ms?: number; multi?: number } }): Promise<Answered> {
  const { supabase } = await getSchoolContext(schoolId);
  const { data, error } = await supabase.rpc("practice_answer", { p_session: sessionId, p_item: itemId, p_choice: choice, p_meta: { blurs: Math.max(0, Math.min(99, Number(meta.blurs) || 0)), ...(meta.cam ? { cam: { noface_ms: Math.max(0, Math.min(600000, Number(meta.cam.noface_ms) || 0)), multi: Math.max(0, Math.min(99, Number(meta.cam.multi) || 0)) } } : {}) } });
  if (error || !data) return { ok: false, error: "Jawaban belum terkirim. Coba lagi." };
  const r = data as { integrity: Integrity; correct: boolean; answer: number; explanation: string | null; xp: number; flags: string[]; session_xp: number; answered: number; total: number; done: boolean };
  return { ok: true, integrity: r.integrity ?? null, correct: r.correct, answer: r.answer, explanation: r.explanation, xp: r.xp, flags: r.flags, sessionXp: r.session_xp, answered: r.answered, total: r.total, done: r.done };
}

export async function reportItem(schoolId: string, itemId: string): Promise<void> {
  const { supabase } = await getSchoolContext(schoolId);
  await supabase.rpc("bank_report", { p_item: itemId, p_reason: "dilaporkan siswa" });
}

export async function appealCase(schoolId: string, caseId: string, text: string): Promise<{ ok: boolean; error?: string }> {
  const { supabase } = await getSchoolContext(schoolId);
  const { error } = await supabase.rpc("integrity_appeal", { p_case: caseId, p_text: text.slice(0, 600) });
  return error ? { ok: false, error: /alasan/.test(error.message) ? "Tulis alasan banding minimal 5 huruf." : "Banding belum terkirim." } : { ok: true };
}
