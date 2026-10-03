"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { FIN_FIELDS, loadRoster, loadStudents, matchRoster, matchStudents, normalizeFinance, type FinField } from "@/lib/finance-import";
import { DRAFT_SYSTEM, draftPrompt, sanitizeDraft } from "@/lib/curriculum-draft";
import { aiAttachableMime } from "@/lib/parse-file";
import { parseJsonLoose } from "@/lib/ai";
import { analyzeFileById, resolveAdminAi } from "@/lib/file-analysis";
import { CATEGORIES, type Category, normalizePeople, type PersonField, PERSON_FIELDS, type PersonKind } from "@/lib/intake";
import { parseBuffer } from "@/lib/parse-file";
import { requireModule } from "@/lib/modules";
import { getSchoolContext } from "@/lib/school";

const q = encodeURIComponent;
const ALLOWED = ["pdf", "docx", "xlsx", "csv", "tsv", "txt", "md", "png", "jpg", "jpeg", "webp"];
const MAX_BYTES = 50 * 1024 * 1024;
const page = (id: string) => `/dashboard/sekolah/${id}/berkas`;
const safeName = (n: string) => n.normalize("NFKD").replace(/[^\w.\- ]+/g, "").replace(/\s+/g, "_").slice(-120) || "berkas";
const SCOPES = ["sekolah", "guru"] as const;
type Scope = (typeof SCOPES)[number];

export async function prepareUpload(schoolId: string, scope: Scope, fileName: string, size: number): Promise<{ ok: true; path: string; token: string } | { ok: false; error: string }> {
  const { supabase } = await getSchoolContext(schoolId);
  await requireModule(supabase, schoolId, "data_hub");
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (!SCOPES.includes(scope)) return { ok: false, error: "Ruang tidak valid." };
  if (!ALLOWED.includes(ext)) return { ok: false, error: `Jenis berkas .${ext} belum didukung. Boleh: ${ALLOWED.join(", ")}.` };
  if (!(size > 0) || size > MAX_BYTES) return { ok: false, error: "Ukuran berkas maksimal 50 MB." };
  const path = `${schoolId}/${scope}/${randomUUID()}-${safeName(fileName)}`;
  const { data, error } = await supabase.storage.from("school-files").createSignedUploadUrl(path);
  if (error || !data) return { ok: false, error: "Anda belum punya izin mengunggah di ruang ini." };
  return { ok: true, path, token: data.token };
}

export async function registerFile(schoolId: string, input: { path: string; name: string; size: number; mime: string; scope: Scope; category?: string; subjectId?: string | null }): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const { supabase, me } = await getSchoolContext(schoolId);
  await requireModule(supabase, schoolId, "data_hub");
  if (!input.path.startsWith(`${schoolId}/${input.scope}/`)) return { ok: false, error: "Jalur berkas tidak valid." };
  const cat = CATEGORIES.includes(input.category as Category) ? (input.category as Category) : "belum_dipilah";
  const { data, error } = await supabase.from("school_files").insert({
    school_id: schoolId, scope: input.scope, uploaded_by: me.memberId, name: input.name.slice(0, 200), mime: input.mime || null, size_bytes: input.size, path: input.path,
    category: cat, category_source: "manual", subject_id: input.subjectId || null,
  }).select("id").single();
  if (error || !data) return { ok: false, error: "Berkas belum bisa dicatat." };
  revalidatePath(page(schoolId));
  return { ok: true, id: data.id as string };
}

export async function analyzeFile(schoolId: string, fileId: string): Promise<{ ok: boolean; message: string }> {
  const { supabase } = await getSchoolContext(schoolId);
  await requireModule(supabase, schoolId, "data_hub");
  const r = await analyzeFileById(supabase, schoolId, fileId);
  revalidatePath(page(schoolId));
  return r;
}

export async function reanalyze(schoolId: string, fileId: string) {
  const r = await analyzeFile(schoolId, fileId);
  redirect(`${page(schoolId)}?${r.ok ? "info" : "error"}=${q(r.message)}`);
}

