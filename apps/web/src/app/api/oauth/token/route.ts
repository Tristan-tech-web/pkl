import { NextResponse, type NextRequest } from "next/server";
import { anonRpc } from "@/lib/anon-rpc";
import { CORS } from "@/lib/origin";

export const dynamic = "force-dynamic";

// Titik token OAuth: hanya grant authorization_code dengan PKCE. Hasilnya token MCP (esm_...).
export async function POST(req: NextRequest) {
  const ct = req.headers.get("content-type") ?? "";
  let p: Record<string, string> = {};
  try {
    if (ct.includes("application/json")) p = (await req.json()) as Record<string, string>;
    else p = Object.fromEntries(new URLSearchParams(await req.text()));
  } catch { /* kosong */ }
  if (p.grant_type !== "authorization_code") return NextResponse.json({ error: "unsupported_grant_type" }, { status: 400, headers: CORS });
  try {
    const r = (await anonRpc("oauth_exchange", { p_code: p.code ?? "", p_client: p.client_id ?? "", p_redirect: p.redirect_uri ?? "", p_verifier: p.code_verifier ?? "" })) as { error?: string };
    if (r.error) return NextResponse.json({ error: r.error }, { status: 400, headers: CORS });
    return NextResponse.json(r, { headers: CORS });
  } catch {
    return NextResponse.json({ error: "invalid_grant" }, { status: 400, headers: CORS });
  }
}
export function OPTIONS() { return new NextResponse(null, { status: 204, headers: CORS }); }
