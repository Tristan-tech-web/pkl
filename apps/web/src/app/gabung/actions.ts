"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function redeemInvite(formData: FormData) {
  const code = String(formData.get("code") ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  const name = String(formData.get("display_name") ?? "").trim();
  const back = (msg: string) => redirect(`/gabung?kode=${encodeURIComponent(code)}&error=${encodeURIComponent(msg)}`);
  if (code.length !== 8) back("Kode terdiri dari 8 huruf dan angka.");
  if (name.length < 2) back("Isi nama Anda.");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("redeem_invite", { p_code: code, p_display_name: name });
  if (error || !data) {
    back(/sudah menjadi anggota/i.test(error?.message ?? "") ? "Anda sudah menjadi anggota sekolah ini." : "Kode tidak valid atau sudah tidak berlaku.");
  }
  redirect(`/dashboard/sekolah/${data}`);
}
