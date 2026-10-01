"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const str = (f: FormData, k: string) => String(f.get(k) ?? "");
const back = (uri: string, params: Record<string, string>) => {
  const u = new URL(uri);
  for (const [k, v] of Object.entries(params)) if (v) u.searchParams.set(k, v);
  return u.toString();
};

export async function decide(formData: FormData) {
  const supabase = await createClient();
  const clientId = str(formData, "client_id"), redirectUri = str(formData, "redirect_uri"), state = str(formData, "state");
  if (str(formData, "decision") !== "approve") redirect(back(redirectUri, { error: "access_denied", state }));
  const { data, error } = await supabase.rpc("oauth_issue_code", { p_client: clientId, p_redirect: redirectUri, p_challenge: str(formData, "code_challenge"), p_can_write: formData.get("can_write") === "on" });
  if (error || !data) redirect(back(redirectUri, { error: "server_error", state }));
  redirect(back(redirectUri, { code: data as string, state }));
}
