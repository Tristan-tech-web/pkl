"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireModule } from "@/lib/modules";
import { getSchoolContext } from "@/lib/school";

const q = encodeURIComponent;
const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const or = (v: string) => (v === "" ? null : v);

export async function saveProfile(schoolId: string, memberId: string, formData: FormData) {
  const { supabase } = await getSchoolContext(schoolId, { management: true });
  await requireModule(supabase, schoolId, "admin_records");
  const page = `/dashboard/sekolah/${schoolId}/administrasi/${memberId}`;
  const nisn = str(formData, "nisn");
  const gender = str(formData, "gender");
  const birth = str(formData, "birth_date");
  if (nisn && !/^[0-9]{10}$/.test(nisn)) redirect(`${page}?error=${q("NISN harus 10 digit angka.")}`);
  if (gender && !["L", "P"].includes(gender)) redirect(`${page}?error=${q("Jenis kelamin tidak valid.")}`);
  if (birth && !/^\d{4}-\d{2}-\d{2}$/.test(birth)) redirect(`${page}?error=${q("Tanggal lahir tidak valid.")}`);
  const { error } = await supabase.from("member_profiles").upsert({
    member_id: memberId, school_id: schoolId, nis: or(str(formData, "nis")), nisn: or(nisn), nip: or(str(formData, "nip")), gender: or(gender),
    birth_place: or(str(formData, "birth_place")), birth_date: or(birth), address: or(str(formData, "address")), phone: or(str(formData, "phone")),
    guardian_name: or(str(formData, "guardian_name")), guardian_phone: or(str(formData, "guardian_phone")), updated_at: new Date().toISOString(),
  });
  if (error) redirect(`${page}?error=${q(error.code === "23505" ? "NIS atau NISN sudah dipakai anggota lain." : "Data belum bisa disimpan.")}`);
  revalidatePath(`/dashboard/sekolah/${schoolId}/administrasi`);
  redirect(`${page}?info=${q("Data tersimpan.")}`);
}

const fill = (body: string, v: Record<string, string>) => body.replace(/\{\{(\w+)\}\}/g, (_, k: string) => v[k] ?? "______");

export async function issueLetter(schoolId: string, formData: FormData) {
  const { supabase, me, school } = await getSchoolContext(schoolId, { management: true });
  await requireModule(supabase, schoolId, "admin_records");
  const page = `/dashboard/sekolah/${schoolId}/administrasi/surat`;
  const templateId = str(formData, "template_id");
  const memberId = str(formData, "member_id");
  const [{ data: tpl }, { data: member }, { data: prof }, { data: enr }] = await Promise.all([
    supabase.from("letter_templates").select("code,title,body").eq("id", templateId).maybeSingle(),
    supabase.from("school_members").select("display_name").eq("id", memberId).eq("school_id", schoolId).maybeSingle(),
    supabase.from("member_profiles").select("nis").eq("member_id", memberId).maybeSingle(),
    supabase.from("class_group_students").select("class_groups(name)").eq("member_id", memberId).limit(1).maybeSingle(),
  ]);
  if (!tpl || !member) redirect(`${page}?error=${q("Pilih templat dan siswa.")}`);
  const cg = (enr?.class_groups ?? null) as { name: string } | { name: string }[] | null;
  const className = Array.isArray(cg) ? cg[0]?.name : cg?.name;
  const now = new Date();
  const year = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Jakarta", year: "numeric" }).format(now);
  const date = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "long" }).format(now);
  const { count } = await supabase.from("letters").select("id", { count: "exact", head: true }).eq("school_id", schoolId).gte("issued_on", `${year}-01-01`);
  const code = String(tpl!.code).toUpperCase().slice(0, 8);
  const number = `${String((count ?? 0) + 1).padStart(3, "0")}/${code}/${year}`;
  const body = fill(String(tpl!.body), { sekolah: school.name, nama: member!.display_name ?? "", nis: (prof?.nis as string | null) ?? "______", kelas: className ?? "______", tanggal: date });
  const { data, error } = await supabase.from("letters").insert({ school_id: schoolId, number, title: tpl!.title, body, member_id: memberId, issued_by: me.memberId }).select("id").single();
  if (error || !data) redirect(`${page}?error=${q("Surat belum bisa diterbitkan. Coba lagi.")}`);
  revalidatePath(page);
  redirect(`${page}/${data!.id}`);
}

export async function deleteLetter(schoolId: string, letterId: string) {
  const { supabase } = await getSchoolContext(schoolId, { management: true });
  await supabase.from("letters").delete().eq("id", letterId).eq("school_id", schoolId);
  revalidatePath(`/dashboard/sekolah/${schoolId}/administrasi/surat`);
  redirect(`/dashboard/sekolah/${schoolId}/administrasi/surat?info=${q("Surat dihapus dari arsip.")}`);
}

