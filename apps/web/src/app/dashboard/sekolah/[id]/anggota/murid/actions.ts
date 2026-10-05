"use server";

import { redirect } from "next/navigation";
import { accountsToCsv, parseStudentRows } from "@/lib/student-rows";
import { createClient } from "@/lib/supabase/server";

const q = encodeURIComponent;
export type CreatedRow = { name: string; login_id: string | null; password: string | null; status: string };
export type CreateState = { error?: string; rows?: CreatedRow[]; csv?: string; skipped?: number } | null;
export type ResetState = { error?: string; password?: string } | null;

export async function setLoginCode(schoolId: string, formData: FormData) {
  const code = String(formData.get("login_code") ?? "").trim().toLowerCase();
  const back = `/dashboard/sekolah/${schoolId}/anggota/murid`;
  if (!/^[a-z0-9]{2,12}$/.test(code)) redirect(`${back}?error=${q("Kode sekolah 2 sampai 12 huruf kecil atau angka, tanpa spasi.")}`);
  const supabase = await createClient();
  const { error } = await supabase.from("schools").update({ login_code: code }).eq("id", schoolId);
  if (error) redirect(`${back}?error=${q(error.code === "23505" ? "Kode itu sudah dipakai sekolah lain. Coba yang lain." : "Kode belum bisa disimpan. Anda mungkin bukan pengelola sekolah.")}`);
  redirect(`${back}?info=${q("Kode sekolah tersimpan.")}`);
}

export async function createStudents(schoolId: string, _prev: CreateState, formData: FormData): Promise<CreateState> {
  const { rows, skipped } = parseStudentRows(String(formData.get("list") ?? ""));
  if (rows.length === 0) return { error: "Belum ada nama yang terbaca. Tulis satu murid per baris." };
  const classId = String(formData.get("class_group_id") ?? "") || null;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_student_accounts", { p_school_id: schoolId, p_class_id: classId, p_rows: rows });
  if (error) {
    const msg = error.message || "";
    if (/kode sekolah/i.test(msg)) return { error: "Atur kode sekolah dulu di bagian atas halaman ini." };
    if (/tidak berhak/i.test(msg)) return { error: "Hanya pengelola sekolah yang bisa membuat akun murid." };
    if (/does not exist|schema cache|PGRST202/i.test(msg)) return { error: "Fitur ini belum aktif di database. Minta admin teknis menjalankan migrasi akun murid." };
    return { error: "Akun belum bisa dibuat. Coba lagi, atau kurangi jumlah barisnya." };
  }
  const out = (data ?? []) as CreatedRow[];
  return { rows: out, csv: accountsToCsv(out), skipped };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function resetStudentPassword(memberId: string, _prev: ResetState): Promise<ResetState> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("reset_student_password", { p_member_id: memberId });
  if (error) {
    if (/email sendiri/i.test(error.message)) return { error: "Murid ini memakai email sendiri. Minta ia memakai lupa kata sandi." };
    if (/tidak berhak/i.test(error.message)) return { error: "Anda tidak berhak mengganti kata sandi murid ini." };
    return { error: "Kata sandi belum bisa diganti." };
  }
  return { password: String(data) };
}
