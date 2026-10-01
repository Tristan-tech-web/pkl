"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { analyzeFile, prepareUpload, registerFile } from "@/app/dashboard/sekolah/[id]/berkas/actions";
import { createBrowserSupabase } from "@/lib/supabase/browser";

type Item = { name: string; state: "menunggu" | "mengunggah" | "memilah" | "selesai" | "gagal"; note?: string };
type Opt = { value: string; label: string };

// Unggah massal: langsung ke Storage lewat tautan bertanda tangan, lalu dicatat dan dipilah AI satu per satu.
export function UploadZone({ schoolId, scope, categories, subjects }: { schoolId: string; scope: "sekolah" | "guru"; categories?: Opt[]; subjects?: Opt[] }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [category, setCategory] = useState(categories?.[0]?.value ?? "belum_dipilah");
  const [subject, setSubject] = useState("");

  const patch = (i: number, p: Partial<Item>) => setItems((cur) => cur.map((it, n) => (n === i ? { ...it, ...p } : it)));

  async function run(files: File[]) {
    if (files.length === 0 || busy) return;
    setBusy(true);
    setItems(files.map((f) => ({ name: f.name, state: "menunggu" })));
    const sb = createBrowserSupabase();
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      try {
        patch(i, { state: "mengunggah" });
        const prep = await prepareUpload(schoolId, scope, f.name, f.size);
        if (!prep.ok) { patch(i, { state: "gagal", note: prep.error }); continue; }
        const up = await sb.storage.from("school-files").uploadToSignedUrl(prep.path, prep.token, f, { contentType: f.type || undefined });
        if (up.error) { patch(i, { state: "gagal", note: "Unggah gagal." }); continue; }
        const reg = await registerFile(schoolId, { path: prep.path, name: f.name, size: f.size, mime: f.type, scope, category: scope === "guru" ? category : undefined, subjectId: subject || null });
        if (!reg.ok) { patch(i, { state: "gagal", note: reg.error }); continue; }
        patch(i, { state: "memilah" });
        const r = await analyzeFile(schoolId, reg.id);
        patch(i, { state: r.ok ? "selesai" : "gagal", note: r.message });
      } catch {
        patch(i, { state: "gagal", note: "Terjadi galat." });
      }
    }
    setBusy(false);
    router.refresh();
  }

  const label: Record<Item["state"], string> = { menunggu: "Menunggu", mengunggah: "Mengunggah…", memilah: "AI memilah…", selesai: "Selesai", gagal: "Gagal" };
  return (
    <div>
      {scope === "guru" ? (
        <div className="mb-3 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-semibold">Jenis berkas
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full rounded-[6px] border border-line bg-card px-3 py-2.5 text-base font-normal">{categories?.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select></label>
          <label className="block text-sm font-semibold">Mata pelajaran
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1 w-full rounded-[6px] border border-line bg-card px-3 py-2.5 text-base font-normal"><option value="">–</option>{subjects?.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select></label>
        </div>
      ) : null}
      <div
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); void run(Array.from(e.dataTransfer.files)); }}
        className={`rounded-[6px] border-2 border-dashed p-8 text-center ${over ? "border-pen bg-pen/10" : "border-line bg-card"}`}
      >
        <p className="font-display text-xl font-bold">Taruh berkas di sini</p>
        <p className="mt-1 text-ink-soft">atau pilih dari perangkat. Boleh banyak sekaligus (xlsx, csv, docx, pdf, gambar; maksimal 50 MB per berkas).</p>
        <button type="button" disabled={busy} onClick={() => input.current?.click()} className="press mt-4 inline-flex min-h-11 items-center rounded-[6px] bg-pen px-5 font-semibold text-on-pen hover:bg-pen-strong disabled:opacity-60">
          {busy ? "Memproses…" : "Pilih berkas"}
        </button>
        <input ref={input} type="file" multiple hidden accept=".pdf,.docx,.xlsx,.csv,.tsv,.txt,.md,.png,.jpg,.jpeg,.webp" onChange={(e) => { void run(Array.from(e.target.files ?? [])); e.target.value = ""; }} aria-label="Pilih berkas untuk diunggah" />
      </div>
      {items.length > 0 ? (
        <ul className="mt-3 space-y-1.5" aria-live="polite">
          {items.map((it, i) => (
            <li key={i} className="flex flex-wrap items-baseline justify-between gap-2 rounded-[6px] border border-line bg-card px-3 py-2">
              <span className="truncate font-semibold">{it.name}</span>
              <span className={`text-sm font-semibold ${it.state === "gagal" ? "text-bad" : it.state === "selesai" ? "text-ok" : "text-ink-soft"}`}>{label[it.state]}{it.note ? ` · ${it.note}` : ""}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
