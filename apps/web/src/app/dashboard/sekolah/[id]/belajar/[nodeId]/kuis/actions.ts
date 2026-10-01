"use server";

import type { Integrity } from "@/app/dashboard/sekolah/[id]/latihan/actions";
import { getSchoolContext } from "@/lib/school";

export type QuizResult = {
  score: number; correct: number; total: number; stars: number; passed: boolean;
  xp_awarded: number; bonus: number; xp_total: number; level: number; level_before: number; leveled_up: boolean;
  xp_into_level: number; xp_for_level: number; streak: number;
  unlocked: { id: string; title: string }[];
  integrity?: Integrity;
  results: { question_id: string; correct: boolean; correct_answer: unknown; explanation: string }[];
};

export async function submitQuizAction(
  schoolId: string,
  nodeId: string,
  answers: Record<string, number | string | number[]>,
  blurs = 0,
): Promise<{ ok: true; data: QuizResult } | { ok: false; error: string }> {
  const { supabase } = await getSchoolContext(schoolId);
  const { data, error } = await supabase.rpc("submit_quiz", { p_node_id: nodeId, p_answers: answers });
  if (error || !data) return { ok: false, error: error?.message.includes("terkunci") ? "Materi ini masih terkunci." : "Jawaban belum bisa dinilai. Coba lagi." };
  const result = data as QuizResult;
  // pemeriksaan integritas setelah dinilai (waktu mulai dicatat server saat halaman kuis dibuka)
  const { data: ic } = await supabase.rpc("quiz_integrity_check", { p_school: schoolId, p_node: nodeId, p_blurs: Math.max(0, Math.min(99, Math.trunc(blurs) || 0)) });
  if (ic) result.integrity = ic as Integrity;
  return { ok: true, data: result };
}
