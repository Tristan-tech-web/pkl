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
