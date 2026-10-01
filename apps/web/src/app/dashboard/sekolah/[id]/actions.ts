"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseCsv } from "@/lib/csv";
import { getSchoolContext } from "@/lib/school";

const q = encodeURIComponent;
const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const base = (id: string) => `/dashboard/sekolah/${id}`;

function back(id: string, page: string, kind: "error" | "info", text: string): never {
  redirect(`${base(id)}/${page}?${kind}=${q(text)}`);
}

export async function createAcademicYear(schoolId: string, formData: FormData) {
  const { supabase } = await getSchoolContext(schoolId, { management: true });
  const name = str(formData, "name");
  const start = str(formData, "starts_on");
  const end = str(formData, "ends_on");
  if (!name || !start || !end || end <= start) back(schoolId, "rombel", "error", "Isi nama dan tanggal dengan benar (akhir harus setelah awal).");
  const { data: year, error } = await supabase
    .from("academic_years")
    .insert({ school_id: schoolId, name, starts_on: start, ends_on: end, term_model: "semester" })
    .select("id")
    .single();
  if (error || !year) back(schoolId, "rombel", "error", "Tahun ajaran belum bisa dibuat. Nama mungkin sudah dipakai.");
  const mid = new Date((new Date(start).getTime() + new Date(end).getTime()) / 2).toISOString().slice(0, 10);
  const next = new Date(new Date(mid).getTime() + 86400000).toISOString().slice(0, 10);
  await supabase.from("terms").insert([
    { school_id: schoolId, academic_year_id: year.id, seq: 1, name: "Semester Ganjil", starts_on: start, ends_on: mid },
    { school_id: schoolId, academic_year_id: year.id, seq: 2, name: "Semester Genap", starts_on: next, ends_on: end },
  ]);
  revalidatePath(`${base(schoolId)}/rombel`);
  back(schoolId, "rombel", "info", "Tahun ajaran dibuat.");
}

export async function createClassGroup(schoolId: string, formData: FormData) {
  const { supabase } = await getSchoolContext(schoolId, { management: true });
  const name = str(formData, "name");
  const grade = Number(str(formData, "grade"));
  const programId = str(formData, "program_id");
  const yearId = str(formData, "academic_year_id");
  if (name.length < 1 || !Number.isInteger(grade) || grade < 0 || grade > 13 || !programId || !yearId) {
    back(schoolId, "rombel", "error", "Lengkapi nama, tingkat, program, dan tahun ajaran.");
  }
  const { error } = await supabase
    .from("class_groups")
    .insert({ school_id: schoolId, program_id: programId, academic_year_id: yearId, name, grade });
  if (error) back(schoolId, "rombel", "error", "Rombel belum bisa dibuat. Nama rombel mungkin sudah dipakai di tahun ajaran ini.");
  revalidatePath(`${base(schoolId)}/rombel`);
  back(schoolId, "rombel", "info", `Rombel ${name} dibuat.`);
}

export async function createInvite(schoolId: string, formData: FormData) {
  const { supabase } = await getSchoolContext(schoolId, { management: true });
  const roleId = str(formData, "role_id");
  const classId = str(formData, "class_group_id") || null;
  const maxUses = Math.min(500, Math.max(1, Number(str(formData, "max_uses")) || 1));
  const days = Math.min(90, Math.max(1, Number(str(formData, "days")) || 14));
  if (!roleId) back(schoolId, "anggota", "error", "Pilih peran.");
  const { data, error } = await supabase
    .from("invites")
    .insert({
      school_id: schoolId,
      role_id: roleId,
      class_group_id: classId,
      max_uses: maxUses,
      expires_at: new Date(Date.now() + days * 86400000).toISOString(),
    })
    .select("code")
    .single();
  if (error || !data) back(schoolId, "anggota", "error", "Undangan belum bisa dibuat.");
  revalidatePath(`${base(schoolId)}/anggota`);
  redirect(`${base(schoolId)}/anggota?baru=${q(data.code as string)}`);
}

export async function revokeInvite(schoolId: string, inviteId: string) {
  const { supabase } = await getSchoolContext(schoolId, { management: true });
  await supabase.from("invites").delete().eq("id", inviteId).eq("school_id", schoolId);
  revalidatePath(`${base(schoolId)}/anggota`);
  back(schoolId, "anggota", "info", "Undangan dicabut.");
}

export async function createSubject(schoolId: string, formData: FormData) {
  const { supabase } = await getSchoolContext(schoolId, { management: true });
  const programId = str(formData, "program_id");
  const name = str(formData, "name");
  const code = str(formData, "code").toUpperCase();
  const group = str(formData, "group_code") || "umum";
  const hours = Number(str(formData, "hours_per_week"));
  if (!programId || name.length < 2 || code.length < 1) back(schoolId, "mapel", "error", "Isi program, kode, dan nama mata pelajaran.");
  const { error } = await supabase.from("school_subjects").insert({
    school_id: schoolId,
    program_id: programId,
    code,
    name,
    group_code: group,
    hours_per_week: Number.isFinite(hours) && hours > 0 ? hours : null,
  });
  if (error) back(schoolId, "mapel", "error", "Mata pelajaran belum bisa ditambah. Kode mungkin sudah dipakai di program ini.");
  revalidatePath(`${base(schoolId)}/mapel`);
  back(schoolId, "mapel", "info", `${name} ditambahkan.`);
}

