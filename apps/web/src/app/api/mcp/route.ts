import { NextResponse, type NextRequest } from "next/server";
import { readPublicEnv } from "@/lib/env";
import { handleMessage } from "@/lib/mcp/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };
const unauthorized = () =>
  NextResponse.json({ jsonrpc: "2.0", id: null, error: { code: -32001, message: "Token tidak valid. Buat token di EduSmart > AI saya > Sambungkan AI." } }, { status: 401, headers: { ...noStore, "WWW-Authenticate": 'Bearer realm="EduSmart"' } });

// MCP Streamable HTTP (mode JSON). Autentikasi: Authorization: Bearer esm_...
export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.headers.get("host")) return NextResponse.json({ error: "Origin tidak diizinkan" }, { status: 403 });
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!/^esm_[A-Za-z0-9_-]{40,}$/.test(token)) return unauthorized();
  const { supabaseUrl, supabasePublishableKey } = readPublicEnv();

  const rpc = async (fn: string, params: Record<string, unknown>) => {
    const r = await fetch(`${supabaseUrl}/rest/v1/rpc/${fn}`, {
      method: "POST", cache: "no-store", signal: AbortSignal.timeout(20000),
      headers: { apikey: supabasePublishableKey, Authorization: `Bearer ${supabasePublishableKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const body = (await r.json().catch(() => null)) as { message?: string; code?: string } | unknown;
    if (!r.ok) {
      const m = (body as { message?: string } | null)?.message ?? "gagal";
      throw new Error((body as { code?: string } | null)?.code === "28000" ? "TOKEN" : m);
    }
    return body;
  };
  const ctx = { rpc, token, supabaseUrl, anonKey: supabasePublishableKey };

  let payload: unknown;
  try { payload = await req.json(); } catch { return NextResponse.json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "JSON tidak valid" } }, { status: 400 }); }
  const batch = Array.isArray(payload) ? payload : [payload];
  try {
    // Token diperiksa sekali di awal agar pemanggil dapat 401 yang jelas.
    await rpc("mcp_whoami", { p_token: token });
  } catch (e) {
    if (e instanceof Error && e.message === "TOKEN") return unauthorized();
  }
  const out: unknown[] = [];
  for (const m of batch.slice(0, 20)) {
    const r = await handleMessage(m as never, ctx);
    if (r !== null) out.push(r);
  }
  if (out.length === 0) return new NextResponse(null, { status: 202, headers: noStore });
  return NextResponse.json(Array.isArray(payload) ? out : out[0], { headers: noStore });
}

export function GET() {
  return new NextResponse("EduSmart MCP: gunakan POST (Streamable HTTP).", { status: 405, headers: { Allow: "POST", ...noStore } });
}
export function DELETE() {
  return new NextResponse(null, { status: 405, headers: { Allow: "POST" } });
}
