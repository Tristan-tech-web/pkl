import { NextResponse, type NextRequest } from "next/server";
import { CORS, originOf } from "@/lib/origin";

export const dynamic = "force-dynamic";

// RFC 8414: metadata server otorisasi (kode otorisasi + PKCE S256, klien publik, pendaftaran dinamis).
export function GET(req: NextRequest) {
  const o = originOf(req.headers);
  return NextResponse.json({
    issuer: o, authorization_endpoint: `${o}/oauth/authorize`, token_endpoint: `${o}/api/oauth/token`, registration_endpoint: `${o}/api/oauth/register`,
    response_types_supported: ["code"], grant_types_supported: ["authorization_code"], code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["none"], scopes_supported: ["read", "write"],
  }, { headers: CORS });
}
export function OPTIONS() { return new NextResponse(null, { status: 204, headers: CORS }); }
