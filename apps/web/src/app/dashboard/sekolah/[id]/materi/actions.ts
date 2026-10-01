"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSchoolContext } from "@/lib/school";

const q = encodeURIComponent;
const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const base = (id: string) => `/dashboard/sekolah/${id}/materi`;
const go = (path: string, kind: "error" | "info", text: string): never => redirect(`${path}?${kind}=${q(text)}`);

export async function createNode(schoolId: string, formData: FormData) {
  const { supabase } = await getSchoolContext(schoolId);
  const subjectId = str(formData, "subject_id");
  const title = str(formData, "title");
  const grade = Number(str(formData, "grade")) || 10;
  if (!subjectId || title.length < 2) go(base(schoolId), "error", "Pilih mata pelajaran dan isi judul (minimal 2 huruf).");
  const { data: last } = await supabase
    .from("competency_nodes").select("position").eq("school_id", schoolId).eq("subject_id", subjectId)
    .order("position", { ascending: false }).limit(1).maybeSingle();
  const position = ((last?.position as number | undefined) ?? 0) + 1;
  const code = str(formData, "code") || `M-${position}`;
  const { data, error } = await supabase
    .from("competency_nodes")
    .insert({ school_id: schoolId, subject_id: subjectId, grade, code, title, position, status: "draft" })
    .select("id").single();
  if (error || !data) return go(base(schoolId), "error", "Materi belum bisa dibuat. Kode mungkin sudah dipakai di mata pelajaran ini.");
  await supabase.from("lessons").insert({ school_id: schoolId, node_id: data.id, body_md: "## Judul bagian\nTulis penjelasan di sini." });
  revalidatePath(base(schoolId));
  redirect(`${base(schoolId)}/${data.id}?info=${q("Materi dibuat sebagai draf.")}`);
}

export async function saveNode(schoolId: string, nodeId: string, formData: FormData) {
  const { supabase } = await getSchoolContext(schoolId);
  const page = `${base(schoolId)}/${nodeId}`;
  const title = str(formData, "title");
  const status = str(formData, "status");
  const xp = Math.min(1000, Math.max(0, Number(str(formData, "xp_reward")) || 50));
  const minutes = Number(str(formData, "estimated_minutes")) || null;
  if (title.length < 2 || !["draft", "published", "archived"].includes(status)) go(page, "error", "Judul minimal 2 huruf dan status harus valid.");
  if (status === "published") {
    const { count } = await supabase.from("quiz_questions").select("id", { count: "exact", head: true }).eq("node_id", nodeId);
    if (!count) go(page, "error", "Tambahkan minimal satu soal sebelum menerbitkan.");
  }
  const kinds = ["materi", "persiapan", "latihan", "ulang", "checkpoint", "boss", "proyek", "cerita"];
  const kind = kinds.includes(str(formData, "kind")) ? str(formData, "kind") : "materi";
  let unitId: string | null = str(formData, "unit_id") || null;
  const newUnit = str(formData, "new_unit");
  if (newUnit.length >= 2) {
    const { data: nd } = await supabase.from("competency_nodes").select("subject_id").eq("id", nodeId).maybeSingle();
    const { data: last } = await supabase.from("path_units").select("position").eq("school_id", schoolId).eq("subject_id", nd?.subject_id as string).order("position", { ascending: false }).limit(1).maybeSingle();
    const { data: u } = await supabase.from("path_units").insert({ school_id: schoolId, subject_id: nd?.subject_id, title: newUnit.slice(0, 120), position: ((last?.position as number | undefined) ?? 0) + 1 }).select("id").single();
    if (u) unitId = u.id as string;
  }
  const { error } = await supabase.from("competency_nodes")
    .update({ title, summary: str(formData, "summary") || null, status, xp_reward: xp, estimated_minutes: minutes, kind, unit_id: unitId })
    .eq("id", nodeId).eq("school_id", schoolId);
  if (error) go(page, "error", "Perubahan belum bisa disimpan.");
  // jadwal buka per rombel (WIB → UTC); kosong = hapus
  for (const [k, v] of formData.entries()) {
    if (!k.startsWith("sched_")) continue;
    const classId = k.slice(6), val = String(v).trim();
    if (!val) { await supabase.from("node_schedule").delete().eq("node_id", nodeId).eq("class_group_id", classId); continue; }
    const d = new Date(`${val}:00+07:00`);
    if (Number.isNaN(d.getTime())) continue;
    await supabase.from("node_schedule").upsert({ school_id: schoolId, node_id: nodeId, class_group_id: classId, unlock_at: d.toISOString() });
  }
  const objectives = str(formData, "objectives").split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 8);
  const visual = str(formData, "visual_module") === "parabola" ? "parabola" : null;
  await supabase.from("lessons").upsert({
    node_id: nodeId, school_id: schoolId, body_md: String(formData.get("body_md") ?? "").slice(0, 20000), objectives, visual_module: visual, updated_at: new Date().toISOString(),
  });
  // prasyarat: ganti seluruhnya, tanpa menunjuk diri sendiri
  const reqs = formData.getAll("requires").map(String).filter((r) => r && r !== nodeId);
  await supabase.from("competency_prerequisites").delete().eq("node_id", nodeId).eq("school_id", schoolId);
  if (reqs.length) await supabase.from("competency_prerequisites").insert(reqs.map((r) => ({ school_id: schoolId, node_id: nodeId, requires_id: r })));
  revalidatePath(base(schoolId));
  go(page, "info", "Tersimpan.");
}