export async function setCategory(schoolId: string, fileId: string, formData: FormData) {
  const { supabase } = await getSchoolContext(schoolId);
  const category = String(formData.get("category") ?? "");
  const subject = String(formData.get("subject_id") ?? "") || null;
  if (!CATEGORIES.includes(category as Category)) redirect(`${page(schoolId)}?error=${q("Kategori tidak valid.")}`);
  await supabase.from("school_files").update({ category, category_source: "manual", subject_id: subject }).eq("id", fileId).eq("school_id", schoolId);
  revalidatePath(page(schoolId));
  redirect(`${page(schoolId)}?info=${q("Kategori diubah.")}`);
}

export async function deleteFile(schoolId: string, fileId: string) {
  const { supabase } = await getSchoolContext(schoolId);
  const { data: f } = await supabase.from("school_files").select("path").eq("id", fileId).eq("school_id", schoolId).maybeSingle();
  if (f) await supabase.storage.from("school-files").remove([f.path as string]);
  await supabase.from("school_files").delete().eq("id", fileId).eq("school_id", schoolId);
  revalidatePath(page(schoolId));
  redirect(`${page(schoolId)}?info=${q("Berkas dihapus.")}`);
}

const ROLE_FOR: Record<PersonKind, string> = { siswa: "student", guru: "teacher", staf: "admin", orang_tua: "parent" };

