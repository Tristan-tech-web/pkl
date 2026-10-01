"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
