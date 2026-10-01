import { NextResponse, type NextRequest } from "next/server";
import { RpcError, anonRpc } from "@/lib/anon-rpc";
import { CORS } from "@/lib/origin";

export const dynamic = "force-dynamic";

// RFC 7591: pendaftaran klien dinamis (klien publik + PKCE).
export async function POST(req: NextRequest) {
  let body: { client_name?: unknown; redirect_uris?: unknown } = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: "invalid_client_metadata" }, { status: 400, headers: CORS }); }
  const uris = Array.isArray(body.redirect_uris) ? body.redirect_uris.filter((u): u is string => typeof u === "string") : [];
  try {
    const c = (await anonRpc("oauth_register", { p_name: typeof body.client_name === "string" ? body.client_name : "Aplikasi AI", p_redirects: uris })) as { client_id: string; client_name: string; redirect_uris: string[] };
    return NextResponse.json({ ...c, token_endpoint_auth_method: "none", grant_types: ["authorization_code"], response_types: ["code"] }, { status: 201, headers: CORS });
  } catch (e) {
    return NextResponse.json({ error: "invalid_redirect_uri", error_description: (e as RpcError).message.slice(0, 160) }, { status: 400, headers: CORS });
  }
}
export function OPTIONS() { return new NextResponse(null, { status: 204, headers: CORS }); }