export async function linkGuardian(schoolId: string, studentId: string, formData: FormData) {
  const { supabase } = await getSchoolContext(schoolId, { management: true });
  await requireModule(supabase, schoolId, "parent_portal");
  const page = `/dashboard/sekolah/${schoolId}/administrasi/${studentId}`;
  const parentId = str(formData, "parent_id");
  const relation = str(formData, "relation");
  if (!parentId || !["ayah", "ibu", "wali"].includes(relation)) redirect(`${page}?error=${q("Pilih akun orang tua dan hubungan.")}`);
  const { error } = await supabase.from("guardianships").upsert({ school_id: schoolId, parent_member_id: parentId, student_member_id: studentId, relation });
  if (error) redirect(`${page}?error=${q("Belum bisa menghubungkan.")}`);
  revalidatePath(page);
  redirect(`${page}?info=${q("Orang tua terhubung.")}`);
}

export async function unlinkGuardian(schoolId: string, studentId: string, parentId: string) {
  const { supabase } = await getSchoolContext(schoolId, { management: true });
  await supabase.from("guardianships").delete().eq("parent_member_id", parentId).eq("student_member_id", studentId).eq("school_id", schoolId);
  revalidatePath(`/dashboard/sekolah/${schoolId}/administrasi/${studentId}`);
  redirect(`/dashboard/sekolah/${schoolId}/administrasi/${studentId}?info=${q("Hubungan dilepas.")}`);
}

const slug = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 30) || "surat";

export async function saveTemplate(schoolId: string, formData: FormData) {
  const { supabase } = await getSchoolContext(schoolId, { management: true });
  await requireModule(supabase, schoolId, "admin_records");
  const page = `/dashboard/sekolah/${schoolId}/administrasi/surat/templat`;
  const id = str(formData, "id");
  const title = str(formData, "title");
  const body = String(formData.get("body") ?? "").trim();
  if (title.length < 3 || body.length < 10) redirect(`${page}?error=${q("Judul minimal 3 huruf dan isi minimal 10 huruf.")}`);
  const res = id
    ? await supabase.from("letter_templates").update({ title, body }).eq("id", id).eq("school_id", schoolId)
    : await supabase.from("letter_templates").insert({ school_id: schoolId, code: `${slug(title)}_${Math.random().toString(36).slice(2, 6)}`, title, body });
  if (res.error) redirect(`${page}?error=${q("Templat belum bisa disimpan.")}`);
  revalidatePath(page);
  redirect(`${page}?info=${q("Templat tersimpan.")}`);
}

export async function deleteTemplate(schoolId: string, id: string) {
  const { supabase } = await getSchoolContext(schoolId, { management: true });
  await supabase.from("letter_templates").delete().eq("id", id).eq("school_id", schoolId);
  revalidatePath(`/dashboard/sekolah/${schoolId}/administrasi/surat/templat`);
  redirect(`/dashboard/sekolah/${schoolId}/administrasi/surat/templat?info=${q("Templat dihapus.")}`);
}

export async function createRosterInvite(schoolId: string, rosterId: string) {
  const { supabase } = await getSchoolContext(schoolId, { management: true });
  const page = `/dashboard/sekolah/${schoolId}/administrasi/roster`;
  const { data: p } = await supabase.from("roster_people").select("id,kind,full_name,class_name,member_id").eq("id", rosterId).eq("school_id", schoolId).maybeSingle();
  if (!p || p.member_id) redirect(`${page}?error=${q("Orang ini sudah bergabung atau tidak ditemukan.")}`);
  const code = { siswa: "student", guru: "teacher", staf: "admin", orang_tua: "parent" }[p!.kind as string] ?? "student";
  const [{ data: role }, { data: cls }] = await Promise.all([
    supabase.from("roles").select("id").eq("school_id", schoolId).eq("code", code).maybeSingle(),
    p!.class_name ? supabase.from("class_groups").select("id").eq("school_id", schoolId).ilike("name", p!.class_name as string).maybeSingle() : Promise.resolve({ data: null }),
  ]);
  if (!role) redirect(`${page}?error=${q("Peran tidak ditemukan.")}`);
  const { data: inv, error } = await supabase.from("invites").insert({
    school_id: schoolId, role_id: role!.id, class_group_id: (cls as { id: string } | null)?.id ?? null, max_uses: 1,
    expires_at: new Date(Date.now() + 60 * 86400000).toISOString(), label: p!.full_name, roster_id: p!.id,
  }).select("code").single();
  if (error || !inv) redirect(`${page}?error=${q("Kode belum bisa dibuat.")}`);
  revalidatePath(page);
  redirect(`${page}?info=${q(`Kode untuk ${p!.full_name}: ${inv!.code}`)}`);
}

export async function deleteRoster(schoolId: string, rosterId: string) {
  const { supabase } = await getSchoolContext(schoolId, { management: true });
  await supabase.from("roster_people").delete().eq("id", rosterId).eq("school_id", schoolId);
  revalidatePath(`/dashboard/sekolah/${schoolId}/administrasi/roster`);
  redirect(`/dashboard/sekolah/${schoolId}/administrasi/roster?info=${q("Data dihapus dari roster.")}`);
}
