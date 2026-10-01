"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const q = encodeURIComponent;

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) redirect(`/masuk?error=${q("Isi email dan kata sandi.")}`);
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/masuk?error=${q("Email atau kata sandi salah.")}`);
  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (fullName.length < 2) redirect(`/daftar?error=${q("Isi nama lengkap Anda.")}`);
  if (!email.includes("@")) redirect(`/daftar?error=${q("Email tidak valid.")}`);
  if (password.length < 8) redirect(`/daftar?error=${q("Kata sandi minimal 8 karakter.")}`);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) {
    const known = /already|registered/i.test(error.message);
    redirect(`/daftar?error=${q(known ? "Email sudah terdaftar. Silakan masuk." : "Pendaftaran gagal. Coba lagi.")}`);
  }
  if (data.session) redirect("/dashboard");
  redirect(`/masuk?info=${q("Cek email Anda untuk konfirmasi, lalu masuk.")}`);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
