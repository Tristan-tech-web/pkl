"use server";

import { randomBytes } from "node:crypto";
import { createHash } from "node:crypto";
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

export type TokenState = { token?: string; error?: string };

export async function createMcpToken(_prev: TokenState, formData: FormData): Promise<TokenState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/masuk");
  const name = str(formData, "name").slice(0, 60);
  if (name.length < 2) return { error: "Beri nama token (mis. Claude di laptop)." };
  const days = Math.min(365, Math.max(1, Number(str(formData, "days")) || 90));
  const canWrite = formData.get("can_write") === "on";
  const token = `esm_${randomBytes(32).toString("base64url")}`;
  const { count } = await supabase.from("mcp_tokens").select("id", { count: "exact", head: true }).eq("user_id", user.id).is("revoked_at", null);
  if ((count ?? 0) >= 10) return { error: "Maksimal 10 token aktif. Cabut yang tidak dipakai." };
  const { error } = await supabase.from("mcp_tokens").insert({
    user_id: user.id, name, token_hash: createHash("sha256").update(token).digest("hex"), token_hint: `…${token.slice(-4)}`,
    can_write: canWrite, expires_at: new Date(Date.now() + days * 86400000).toISOString(),
  });
  if (error) return { error: "Token belum bisa dibuat." };
  revalidatePath(page);
  return { token };
}

export async function revokeMcpToken(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/masuk");
  await supabase.from("mcp_tokens").update({ revoked_at: new Date().toISOString() }).eq("id", id).eq("user_id", user.id);
  revalidatePath(page);
  redirect(`${page}?info=${q("Token dicabut.")}`);
}
