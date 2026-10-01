import { NextResponse, type NextRequest } from "next/server";
import { CORS, originOf } from "@/lib/origin";

export const dynamic = "force-dynamic";

// RFC 9728: metadata sumber daya terlindungi untuk server MCP.
export function GET(req: NextRequest) {
  const origin = originOf(req.headers);
  return NextResponse.json({ resource: `${origin}/api/mcp`, authorization_servers: [origin], bearer_methods_supported: ["header"], scopes_supported: ["read", "write"], resource_name: "EduSmart" }, { headers: CORS });
}
export function OPTIONS() { return new NextResponse(null, { status: 204, headers: CORS }); }
