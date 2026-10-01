"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseJsonLoose } from "@/lib/ai";
import { resolveAdminAi } from "@/lib/file-analysis";
import { requireModule } from "@/lib/modules";
import { getSchoolContext } from "@/lib/school";
import {
  TREE_SYSTEM, buildMeetings, chapterPrompt, examDatesFromPlan, layoutTree, parseDates, sanitizeChapterContent, spread, unitTitle, validDate,
  type NodeSpec, type Slot,
} from "@/lib/skilltree";
import { excerptFor, type Plan } from "@/lib/study-plan";

const q = encodeURIComponent;
const base = (id: string) => `/dashboard/sekolah/${id}/skilltree`;
const prefixOf = (planId: string) => `ST-${planId.replace(/-/g, "").slice(0, 8)}`;

export type TreeCfg = { classId: string; start: string; holidays: string };
export type TreeStep = { ok: true; done: boolean; pct: number; label: string; warnings?: string[] } | { ok: false; error: string };

const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };

async function loadContext(schoolId: string, planId: string, cfg: TreeCfg) {
  const { supabase } = await getSchoolContext(schoolId);
  await requireModule(supabase, schoolId, "data_hub");
  const { data: p } = await supabase.from("study_plans").select("id,file_id,subject_id,grade,weeks,plan,school_subjects(name)").eq("id", planId).eq("school_id", schoolId).maybeSingle();
  const plan = p?.plan as Plan | null;
  if (!p || !plan || !p.subject_id) return { error: "Rencana belum selesai dianalisis." };
  if (!validDate(cfg.start)) return { error: "Tanggal mulai tidak valid." };
  const { data: sl } = await supabase.from("schedule_slots").select("weekday,starts_at,ends_at").eq("school_id", schoolId).eq("class_group_id", cfg.classId).eq("school_subject_id", p.subject_id as string);
  const slots: Slot[] = (sl ?? []).map((s) => ({ weekday: s.weekday as number, startMin: toMin(String(s.starts_at)), endMin: toMin(String(s.ends_at)) }));
  if (slots.length === 0) return { error: "Rombel ini belum punya jadwal untuk mapel tersebut. Isi dulu di menu Jadwal." };
  const weeks = Math.min(40, (p.weeks as number) + Math.ceil((p.weeks as number) / 6)); // ruang untuk libur
  const meetings = buildMeetings({ start: cfg.start, weeks, slots, holidays: parseDates(cfg.holidays) });
  const exams = examDatesFromPlan({ start: cfg.start, schedule: plan.schedule, meetings });
  const prefix = prefixOf(planId);
  const layout = layoutTree({ chapters: plan.chapters.map((c) => ({ title: c.title, weight: Math.max(1, c.elements.length) })), meetings: meetings.slice(0, (p.weeks as number) * slots.length), exams, prefix });
  const sj = p.school_subjects as { name: string } | { name: string }[] | null;
  const subject = (Array.isArray(sj) ? sj[0]?.name : sj?.name) ?? "Pelajaran";
  return { error: null, supabase, p, plan, layout, prefix, subject };
}

async function ensureUnit(supabase: Awaited<ReturnType<typeof getSchoolContext>>["supabase"], schoolId: string, subjectId: string, title: string, position: number): Promise<string | null> {
  const { data: ex } = await supabase.from("path_units").select("id").eq("school_id", schoolId).eq("subject_id", subjectId).eq("title", title).maybeSingle();
  if (ex) return ex.id as string;
  const { data } = await supabase.from("path_units").insert({ school_id: schoolId, subject_id: subjectId, title, position, status: "draft" }).select("id").single();
  return (data?.id as string) ?? null;
}

