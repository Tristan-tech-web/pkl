import type { SupabaseClient } from "@supabase/supabase-js";
import { parseDate } from "./intake";

export const FIN_FIELDS = ["name", "nis", "class_name", "title", "amount", "status", "due_on"] as const;
export type FinField = (typeof FIN_FIELDS)[number];
export const FIN_LABEL: Record<FinField, string> = { name: "Nama siswa", nis: "NIS", class_name: "Kelas", title: "Nama tagihan", amount: "Nominal", status: "Status bayar", due_on: "Jatuh tempo" };

const HINTS: Record<FinField, RegExp> = {
  name: /^(nama|nama siswa|nama peserta didik|siswa)$/i,
  nis: /^(nis|no\.? ?induk|nomor induk)$/i,
  class_name: /^(kelas|rombel)$/i,
  title: /(tagihan|keterangan|jenis|uraian|pembayaran)/i,
  amount: /(nominal|jumlah|nilai|biaya|tagihan rp|total)/i,
  status: /(status|bayar|lunas)/i,
  due_on: /(jatuh tempo|tempo|batas)/i,
};

export function guessFinMapping(header: string[]): Partial<Record<FinField, number>> {
  const m: Partial<Record<FinField, number>> = {};
  const used = new Set<number>();
  for (const k of FIN_FIELDS) {
    const i = header.findIndex((h, idx) => !used.has(idx) && HINTS[k].test(h.trim()));
    if (i >= 0) { m[k] = i; used.add(i); }
  }
  return m;
}

export function parseAmount(raw: string): number | null {
  const s = raw.replace(/rp\.?/gi, "").replace(/\s/g, "");
  if (!/^\d[\d.,]*$/.test(s)) return null;
  const n = Number(/,\d{1,2}$/.test(s) ? s.replace(/\./g, "").replace(",", ".") : s.replace(/[.,]/g, ""));
  return Number.isFinite(n) && n > 0 && n <= 1_000_000_000 ? Math.round(n) : null;
}

export const isPaid = (raw: string) => /^(lunas|sudah|bayar|dibayar|paid|ya|✓|v|x|lns)$/i.test(raw.trim());

export type FinRow = { line: number; name: string; nis: string; class_name: string; title: string; amount: number; paid: boolean; due_on: string | null };
export type FinResult = { line: number; row: FinRow | null; error?: string };

export function normalizeFinance(rows: string[][], headerRow: number, m: Partial<Record<FinField, number>>): FinResult[] {
  const get = (r: string[], k: FinField) => (m[k] === undefined ? "" : String(r[m[k]!] ?? "").trim());
  const out: FinResult[] = [];
  for (let i = headerRow + 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.every((c) => !String(c ?? "").trim())) continue;
    const name = get(r, "name"), nis = get(r, "nis");
    if (!name && !nis) { out.push({ line: i + 1, row: null, error: "Tanpa nama/NIS" }); continue; }
    const amount = parseAmount(get(r, "amount"));
    if (amount === null) { out.push({ line: i + 1, row: null, error: "Nominal tidak valid" }); continue; }
    const title = get(r, "title") || "Tagihan";
    out.push({ line: i + 1, row: { line: i + 1, name, nis, class_name: get(r, "class_name"), title: title.slice(0, 120), amount, paid: isPaid(get(r, "status")), due_on: m.due_on === undefined ? null : parseDate(get(r, "due_on")) } });
  }
  return out;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export type Student = { id: string; name: string; nis: string | null };
export function matchStudents(rows: FinRow[], students: Student[]): { matched: { row: FinRow; memberId: string }[]; unmatched: FinRow[] } {
  const byNis = new Map(students.filter((s) => s.nis).map((s) => [s.nis!, s.id]));
  const byName = new Map<string, string[]>();
  for (const s of students) byName.set(norm(s.name), [...(byName.get(norm(s.name)) ?? []), s.id]);
  const matched: { row: FinRow; memberId: string }[] = [], unmatched: FinRow[] = [];
  for (const row of rows) {
    const id = (row.nis && byNis.get(row.nis)) || (() => { const c = byName.get(norm(row.name)); return c && c.length === 1 ? c[0] : null; })();
    if (id) matched.push({ row, memberId: id }); else unmatched.push(row);
  }
  return { matched, unmatched };
}

export async function loadStudents(supabase: SupabaseClient, schoolId: string) {
  const [{ data: m }, { data: p }] = await Promise.all([
    supabase.from("school_members").select("id,display_name,roles!inner(code)").eq("school_id", schoolId).eq("status", "active").eq("roles.code", "student"),
    supabase.from("member_profiles").select("member_id,nis").eq("school_id", schoolId),
  ]);
  const nis = new Map((p ?? []).map((x) => [x.member_id as string, (x.nis as string | null) ?? null]));
  return { students: (m ?? []).map((x) => ({ id: x.id as string, name: String(x.display_name ?? ""), nis: nis.get(x.id as string) ?? null })) };
}

/** Baris yang tidak cocok dengan siswa berakun dicocokkan ke roster (siswa terdaftar, belum bergabung): NIS, atau nama yang unik. */
export function matchRoster(rows: FinRow[], roster: Student[]): { matched: { row: FinRow; rosterId: string }[]; unmatched: FinRow[] } {
  const { matched, unmatched } = matchStudents(rows, roster);
  return { matched: matched.map((m) => ({ row: m.row, rosterId: m.memberId })), unmatched };
}

export async function loadRoster(supabase: SupabaseClient, schoolId: string) {
  const { data } = await supabase.from("roster_people").select("id,full_name,nis").eq("school_id", schoolId).eq("kind", "siswa").is("member_id", null);
  return { roster: (data ?? []).map((x) => ({ id: x.id as string, name: String(x.full_name ?? ""), nis: (x.nis as string | null) ?? null })) };
}
