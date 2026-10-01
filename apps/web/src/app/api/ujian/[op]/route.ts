import { NextResponse, type NextRequest } from "next/server";
import { RpcError, anonRpc } from "@/lib/anon-rpc";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// API klien ujian (aplikasi terkunci dan pemutar web). Autentikasi: token sesi ujian (esx_...) di header Authorization;
// khusus 'mulai' memakai kode peluncuran sekali pakai. Semua logika dan hak ada di RPC exam_* pada database.
const OPS: Record<string, { fn: string; build: (b: Record<string, unknown>, token: string) => Record<string, unknown> }> = {
  mulai: { fn: "exam_redeem", build: (b) => ({ p_code: String(b.code ?? ""), p_platform: b.platform ?? null, p_app_version: b.app_version ?? null }) },
  main: { fn: "exam_begin", build: (b, t) => ({ p_token: t, p_lock: typeof b.lock === "object" && b.lock ? b.lock : {} }) },
  simpan: { fn: "exam_save", build: (b, t) => ({ p_token: t, p_question: String(b.question ?? ""), p_answer: b.answer ?? null }) },
  peristiwa: { fn: "exam_event", build: (b, t) => ({ p_token: t, p_kind: String(b.kind ?? "lainnya").slice(0, 40), p_detail: typeof b.detail === "object" && b.detail ? b.detail : {} }) },
  status: { fn: "exam_status", build: (_b, t) => ({ p_token: t }) },
  kumpul: { fn: "exam_submit", build: (_b, t) => ({ p_token: t }) },
};

export async function POST(req: NextRequest, ctx: { params: Promise<{ op: string }> }) {
  const { op } = await ctx.params;
  const spec = OPS[op];
  if (!spec) return NextResponse.json({ error: "operasi tidak dikenal" }, { status: 404 });
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.headers.get("host")) return NextResponse.json({ error: "origin tidak diizinkan" }, { status: 403 });
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  let body: Record<string, unknown> = {};
  try { body = (await req.json()) as Record<string, unknown>; } catch { /* badan kosong */ }
  if (op !== "mulai" && !/^esx_[0-9a-f]{64}$/.test(token)) return NextResponse.json({ error: "token tidak valid" }, { status: 401 });
  try {
    const out = await anonRpc(spec.fn, spec.build(body, token));
    return NextResponse.json(out, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    const err = e as RpcError;
    const status = err.code === "28000" ? 401 : 400;
    return NextResponse.json({ error: err.message?.slice(0, 200) ?? "gagal" }, { status, headers: { "Cache-Control": "no-store" } });
  }
}