export async function importRoster(schoolId: string, fileId: string, formData: FormData) {
  const { supabase, me } = await getSchoolContext(schoolId, { management: true });
  await requireModule(supabase, schoolId, "data_hub");
  const here = `${page(schoolId)}/${fileId}`;
  const kind = String(formData.get("kind") ?? "siswa") as PersonKind;
  if (!(kind in ROLE_FOR)) redirect(`${here}?error=${q("Jenis data tidak valid.")}`);
  const headerRow = Math.max(0, Number(formData.get("header_row")) || 0);
  const mapping: Partial<Record<PersonField, number>> = {};
  for (const f of PERSON_FIELDS) { const v = String(formData.get(`m_${f}`) ?? ""); if (v !== "" && Number.isInteger(Number(v))) mapping[f] = Number(v); }
  if (mapping.full_name === undefined) redirect(`${here}?error=${q("Pilih kolom nama lengkap.")}`);
  const mode = String(formData.get("duplicates") ?? "lewati");
  const makeInvites = formData.get("invites") === "on";

  const { data: f } = await supabase.from("school_files").select("name,mime,path").eq("id", fileId).eq("school_id", schoolId).maybeSingle();
  if (!f) redirect(`${page(schoolId)}?error=${q("Berkas tidak ditemukan.")}`);
  const dl = await supabase.storage.from("school-files").download(f!.path as string);
  if (dl.error || !dl.data) redirect(`${here}?error=${q("Berkas tidak bisa dibaca.")}`);
  const parsed = await parseBuffer(f!.name as string, f!.mime as string | null, Buffer.from(await dl.data!.arrayBuffer()));
  if (parsed.kind !== "table") redirect(`${here}?error=${q("Berkas ini bukan tabel.")}`);
  const results = normalizePeople((parsed as { rows: string[][] }).rows, headerRow, mapping);
  const valid = results.filter((r) => r.values).map((r) => r.values!);
  if (valid.length === 0) redirect(`${here}?error=${q("Tidak ada baris yang valid untuk diimpor.")}`);

  const [{ data: existing }, { data: classes }, { data: roles }] = await Promise.all([
    supabase.from("roster_people").select("id,nis,nisn,member_id").eq("school_id", schoolId),
    supabase.from("class_groups").select("id,name").eq("school_id", schoolId),
    supabase.from("roles").select("id,code").eq("school_id", schoolId),
  ]);
  const byNisn = new Map((existing ?? []).filter((e) => e.nisn).map((e) => [e.nisn as string, e]));
  const byNis = new Map((existing ?? []).filter((e) => e.nis).map((e) => [e.nis as string, e]));
  const classId = new Map((classes ?? []).map((c) => [String(c.name).toLowerCase(), c.id as string]));
  const roleId = (roles ?? []).find((r) => r.code === ROLE_FOR[kind])?.id as string | undefined;

  const inserts: Record<string, unknown>[] = [], updates: { id: string; row: Record<string, unknown> }[] = [];
  let skipped = 0;
  for (const v of valid) {
    const dup = (v.nisn && byNisn.get(v.nisn)) || (v.nis && byNis.get(v.nis)) || null;
    const row = { ...v, kind, school_id: schoolId, source_file_id: fileId };
    if (dup) { if (mode === "perbarui") updates.push({ id: dup.id as string, row: { ...v, source_file_id: fileId } }); else skipped++; }
    else inserts.push(row);
  }
  let created: { id: string; full_name: string; class_name: string | null }[] = [];
  for (let i = 0; i < inserts.length; i += 200) {
    const { data, error } = await supabase.from("roster_people").insert(inserts.slice(i, i + 200)).select("id,full_name,class_name");
    if (error) redirect(`${here}?error=${q("Sebagian data gagal disimpan. Periksa NIS/NISN ganda.")}`);
    created = created.concat((data ?? []) as typeof created);
  }
  for (const u of updates) await supabase.from("roster_people").update(u.row).eq("id", u.id);

  let inviteCount = 0;
  if (makeInvites && roleId && created.length > 0) {
    const expires = new Date(Date.now() + 60 * 86400000).toISOString();
    const rows = created.map((c) => ({ school_id: schoolId, role_id: roleId, class_group_id: c.class_name ? classId.get(c.class_name.toLowerCase()) ?? null : null, max_uses: 1, expires_at: expires, label: c.full_name.length < 2 ? "Tanpa nama" : c.full_name, roster_id: c.id }));
    for (let i = 0; i < rows.length; i += 200) {
      const { error } = await supabase.from("invites").insert(rows.slice(i, i + 200));
      if (error) redirect(`${here}?error=${q("Data tersimpan, tetapi kode undangan gagal dibuat. Buat dari halaman Roster.")}`);
    }
    inviteCount = rows.length;
  }
  await supabase.from("school_files").update({ status: "diimpor", imported_at: new Date().toISOString(), category: kind === "siswa" ? "siswa" : "guru" }).eq("id", fileId);
  void me;
  revalidatePath(page(schoolId));
  const msg = `${created.length} ditambahkan${updates.length ? `, ${updates.length} diperbarui` : ""}${skipped ? `, ${skipped} sudah ada (dilewati)` : ""}${results.length - valid.length ? `, ${results.length - valid.length} baris bermasalah diabaikan` : ""}.`;
  if (inviteCount > 0) redirect(`/dashboard/sekolah/${schoolId}/anggota/impor/kartu?n=${inviteCount}`);
  redirect(`/dashboard/sekolah/${schoolId}/administrasi/roster?info=${q(msg)}`);
}

