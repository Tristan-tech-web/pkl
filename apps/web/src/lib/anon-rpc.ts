import { readPublicEnv } from "@/lib/env";

// Memanggil RPC Supabase sebagai anon (tanpa cookie). Dipakai klien dengan token sendiri (ujian, MCP).
export class RpcError extends Error {
  constructor(message: string, public code?: string) { super(message); }
}
export async function anonRpc(fn: string, params: Record<string, unknown>): Promise<unknown> {
  const { supabaseUrl, supabasePublishableKey } = readPublicEnv();
  const r = await fetch(`${supabaseUrl}/rest/v1/rpc/${fn}`, {
    method: "POST", cache: "no-store", signal: AbortSignal.timeout(20000),
    headers: { apikey: supabasePublishableKey, Authorization: `Bearer ${supabasePublishableKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const body = (await r.json().catch(() => null)) as { message?: string; code?: string } | unknown;
  if (!r.ok) throw new RpcError((body as { message?: string } | null)?.message ?? "gagal", (body as { code?: string } | null)?.code);
  return body;
}