export async function addQuestion(schoolId: string, nodeId: string, formData: FormData) {
  const { supabase } = await getSchoolContext(schoolId);
  const page = `${base(schoolId)}/${nodeId}`;
  const kind = str(formData, "kind") === "short" ? "short" : "mcq";
  const prompt = str(formData, "prompt");
  const explanation = str(formData, "explanation");
  if (prompt.length < 3 || explanation.length < 3) go(page, "error", "Isi pertanyaan dan pembahasan (minimal 3 huruf).");
  let options: string[] = [];
  let answer: number | string[];
  if (kind === "mcq") {
    options = str(formData, "options").split("\n").map((s) => s.trim()).filter(Boolean);
    const idx = Number(str(formData, "correct")) - 1;
    if (options.length < 2 || options.length > 6 || !Number.isInteger(idx) || idx < 0 || idx >= options.length) {
      go(page, "error", "Pilihan ganda butuh 2–6 pilihan (satu per baris) dan nomor jawaban benar yang sesuai.");
    }
    answer = idx;
  } else {
    answer = str(formData, "accepted").split(",").map((s) => s.trim()).filter(Boolean);
    if ((answer as string[]).length === 0) go(page, "error", "Isian singkat butuh minimal satu jawaban yang diterima (pisahkan dengan koma).");
  }
  const { data: last } = await supabase.from("quiz_questions").select("position").eq("node_id", nodeId).order("position", { ascending: false }).limit(1).maybeSingle();
  const { data: qn, error } = await supabase.from("quiz_questions")
    .insert({ school_id: schoolId, node_id: nodeId, kind, prompt, options, position: ((last?.position as number | undefined) ?? 0) + 1 })
    .select("id").single();
  if (error || !qn) return go(page, "error", "Soal belum bisa disimpan.");
  const { error: ke } = await supabase.from("quiz_answer_keys").insert({ question_id: qn.id, school_id: schoolId, answer, explanation });
  if (ke) {
    await supabase.from("quiz_questions").delete().eq("id", qn.id);
    return go(page, "error", "Kunci jawaban belum bisa disimpan.");
  }
  revalidatePath(page);
  go(page, "info", "Soal ditambahkan.");
}

export async function deleteQuestion(schoolId: string, nodeId: string, questionId: string) {
  const { supabase } = await getSchoolContext(schoolId);
  await supabase.from("quiz_questions").delete().eq("id", questionId).eq("school_id", schoolId);
  revalidatePath(`${base(schoolId)}/${nodeId}`);
  go(`${base(schoolId)}/${nodeId}`, "info", "Soal dihapus.");
}
