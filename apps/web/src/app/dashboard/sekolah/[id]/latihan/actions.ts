"use server";

import { redirect } from "next/navigation";
import { getSchoolContext } from "@/lib/school";

export type PracticeItem = { id: string; stem: string; options: string[]; bloom: string };
export type Next = { ok: true; done: boolean; index?: number; total: number; xp: number; item?: PracticeItem; empty?: boolean } | { ok: false; error: string };
export type Answered = { ok: true; correct: boolean; answer: number; explanation: string | null; xp: number; flags: string[]; sessionXp: number; answered: number; total: number; done: boolean } | { ok: false; error: string };

export async function practiceStart(schoolId: string, subjectId: string) {
  const { supabase } = await getSchoolContext(schoolId);
  const { data, error } = await supabase.rpc("practice_start", { p_school: schoolId, p_subject: subjectId, p_count: 10 });
  if (error || !data) redirect(`/dashboard/sekolah/${schoolId}/latihan?error=${encodeURIComponent("Belum ada soal untuk mapel ini.")}`);
  redirect(`/dashboard/sekolah/${schoolId}/latihan/${data as string}`);
}

export async function practiceNext(schoolId: string, sessionId: string): Promise<Next> {
  const { supabase } = await getSchoolContext(schoolId);
  const { data, error } = await supabase.rpc("practice_next", { p_session: sessionId });
  if (error || !data) return { ok: false, error: "Soal belum bisa dimuat." };
  const r = data as { done: boolean; index?: number; total: number; xp: number; item?: PracticeItem; empty?: boolean };
  return { ok: true, ...r };
}

export async function practiceAnswer(schoolId: string, sessionId: string, itemId: string, choice: number, meta: { blurs?: number }): Promise<Answered> {
  const { supabase } = await getSchoolContext(schoolId);
  const { data, error } = await supabase.rpc("practice_answer", { p_session: sessionId, p_item: itemId, p_choice: choice, p_meta: { blurs: Math.max(0, Math.min(99, Number(meta.blurs) || 0)) } });
  if (error || !data) return { ok: false, error: "Jawaban belum terkirim. Coba lagi." };
  const r = data as { correct: boolean; answer: number; explanation: string | null; xp: number; flags: string[]; session_xp: number; answered: number; total: number; done: boolean };
  return { ok: true, correct: r.correct, answer: r.answer, explanation: r.explanation, xp: r.xp, flags: r.flags, sessionXp: r.session_xp, answered: r.answered, total: r.total, done: r.done };
}

export async function reportItem(schoolId: string, itemId: string): Promise<void> {
  const { supabase } = await getSchoolContext(schoolId);
  await supabase.rpc("bank_report", { p_item: itemId, p_reason: "dilaporkan siswa" });
}