export async function importFinance(schoolId: string, fileId: string, formData: FormData) {
  const { supabase, me } = await getSchoolContext(schoolId, { management: true });
  await requireModule(supabase, schoolId, "data_hub");
  await requireModule(supabase, schoolId, "fees");
  const here = `${page(schoolId)}/${fileId}/keuangan`;
  const headerRow = Math.max(0, Number(formData.get("header_row")) || 0);
  const mapping: Partial<Record<FinField, number>> = {};
  for (const f of FIN_FIELDS) { const v = String(formData.get(`m_${f}`) ?? ""); if (v !== "" && Number.isInteger(Number(v))) mapping[f] = Number(v); }
  if (mapping.amount === undefined || (mapping.name === undefined && mapping.nis === undefined)) redirect(`${here}?error=${q("Pilih kolom nama (atau NIS) dan nominal.")}`);
  const { data: f } = await supabase.from("school_files").select("name,mime,path").eq("id", fileId).eq("school_id", schoolId).maybeSingle();
  if (!f) redirect(`${page(schoolId)}?error=${q("Berkas tidak ditemukan.")}`);
  const dl = await supabase.storage.from("school-files").download(f!.path as string);
  if (dl.error || !dl.data) redirect(`${here}?error=${q("Berkas tidak bisa dibaca.")}`);
  const parsed = await parseBuffer(f!.name as string, f!.mime as string | null, Buffer.from(await dl.data!.arrayBuffer()));
  if (parsed.kind !== "table") redirect(`${here}?error=${q("Berkas ini bukan tabel.")}`);
  const valid = normalizeFinance((parsed as { rows: string[][] }).rows, headerRow, mapping).flatMap((r) => (r.row ? [r.row] : []));

  const { students } = await loadStudents(supabase, schoolId);
  const { matched, unmatched: rest } = matchStudents(valid, students);
  const { roster } = await loadRoster(supabase, schoolId);
  const { matched: viaRoster, unmatched } = matchRoster(rest, roster);
  if (matched.length === 0 && viaRoster.length === 0) redirect(`${here}?error=${q("Tidak ada baris yang cocok dengan siswa terdaftar.")}`);
  const today = new Date().toISOString().slice(0, 10);
  let made = 0, paid = 0;
  for (let i = 0; i < matched.length; i += 100) {
    const chunk = matched.slice(i, i + 100);
    const { data, error } = await supabase.from("invoices").insert(chunk.map(({ row, memberId }) => ({ school_id: schoolId, member_id: memberId, title: row.title, amount: row.amount, due_on: row.due_on, created_by: me.memberId }))).select("id");
    if (error || !data) redirect(`${here}?error=${q("Sebagian tagihan gagal disimpan.")}`);
    made += data!.length;
    const pays = chunk.flatMap((c, j) => (c.row.paid ? [{ school_id: schoolId, invoice_id: data![j].id as string, amount: c.row.amount, method: "lainnya", paid_on: today, note: "Diimpor dari berkas", recorded_by: me.memberId }] : []));
    if (pays.length) { await supabase.from("payments").insert(pays); paid += pays.length; }
  }
  // siswa yang belum bergabung: tagihan menempel ke roster dan pindah otomatis ke akun saat mereka bergabung
  for (let i = 0; i < viaRoster.length; i += 100) {
    const chunk = viaRoster.slice(i, i + 100);
    const { data, error } = await supabase.from("invoices").insert(chunk.map(({ row, rosterId }) => ({ school_id: schoolId, roster_id: rosterId, title: row.title, amount: row.amount, due_on: row.due_on, created_by: me.memberId }))).select("id");
    if (error || !data) redirect(`${here}?error=${q("Sebagian tagihan untuk siswa belum bergabung gagal disimpan.")}`);
    made += data!.length;
    const pays = chunk.flatMap((c, j) => (c.row.paid ? [{ school_id: schoolId, invoice_id: data![j].id as string, amount: c.row.amount, method: "lainnya", paid_on: today, note: "Diimpor dari berkas", recorded_by: me.memberId }] : []));
    if (pays.length) { await supabase.from("payments").insert(pays); paid += pays.length; }
  }
  await supabase.from("school_files").update({ status: "diimpor", imported_at: new Date().toISOString() }).eq("id", fileId);
  revalidatePath(`/dashboard/sekolah/${schoolId}/keuangan`);
  redirect(`/dashboard/sekolah/${schoolId}/keuangan?info=${q(`${made} tagihan dibuat (${viaRoster.length} untuk siswa yang belum bergabung), ${paid} langsung lunas${unmatched.length ? `, ${unmatched.length} baris tidak cocok dengan siswa (dilewati)` : ""}.`)}`);
}