// Satu langkah = satu bab (satu panggilan AI). Langkah terakhir menyusun simpul tantangan akhir dari soal bab.
export async function generateTreeChapter(schoolId: string, planId: string, cfg: TreeCfg, step: number): Promise<TreeStep> {
  const c = await loadContext(schoolId, planId, cfg);
  if (c.error !== null) return { ok: false, error: c.error };
  const { supabase, p, plan, layout, prefix, subject } = c;
  const total = plan.chapters.length;
  const subjectId = p.subject_id as string;
  const classId = cfg.classId;

  const insertNodes = async (specs: NodeSpec[], unitId: string | null, bodies: (s: NodeSpec) => { body: string; qs: { prompt: string; options: string[]; answer: number; explanation: string }[] }) => {
    const { data: last } = await supabase.from("competency_nodes").select("position").eq("school_id", schoolId).eq("subject_id", subjectId).order("position", { ascending: false }).limit(1).maybeSingle();
    let pos = (last?.position as number | undefined) ?? 0;
    for (const s of specs) {
      const { data: node, error } = await supabase.from("competency_nodes").insert({
        school_id: schoolId, subject_id: subjectId, grade: p.grade, code: s.code, title: s.title.slice(0, 160), position: ++pos, status: "draft", kind: s.kind, xp_reward: s.xp, unit_id: unitId, estimated_minutes: s.kind === "boss" ? 20 : 10,
      }).select("id").single();
      if (error || !node) continue;
      const b = bodies(s);
      await supabase.from("lessons").insert({ school_id: schoolId, node_id: node.id, body_md: b.body || `## ${s.title}`, objectives: [] });
      await supabase.from("node_schedule").upsert({ school_id: schoolId, node_id: node.id, class_group_id: classId, unlock_at: s.unlockAt, meeting_at: s.meetingAt });
      let qp = 0;
      for (const qn of b.qs) {
        const { data: row } = await supabase.from("quiz_questions").insert({ school_id: schoolId, node_id: node.id, kind: "mcq", prompt: qn.prompt, options: qn.options, position: ++qp }).select("id").single();
        if (row) { const { error: ke } = await supabase.from("quiz_answer_keys").insert({ question_id: row.id, school_id: schoolId, answer: qn.answer, explanation: qn.explanation }); if (ke) await supabase.from("quiz_questions").delete().eq("id", row.id); }
      }
    }
  };

  // hapus draf lama dengan awalan kode yang sama (hasil terbit tidak disentuh)
  const clear = async (like: string) => {
    const { data: pub } = await supabase.from("competency_nodes").select("id").eq("school_id", schoolId).eq("subject_id", subjectId).like("code", like).neq("status", "draft").limit(1);
    if (pub?.length) return false;
    await supabase.from("competency_nodes").delete().eq("school_id", schoolId).eq("subject_id", subjectId).like("code", like).eq("status", "draft");
    return true;
  };

  if (step < total) {
    const ch = plan.chapters[step];
    const specs = layout.nodes.filter((n) => n.chapter === step && n.kind !== "boss");
    const meetings = layout.chapterMeetings[step]?.length ?? 1;
    if (specs.length === 0) return { ok: true, done: false, pct: Math.round(((step + 1) / (total + 1)) * 100), label: `Bab ${step + 1} dilewati (tidak ada pertemuan)`, warnings: layout.warnings };
    if (!(await clear(`${prefix}-${step + 1}-%`))) return { ok: false, error: `Bab ${step + 1} sudah ada yang diterbitkan; ubah lewat editor simpul.` };
    const ai = await resolveAdminAi(supabase, schoolId);
    if (!ai.run) return { ok: false, error: ai.reason ?? "AI belum bisa dipakai." };
    const { data: f } = await supabase.from("school_files").select("text_content").eq("id", p.file_id as string).maybeSingle();
    const preps = specs.filter((s) => s.kind === "persiapan");
    let content: ReturnType<typeof sanitizeChapterContent> | undefined;
    const prompt = chapterPrompt({ subject, grade: p.grade as number, title: ch.title, summary: ch.summary, elements: ch.elements.map((e) => ({ name: e.name, method: e.method })), meetings, excerpt: excerptFor(String(f?.text_content ?? ""), ch.title, 4000) });
    // Model kecil kadang menghasilkan JSON membengkak/rusak; percobaan kedua meminta bentuk ringkas satu baris.
    for (const extra of ["", "\nPENTING: tulis JSON ringkas dalam satu baris tanpa indentasi, pembahasan maksimal 1 kalimat, pratinjau maksimal 80 kata."]) {
      try { content = sanitizeChapterContent(parseJsonLoose(await ai.run(TREE_SYSTEM, prompt + extra, undefined, 7000)), preps.length); break; }
      catch (e) { console.error("generateTreeChapter gagal", e instanceof Error ? e.message.slice(0, 120) : "?"); }
    }
    if (!content) return { ok: false, error: "AI gagal menjawab untuk bab ini. Tekan Lanjutkan untuk mencoba lagi." };
    if (content.practice.length + content.checkpoint.length === 0) return { ok: false, error: "AI belum menghasilkan soal yang layak. Coba lagi." };
    const unitId = await ensureUnit(supabase, schoolId, subjectId, unitTitle(step, ch.title), step + 1);
    const pre = spread(content.pretest, Math.max(1, preps.length));
    const rev = spread(content.review.length ? content.review : content.checkpoint, Math.max(1, specs.filter((s) => s.kind === "ulang").length));
    await insertNodes(specs, unitId, (s) => {
      if (s.kind === "persiapan") { const i = s.part - 1; return { body: `${content.previews[i]?.body_md ?? `## ${s.title}\nBesok kita belajar: ${ch.title}.`}`, qs: pre[i] ?? [] }; }
      if (s.kind === "latihan") return { body: `## Latihan\nKerjakan sekarang, selagi materi masih segar.`, qs: content.practice };
      if (s.kind === "checkpoint") return { body: `## Cek pemahaman\nTanpa petunjuk. Jawab dari ingatanmu.`, qs: content.checkpoint };
      return { body: `## Ulang berjarak\nMengingat lagi sekarang membuat ingatan lebih kuat.`, qs: rev[s.part - 1] ?? [] };
    });
    return { ok: true, done: false, pct: Math.round(((step + 1) / (total + 1)) * 100), label: `Bab ${step + 1} dari ${total}: ${ch.title}`, warnings: layout.warnings };
  }

  // langkah akhir: simpul tantangan (soal dikumpulkan dari cek pemahaman bab-bab yang diujikan)
  await clear(`${prefix}-X%`);
  for (const boss of layout.nodes.filter((n) => n.kind === "boss")) {
    const pool: { prompt: string; options: string[]; answer: number; explanation: string }[] = [];
    for (const i of boss.sources ?? []) {
      const { data: nd } = await supabase.from("competency_nodes").select("id").eq("school_id", schoolId).eq("subject_id", subjectId).eq("code", `${prefix}-${i + 1}-K1`).maybeSingle();
      if (!nd) continue;
      const { data: qs } = await supabase.from("quiz_questions").select("prompt,options,position,quiz_answer_keys(answer,explanation)").eq("node_id", nd.id).order("position").limit(4);
      for (const r of qs ?? []) {
        const k = r.quiz_answer_keys as { answer: unknown; explanation: string | null } | { answer: unknown; explanation: string | null }[] | null;
        const key = Array.isArray(k) ? k[0] : k;
        if (key && typeof key.answer === "number") pool.push({ prompt: r.prompt as string, options: r.options as string[], answer: key.answer, explanation: key.explanation ?? "" });
      }
    }
    const unitId = await ensureUnit(supabase, schoolId, subjectId, unitTitle(boss.chapter, plan.chapters[boss.chapter].title), boss.chapter + 1);
    await insertNodes([boss], unitId, () => ({ body: `## Tantangan akhir\nGabungan semua bab yang diujikan. Kamu sudah mengulangnya berkali-kali, jadi percayalah pada ingatanmu.`, qs: pool.slice(0, 12) }));
  }
  revalidatePath(base(schoolId));
  return { ok: true, done: true, pct: 100, label: "Selesai", warnings: layout.warnings };
}

async function treeNodes(supabase: Awaited<ReturnType<typeof getSchoolContext>>["supabase"], schoolId: string, planId: string) {
  const { data } = await supabase.from("competency_nodes").select("id,unit_id,status").eq("school_id", schoolId).like("code", `${prefixOf(planId)}-%`);
  return data ?? [];
}

// Geser semua tanggal buka (dan pertemuan) sejumlah hari, mis. karena libur panjang.
export async function shiftTree(schoolId: string, planId: string, formData: FormData) {
  const { supabase } = await getSchoolContext(schoolId);
  const days = Math.max(-60, Math.min(60, Math.trunc(Number(formData.get("days")) || 0)));
  const here = `${base(schoolId)}/${planId}`;
  if (days === 0) redirect(`${here}?error=${q("Isi jumlah hari (boleh negatif).")}`);
  const nodes = await treeNodes(supabase, schoolId, planId);
  if (nodes.length) {
    const { data: rows } = await supabase.from("node_schedule").select("node_id,class_group_id,unlock_at,meeting_at").in("node_id", nodes.map((n) => n.id as string));
    const sh = (iso: string | null) => (iso ? new Date(new Date(iso).getTime() + days * 86_400_000).toISOString() : null);
    for (const r of rows ?? []) await supabase.from("node_schedule").update({ unlock_at: sh(r.unlock_at as string), meeting_at: sh(r.meeting_at as string | null) }).eq("node_id", r.node_id as string).eq("class_group_id", r.class_group_id as string);
  }
  revalidatePath(here);
  redirect(`${here}?info=${q(`Semua tanggal digeser ${days > 0 ? "+" : ""}${days} hari.`)}`);
}

// Terbitkan satu unit: simpul draf yang punya soal ikut terbit.
export async function publishUnit(schoolId: string, planId: string, unitId: string) {
  const { supabase } = await getSchoolContext(schoolId);
  const here = `${base(schoolId)}/${planId}`;
  const nodes = (await treeNodes(supabase, schoolId, planId)).filter((n) => n.unit_id === unitId && n.status === "draft");
  let ok = 0, skipped = 0;
  for (const n of nodes) {
    const { count } = await supabase.from("quiz_questions").select("id", { count: "exact", head: true }).eq("node_id", n.id as string);
    if (!count) { skipped++; continue; }
    const { error } = await supabase.from("competency_nodes").update({ status: "published" }).eq("id", n.id as string).eq("school_id", schoolId);
    if (!error) ok++;
  }
  if (ok > 0) await supabase.from("path_units").update({ status: "published" }).eq("id", unitId).eq("school_id", schoolId);
  revalidatePath(here);
  redirect(`${here}?info=${q(`${ok} simpul terbit${skipped ? `, ${skipped} dilewati (belum ada soal)` : ""}. Siswa melihatnya pada hari buka masing-masing.`)}`);
}

export async function unpublishUnit(schoolId: string, planId: string, unitId: string) {
  const { supabase } = await getSchoolContext(schoolId);
  const here = `${base(schoolId)}/${planId}`;
  const nodes = (await treeNodes(supabase, schoolId, planId)).filter((n) => n.unit_id === unitId);
  for (const n of nodes) await supabase.from("competency_nodes").update({ status: "draft" }).eq("id", n.id as string).eq("school_id", schoolId);
  await supabase.from("path_units").update({ status: "draft" }).eq("id", unitId).eq("school_id", schoolId);
  revalidatePath(here);
  redirect(`${here}?info=${q("Unit ditarik kembali menjadi draf.")}`);
}

export async function deleteTree(schoolId: string, planId: string) {
  const { supabase } = await getSchoolContext(schoolId);
  const nodes = await treeNodes(supabase, schoolId, planId);
  const unitIds = [...new Set(nodes.map((n) => n.unit_id as string | null).filter(Boolean))] as string[];
  const here = `${base(schoolId)}/${planId}`;
  if (nodes.some((n) => n.status === "published")) redirect(`${here}?error=${q("Ada simpul yang sudah terbit. Tarik kembali tiap unit menjadi draf dulu.")}`);
  await supabase.from("competency_nodes").delete().eq("school_id", schoolId).like("code", `${prefixOf(planId)}-%`);
  if (unitIds.length) await supabase.from("path_units").delete().eq("school_id", schoolId).in("id", unitIds).eq("status", "draft");
  revalidatePath(here);
  redirect(`${here}?info=${q("Skill tree dihapus.")}`);
}

// Ubah tanggal buka satu simpul (semua rombel yang punya jadwal untuknya). Format WIB "YYYY-MM-DDTHH:mm".
export async function setNodeDate(schoolId: string, planId: string, nodeId: string, formData: FormData) {
  const { supabase } = await getSchoolContext(schoolId);
  const here = `${base(schoolId)}/${planId}`;
  const val = String(formData.get("unlock") ?? "").trim();
  const d = new Date(`${val}:00+07:00`);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(val) || Number.isNaN(d.getTime())) redirect(`${here}?error=${q("Tanggal tidak valid.")}`);
  const { data: node } = await supabase.from("competency_nodes").select("id").eq("id", nodeId).eq("school_id", schoolId).like("code", `${prefixOf(planId)}-%`).maybeSingle();
  if (!node) redirect(`${here}?error=${q("Simpul tidak ditemukan.")}`);
  const { error } = await supabase.from("node_schedule").update({ unlock_at: d.toISOString() }).eq("node_id", nodeId).eq("school_id", schoolId);
  revalidatePath(here);
  redirect(error ? `${here}?error=${q("Tanggal belum bisa disimpan.")}` : `${here}?info=${q("Tanggal buka diubah.")}`);
}
