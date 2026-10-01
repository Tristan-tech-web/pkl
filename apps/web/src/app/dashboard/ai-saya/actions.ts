"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DEFAULT_MODELS, generateReply, type Provider } from "@/lib/ai";
import { encryptSecret, keyHint } from "@/lib/crypto";
import { createClient } from "@/lib/supabase/server";

const q = encodeURIComponent;
const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const page = "/dashboard/ai-saya";

export async function saveMyAiKey(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/masuk");
  const provider = (str(formData, "provider") === "anthropic" ? "anthropic" : "gemini") as Provider;
  const model = str(formData, "model") || DEFAULT_MODELS[provider];
  const key = str(formData, "api_key");
  if (!/^[A-Za-z0-9._-]{3,80}$/.test(model)) redirect(`${page}?error=${q("Nama model tidak valid.")}`);
  const { data: existing } = await supabase.from("user_ai_keys").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!key && !existing) redirect(`${page}?error=${q("Isi kunci API.")}`);
  if (key) {
    if (key.length < 20) redirect(`${page}?error=${q("Kunci API terlalu pendek.")}`);
    try {
      await generateReply({ provider, model, apiKey: key, system: "Jawab singkat.", messages: [{ role: "user", content: "Balas dengan kata: siap" }] });
    } catch {
      redirect(`${page}?error=${q("Kunci tidak bisa dipakai. Periksa kunci, model, dan kuota akunmu.")}`);
    }
    const { error } = await supabase.from("user_ai_keys").upsert({ user_id: user.id, provider, model, key_ciphertext: encryptSecret(key), key_hint: keyHint(key), updated_at: new Date().toISOString() });
    if (error) redirect(`${page}?error=${q("Kunci belum bisa disimpan.")}`);
  } else {
    const { error } = await supabase.from("user_ai_keys").update({ provider, model, updated_at: new Date().toISOString() }).eq("user_id", user.id);
    if (error) redirect(`${page}?error=${q("Pengaturan belum bisa disimpan.")}`);
  }
  revalidatePath(page);
  redirect(`${page}?info=${q("Tersimpan. AI di semua sekolahmu sekarang memakai kuncimu.")}`);
}

export async function removeMyAiKey() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/masuk");
  await supabase.from("user_ai_keys").delete().eq("user_id", user.id);
  revalidatePath(page);
  redirect(`${page}?info=${q("Kunci dihapus.")}`);
}
