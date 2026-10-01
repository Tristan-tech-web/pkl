"use server";

import { decryptSecret } from "@/lib/crypto";
import { generateReply, generateWithPlatform, tutorSystemPrompt, type ChatMsg, type Provider } from "@/lib/ai";
import { enabledModuleCodes } from "@/lib/modules";
import { getSchoolContext } from "@/lib/school";

type Reserve = { mode: "none" | "limit" | "platform" | "school"; provider?: Provider; model?: string; key_ciphertext?: string; remaining?: number; limit?: number };

export async function askTutor(
  schoolId: string,
  nodeId: string,
  history: ChatMsg[],
): Promise<{ ok: true; reply: string; remaining: number | null } | { ok: false; error: string }> {
  const { supabase } = await getSchoolContext(schoolId);
  if (!(await enabledModuleCodes(supabase, schoolId)).has("ai_tutor")) return { ok: false, error: "Tutor AI tidak termasuk paket sekolah ini." };
  const msgs = history
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-8)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 600) }));
  if (msgs.length === 0 || msgs[msgs.length - 1].role !== "user") return { ok: false, error: "Tulis pertanyaanmu dulu." };

  const [{ data: node }, { data: lesson }, { data: ex }] = await Promise.all([
    supabase.from("competency_nodes").select("title,school_subjects(name)").eq("id", nodeId).eq("school_id", schoolId).maybeSingle(),
    supabase.from("lessons").select("body_md").eq("node_id", nodeId).maybeSingle(),
    supabase.rpc("book_excerpts", { p_school_id: schoolId, p_node_id: nodeId }),
  ]);
  if (!node) return { ok: false, error: "Materi tidak ditemukan." };
  const subj = node.school_subjects as { name: string } | { name: string }[] | null;
  const system = tutorSystemPrompt({
    title: node.title as string,
    subject: (Array.isArray(subj) ? subj[0]?.name : subj?.name) ?? "Pelajaran",
    body: (lesson?.body_md as string | undefined) ?? "",
    excerpts: Array.isArray(ex) ? (ex as { file: string; excerpt: string }[]).filter((e) => typeof e?.file === "string" && typeof e?.excerpt === "string").slice(0, 2) : [],
  });

  const { data, error } = await supabase.rpc("reserve_ai_call", { p_school_id: schoolId, p_node_id: nodeId });
  if (error || !data) return { ok: false, error: "Tutor belum bisa dipakai sekarang." };
  const r = data as Reserve;
  if (r.mode === "none") return { ok: false, error: "Tutor AI belum diaktifkan oleh sekolah. Minta kepala sekolah mengisi kunci AI." };
  if (r.mode === "limit") return { ok: false, error: `Jatah tanya tutor hari ini sudah habis (${r.limit} pertanyaan). Coba lagi besok.` };

  try {
    const reply =
      r.mode === "platform"
        ? await generateWithPlatform(system, msgs)
        : await generateReply({
            provider: r.provider as Provider,
            model: r.model as string,
            apiKey: decryptSecret(r.key_ciphertext as string),
            system,
            messages: msgs,
          });
    return { ok: true, reply: reply.slice(0, 1500), remaining: r.remaining ?? null };
  } catch {
    return { ok: false, error: "Tutor sedang sibuk atau kunci AI sekolah bermasalah. Coba lagi sebentar." };
  }
}
