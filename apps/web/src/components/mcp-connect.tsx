"use client";

import { useActionState } from "react";
import { createMcpToken, type TokenState } from "@/app/dashboard/ai-saya/actions";
import { CopyBox } from "@/components/copy-box";
import { Button, Input, Label } from "@/components/ui";

export function McpConnect({ endpoint }: { endpoint: string }) {
  const [state, action, pending] = useActionState<TokenState, FormData>(createMcpToken, {});
  const t = state.token ?? "TOKEN_ANDA";
  const cli = `claude mcp add --transport http edusmart ${endpoint} --header "Authorization: Bearer ${t}"`;
  const json = JSON.stringify({ mcpServers: { edusmart: { type: "http", url: endpoint, headers: { Authorization: `Bearer ${t}` } } } }, null, 2);
  const bridge = JSON.stringify({ mcpServers: { edusmart: { command: "npx", args: ["-y", "mcp-remote", endpoint, "--header", `Authorization:Bearer ${t}`] } } }, null, 2);
  return (
    <div className="space-y-5">
      <form action={action} className="grid gap-3 surface p-4 sm:grid-cols-4">
        <label className="sm:col-span-2"><Label>Nama token</Label><Input name="name" required minLength={2} maxLength={60} placeholder="mis. Claude di laptop" /></label>
        <label><Label>Berlaku (hari)</Label><Input name="days" type="number" min={1} max={365} defaultValue={90} /></label>
        <label className="flex min-h-11 items-center gap-2 self-end"><input type="checkbox" name="can_write" className="size-4" /> Izinkan unggah berkas</label>
        <div className="sm:col-span-4"><Button type="submit" disabled={pending}>{pending ? "Membuat…" : "Buat token"}</Button></div>
      </form>
      {state.error ? <p role="alert" className="rounded-box border border-bad/40 p-3 text-sm text-bad">{state.error}</p> : null}
      {state.token ? (
        <div className="rounded-box border border-ok/50 bg-card p-4" role="status">
          <p className="font-semibold">Token dibuat. Salin sekarang; tidak akan ditampilkan lagi.</p>
          <div className="mt-2"><CopyBox text={state.token} label="Salin token" /></div>
        </div>
      ) : null}
      <div className="space-y-4">
        <div><h3 className="font-semibold">claude.ai dan aplikasi dengan konektor kustom (tanpa token)</h3><CopyBox text={endpoint} label="Salin alamat" note="Tambahkan konektor kustom (Pengaturan > Konektor > Tambah konektor kustom), tempel alamat ini, lalu masuk dan setujui akses. Token tidak diperlukan." /></div>
        <div><h3 className="font-semibold">Claude Code / harness</h3><CopyBox text={cli} label="Salin perintah" /></div>
        <div><h3 className="font-semibold">Aplikasi yang mendukung MCP jarak jauh (Cursor, Cowork, dsb.)</h3><CopyBox text={json} label="Salin konfigurasi" note="Tempel pada pengaturan MCP aplikasi Anda." /></div>
        <div><h3 className="font-semibold">Claude Desktop (lewat penghubung)</h3><CopyBox text={bridge} label="Salin konfigurasi" note="Perlu Node.js; ditempel di claude_desktop_config.json." /></div>
      </div>
    </div>
  );
}