export async function draftMateri(schoolId: string, fileId: string, formData: FormData) {
  const { supabase } = await getSchoolContext(schoolId);
  await requireModule(supabase, schoolId, "data_hub");
  const here = page(schoolId);
  const subjectId = String(formData.get("subject_id") ?? "");
  const grade = Math.min(13, Math.max(0, Number(formData.get("grade")) || 10));
  const maxNodes = Math.min(8, Math.max(1, Number(formData.get("max_nodes")) || 4));
  const [{ data: f }, { data: subj }] = await Promise.all([
    supabase.from("school_files").select("name,mime,path,category,text_content").eq("id", fileId).eq("school_id", schoolId).maybeSingle(),
    supabase.from("school_subjects").select("id,name").eq("school_id", schoolId).eq("id", subjectId).maybeSingle(),
  ]);
  if (!f || !subj) redirect(`${here}?error=${q("Pilih berkas dan mata pelajaran yang valid.")}`);
  if (!["kurikulum", "buku_paket", "lks"].includes(f!.category as string)) redirect(`${here}?error=${q("Draf materi hanya dari berkas kurikulum, buku paket, atau LKS.")}`);
  const ai = await resolveAdminAi(supabase, schoolId);
  if (!ai.run) redirect(`${here}?error=${q(ai.reason ?? "AI belum bisa dipakai.")}`);
  const text = String(f!.text_content ?? "").slice(0, 14000);
  let file: { mime: string; base64: string } | undefined;
  if (text.length < 200) {
    const mime = aiAttachableMime(f!.name as string, f!.mime as string | null);
    const dl = await supabase.storage.from("school-files").download(f!.path as string);
    if (mime && !dl.error && dl.data && dl.data.size <= 8 * 1024 * 1024) file = { mime, base64: Buffer.from(await dl.data.arrayBuffer()).toString("base64") };
    else if (text.length < 40) redirect(`${here}?error=${q("Isi berkas belum terbaca. Analisis ulang berkas dulu.")}`);
  }
  let nodes;
  try {
    const raw = await ai.run!(DRAFT_SYSTEM, draftPrompt({ fileName: f!.name as string, subject: subj!.name as string, grade, maxNodes, text }), file, 16000);
    nodes = sanitizeDraft(parseJsonLoose(raw), maxNodes);
  } catch {
    redirect(`${here}?error=${q("AI gagal menyusun draf. Coba lagi sebentar lagi.")}`);
  }
  if (!nodes || nodes.length === 0) redirect(`${here}?error=${q("AI tidak menghasilkan materi yang layak. Coba berkas lain.")}`);
  const { data: last } = await supabase.from("competency_nodes").select("position").eq("school_id", schoolId).eq("subject_id", subjectId).order("position", { ascending: false }).limit(1).maybeSingle();
  let position = (last?.position as number | undefined) ?? 0, made = 0, qCount = 0;
  const stamp = Date.now().toString(36).slice(-4).toUpperCase();
  for (const n of nodes!) {
    position += 1;
    const { data: node, error } = await supabase.from("competency_nodes").insert({ school_id: schoolId, subject_id: subjectId, grade, code: `AI-${stamp}-${position}`, title: n.title, summary: n.summary || null, position, status: "draft", estimated_minutes: n.minutes }).select("id").single();
    if (error || !node) continue;
    made++;
    await supabase.from("lessons").insert({ school_id: schoolId, node_id: node.id, body_md: n.body_md, objectives: n.objectives });
    let pos = 0;
    for (const qn of n.questions) {
      const { data: row } = await supabase.from("quiz_questions").insert({ school_id: schoolId, node_id: node.id, kind: "mcq", prompt: qn.prompt, options: qn.options, position: ++pos }).select("id").single();
      if (!row) continue;
      const { error: ke } = await supabase.from("quiz_answer_keys").insert({ question_id: row.id, school_id: schoolId, answer: qn.answer, explanation: qn.explanation });
      if (ke) await supabase.from("quiz_questions").delete().eq("id", row.id); else qCount++;
    }
  }
  if (made === 0) redirect(`${here}?error=${q("Draf tidak bisa disimpan. Anda butuh izin menulis materi.")}`);
  revalidatePath(`/dashboard/sekolah/${schoolId}/materi`);
  redirect(`/dashboard/sekolah/${schoolId}/materi?info=${q(`${made} draf materi dan ${qCount} soal dibuat dari berkas. Tinjau dan terbitkan satu per satu.`)}`);
}
