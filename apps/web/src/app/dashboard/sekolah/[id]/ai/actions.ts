"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DEFAULT_MODELS, generateReply, type Provider } from "@/lib/ai";
import { encryptSecret, keyHint } from "@/lib/crypto";
import { getSchoolContext } from "@/lib/school";

const q = encodeURIComponent;
const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export async function saveAiSettings(schoolId: string, formData: FormData) {
  const { supabase } = await getSchoolContext(schoolId, { management: true });
  const page = `/dashboard/sekolah/${schoolId}/ai`;
  const provider = (str(formData, "provider") === "anthropic" ? "anthropic" : "gemini") as Provider;
  const model = str(formData, "model") || DEFAULT_MODELS[provider];
  const key = str(formData, "api_key");
  const limit = Math.min(200, Math.max(1, Number(str(formData, "daily_limit")) || 20));
  if (!/^[A-Za-z0-9._-]{3,80}$/.test(model)) redirect(`${page}?error=${q("Nama model tidak valid.")}`);
  const { data: existing } = await supabase.from("school_ai_settings").select("school_id").eq("school_id", schoolId).maybeSingle();
  if (!key && !existing) redirect(`${page}?error=${q("Isi kunci API.")}`);
  if (key) {
    if (key.length < 20) redirect(`${page}?error=${q("Kunci API terlalu pendek.")}`);
    // Uji kunci sebelum disimpan, tanpa data siswa.
    try {
      await generateReply({ provider, model, apiKey: key, system: "Jawab singkat.", messages: [{ role: "user", content: "Balas dengan kata: siap" }] });
    } catch {
      redirect(`${page}?error=${q("Kunci tidak bisa dipakai. Periksa kunci, model, dan kuota akunmu.")}`);
    }
    const { error } = await supabase.from("school_ai_settings").upsert({
      school_id: schoolId, provider, model, key_ciphertext: encryptSecret(key), key_hint: keyHint(key), daily_limit_per_student: limit, updated_at: new Date().toISOString(),
    });
    if (error) redirect(`${page}?error=${q("Pengaturan belum bisa disimpan.")}`);
  } else {
    const { error } = await supabase.from("school_ai_settings").update({ provider, model, daily_limit_per_student: limit, updated_at: new Date().toISOString() }).eq("school_id", schoolId);
    if (error) redirect(`${page}?error=${q("Pengaturan belum bisa disimpan.")}`);
  }
  revalidatePath(page);
  redirect(`${page}?info=${q("Tersimpan. Tutor AI aktif untuk siswa.")}`);
}

export async function removeAiSettings(schoolId: string) {
  const { supabase } = await getSchoolContext(schoolId, { management: true });
  await supabase.from("school_ai_settings").delete().eq("school_id", schoolId);
  revalidatePath(`/dashboard/sekolah/${schoolId}/ai`);
  redirect(`/dashboard/sekolah/${schoolId}/ai?info=${q("Kunci dihapus. Tutor AI nonaktif.")}`);
}
