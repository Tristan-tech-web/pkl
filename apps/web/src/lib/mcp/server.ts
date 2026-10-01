import { TOOLS, type ToolCtx } from "./tools";

export const PROTOCOLS = ["2025-06-18", "2025-03-26", "2024-11-05"];
const INSTRUCTIONS =
  "EduSmart: platform sekolah. Gunakan siapa_saya untuk mengetahui sekolah dan peran pengguna, hari_ini untuk ringkasan hari ini, cari_peraturan untuk aturan sekolah, dan daftar_berkas/baca_berkas/minta_unggah/selesai_unggah untuk Pusat Data (pengelola dan guru). Semua hak akses mengikuti peran pengguna; jangan mencoba melewatinya.";

type Msg = { jsonrpc: "2.0"; id?: string | number | null; method?: string; params?: Record<string, unknown> };
const ok = (id: Msg["id"], result: unknown) => ({ jsonrpc: "2.0", id, result });
const err = (id: Msg["id"], code: number, message: string) => ({ jsonrpc: "2.0", id, error: { code, message } });

export function toolList() {
  return TOOLS.map((t) => ({
    name: t.name, title: t.title, description: t.description,
    inputSchema: { type: "object", properties: t.properties, ...(t.required ? { required: t.required } : {}) },
    annotations: { readOnlyHint: t.readOnly, destructiveHint: false, openWorldHint: false },
  }));
}

// Mengembalikan null untuk notifikasi (tanpa id).
export async function handleMessage(msg: Msg, ctx: ToolCtx): Promise<unknown | null> {
  if (msg.jsonrpc !== "2.0" || typeof msg.method !== "string") return err(msg.id ?? null, -32600, "Permintaan tidak valid");
  if (msg.id === undefined) return null;
  switch (msg.method) {
    case "initialize": {
      const asked = String((msg.params as { protocolVersion?: string } | undefined)?.protocolVersion ?? "");
      return ok(msg.id, { protocolVersion: PROTOCOLS.includes(asked) ? asked : PROTOCOLS[0], capabilities: { tools: { listChanged: false } }, serverInfo: { name: "edusmart", title: "EduSmart", version: "1.0.0" }, instructions: INSTRUCTIONS });
    }
    case "ping": return ok(msg.id, {});
    case "tools/list": return ok(msg.id, { tools: toolList() });
    case "tools/call": {
      const p = (msg.params ?? {}) as { name?: string; arguments?: Record<string, unknown> };
      const tool = TOOLS.find((t) => t.name === p.name);
      if (!tool) return err(msg.id, -32602, `Alat tidak dikenal: ${String(p.name)}`);
      try {
        const out = await tool.run(p.arguments ?? {}, ctx);
        return ok(msg.id, { content: [{ type: "text", text: JSON.stringify(out, null, 2) }] });
      } catch (e) {
        const m = e instanceof Error ? e.message : "gagal";
        return ok(msg.id, { isError: true, content: [{ type: "text", text: m.slice(0, 500) }] });
      }
    }
    default: return err(msg.id, -32601, `Metode tidak dikenal: ${msg.method}`);
  }
}