export async function assignTeaching(schoolId: string, formData: FormData) {
  const { supabase } = await getSchoolContext(schoolId, { management: true });
  const classId = str(formData, "class_group_id");
  const subjectId = str(formData, "school_subject_id");
  const teacherId = str(formData, "teacher_member_id");
  const hours = Number(str(formData, "hours_per_week"));
  if (!classId || !subjectId || !teacherId) back(schoolId, "mapel", "error", "Pilih rombel, mata pelajaran, dan guru.");
  const { error } = await supabase.from("teaching_assignments").insert({
    school_id: schoolId,
    class_group_id: classId,
    school_subject_id: subjectId,
    teacher_member_id: teacherId,
    hours_per_week: Number.isFinite(hours) && hours > 0 ? hours : null,
  });
  if (error) back(schoolId, "mapel", "error", "Penugasan belum bisa dibuat. Mungkin sudah ada.");
  revalidatePath(`${base(schoolId)}/mapel`);
  back(schoolId, "mapel", "info", "Penugasan mengajar disimpan.");
}

export async function removeAssignment(schoolId: string, assignmentId: string) {
  const { supabase } = await getSchoolContext(schoolId, { management: true });
  await supabase.from("teaching_assignments").delete().eq("id", assignmentId).eq("school_id", schoolId);
  revalidatePath(`${base(schoolId)}/mapel`);
  back(schoolId, "mapel", "info", "Penugasan dihapus.");
}

const ROLE_ALIAS: Record<string, string> = { siswa: "student", murid: "student", student: "student", guru: "teacher", teacher: "teacher", "wali kelas": "homeroom", homeroom: "homeroom", "orang tua": "parent", ortu: "parent", wali: "parent", parent: "parent", bk: "counselor", konselor: "counselor", admin: "admin", "tata usaha": "admin" };

// Impor CSV: nama[,peran[,kelas]] -> satu kode undangan sekali pakai per baris, dengan nama dan rombel sudah terisi.
export async function importInvites(schoolId: string, formData: FormData) {
  const { supabase } = await getSchoolContext(schoolId, { management: true });
  const page = `${base(schoolId)}/anggota/impor`;
  const days = Math.min(90, Math.max(1, Number(str(formData, "days")) || 30));
  const defaultRole = str(formData, "default_role") || "student";
  let text = str(formData, "csv");
  const file = formData.get("file");
  if (file instanceof File && file.size > 0) {
    if (file.size > 200_000) redirect(`${page}?error=${q("Berkas terlalu besar (maksimal 200 KB).")}`);
    text = await file.text();
  }
  const rows = parseCsv(text);
  if (rows.length === 0) redirect(`${page}?error=${q("Tempel isi CSV atau pilih berkas.")}`);
  const header = rows[0].map((h) => h.toLowerCase());
  const hasHeader = header.includes("nama");
  const idx = (names: string[]) => header.findIndex((h) => names.includes(h));
  const iName = hasHeader ? idx(["nama", "name"]) : 0;
  const iRole = hasHeader ? idx(["peran", "role"]) : 1;
  const iClass = hasHeader ? idx(["kelas", "rombel", "class"]) : 2;
  const body = hasHeader ? rows.slice(1) : rows;
  if (body.length === 0 || body.length > 300) redirect(`${page}?error=${q("Jumlah baris harus 1 sampai 300.")}`);

  const [{ data: roles }, { data: classes }] = await Promise.all([
    supabase.from("roles").select("id,code").eq("school_id", schoolId).neq("code", "owner"),
    supabase.from("class_groups").select("id,name").eq("school_id", schoolId),
  ]);
  const roleId = new Map((roles ?? []).map((r) => [r.code as string, r.id as string]));
  const classId = new Map((classes ?? []).map((c) => [String(c.name).toLowerCase(), c.id as string]));
  const problems: string[] = [];
  const out: { school_id: string; role_id: string; class_group_id: string | null; max_uses: number; expires_at: string; label: string }[] = [];
  body.forEach((r, n) => {
    const line = n + (hasHeader ? 2 : 1);
    const name = (r[iName] ?? "").trim();
    const roleCode = ROLE_ALIAS[(iRole >= 0 ? r[iRole] ?? "" : "").trim().toLowerCase()] ?? (iRole >= 0 && (r[iRole] ?? "").trim() ? null : defaultRole);
    const cls = iClass >= 0 ? (r[iClass] ?? "").trim() : "";
    if (name.length < 2 || name.length > 120) return void problems.push(`baris ${line}: nama tidak valid`);
    if (!roleCode || !roleId.has(roleCode)) return void problems.push(`baris ${line}: peran tidak dikenal`);
    if (cls && !classId.has(cls.toLowerCase())) return void problems.push(`baris ${line}: rombel "${cls}" tidak ada`);
    out.push({ school_id: schoolId, role_id: roleId.get(roleCode)!, class_group_id: cls ? classId.get(cls.toLowerCase())! : null, max_uses: 1, expires_at: new Date(Date.now() + days * 86400000).toISOString(), label: name });
  });
  if (problems.length > 0) redirect(`${page}?error=${q(`Impor dibatalkan. ${problems.slice(0, 5).join("; ")}${problems.length > 5 ? `; dan ${problems.length - 5} lainnya` : ""}.`)}`);
  const { error } = await supabase.from("invites").insert(out);
  if (error) redirect(`${page}?error=${q("Kode undangan belum bisa dibuat.")}`);
  revalidatePath(`${base(schoolId)}/anggota`);
  redirect(`${page}/kartu?n=${out.length}`);
}
