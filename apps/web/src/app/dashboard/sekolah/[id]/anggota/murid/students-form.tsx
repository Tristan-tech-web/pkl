"use client";

import { useActionState } from "react";
import { CopyButton } from "@/components/copy-button";
import { PrintButton } from "@/components/print-button";
import { Button, ErrorNote, Label, Select, Textarea } from "@/components/ui";
import { createStudents, type CreateState } from "./actions";

export function StudentsForm({ schoolId, schoolName, classes, loginCode }: { schoolId: string; schoolName: string; classes: { id: string; name: string }[]; loginCode: string | null }) {
  const [state, action, pending] = useActionState<CreateState, FormData>(createStudents.bind(null, schoolId), null);
  const made = (state?.rows ?? []).filter((r) => r.status === "dibuat");
  const other = (state?.rows ?? []).filter((r) => r.status !== "dibuat");
  return (
    <>
      <form action={action} className="no-print surface grid gap-4 p-5 lg:grid-cols-[3fr_2fr]">
        <label className="block">
          <Label hint="satu murid per baris; NIS boleh ditambah setelah titik koma">Daftar murid</Label>
          <Textarea name="list" rows={9} required className="font-mono text-sm" placeholder={"Ayu Lestari; 2610001\nBudi Santoso; 2610002\nCitra Dewi"} disabled={!loginCode} />
        </label>
        <div className="space-y-4">
          <label className="block">
            <Label>Masukkan ke rombel</Label>
            <Select name="class_group_id" defaultValue="">
              <option value="">Tanpa rombel</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </label>
          <p className="text-sm text-ink-soft">Tempel dari Excel juga bisa (kolom nama lalu kolom NIS). Sampai 200 murid sekali buat. NIS yang kosong dibuatkan otomatis.</p>
          <ErrorNote message={state?.error} />
          <Button type="submit" disabled={pending || !loginCode} className="w-full">{pending ? "Membuat…" : "Buat akun murid"}</Button>
        </div>
      </form>

      {state?.rows ? (
        <section className="mt-8" aria-label="Hasil">
          <div className="no-print flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight">{made.length} akun dibuat</h2>
              <p className="text-ink-soft">Kata sandi hanya muncul sekarang. Cetak kartunya atau salin tabelnya sebelum menutup halaman ini.{state.skipped ? ` ${state.skipped} baris dilewati karena tidak terbaca.` : ""}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <CopyButton text={state.csv ?? ""} label="Salin tabel (CSV)" />
              <PrintButton />
            </div>
          </div>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {made.map((r) => (
              <li key={r.login_id} className="break-inside-avoid rounded-box border-2 border-dashed border-line bg-card p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">{schoolName}</p>
                <p className="mt-1 font-display text-lg font-bold">{r.name}</p>
                <p className="mt-2 text-sm text-ink-soft">ID murid</p>
                <p className="num text-xl font-bold tracking-wide">{r.login_id}</p>
                <p className="mt-2 text-sm text-ink-soft">Kata sandi</p>
                <p className="num text-xl font-bold tracking-wide">{r.password}</p>
              </li>
            ))}
          </ul>
          {other.length ? (
            <div className="no-print mt-6">
              <h3 className="font-bold">Tidak dibuat</h3>
              <ul className="mt-2 border-t border-line">
                {other.map((r, i) => <li key={i} className="flex flex-wrap justify-between gap-2 border-b border-line py-2 text-sm"><span>{r.name || "(kosong)"}{r.login_id ? ` · ${r.login_id}` : ""}</span><span className="font-semibold text-ink-soft">{r.status}</span></li>)}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}
    </>
  );
}
