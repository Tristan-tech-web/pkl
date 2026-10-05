// Mengubah teks tempelan (satu murid per baris) menjadi daftar untuk RPC create_student_accounts.
// Format baris: "Nama", atau "Nama; NIS", "Nama, NIS", "Nama<TAB>NIS". NIS boleh dikosongkan, nanti dibuatkan otomatis.
export type StudentRow = { name: string; nis?: string };
export const MAX_STUDENT_ROWS = 200;

export function parseStudentRows(text: string): { rows: StudentRow[]; skipped: number } {
  const rows: StudentRow[] = [];
  let skipped = 0;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const parts = line.split(/[;\t]|,(?=\s*(?=[A-Za-z0-9]*\d)[A-Za-z0-9]{3,20}\s*$)/).map((p) => p.trim()).filter(Boolean);
    const name = parts[0] ?? "";
    const nis = parts[1]?.replace(/\s+/g, "");
    if (name.length < 2 || name.length > 80 || (nis !== undefined && !/^[A-Za-z0-9]{3,20}$/.test(nis))) { skipped++; continue; }
    rows.push(nis ? { name, nis } : { name });
  }
  return { rows: rows.slice(0, MAX_STUDENT_ROWS), skipped: skipped + Math.max(0, rows.length - MAX_STUDENT_ROWS) };
}

/** Teks CSV hasil pembuatan akun, untuk disalin ke Excel. */
export function accountsToCsv(rows: { name: string; login_id: string | null; password: string | null; status: string }[]): string {
  const esc = (v: string | null) => `"${(v ?? "").replace(/"/g, '""')}"`;
  return ["nama,id_murid,kata_sandi,status", ...rows.map((r) => [r.name, r.login_id, r.password, r.status].map(esc).join(","))].join("\n");
}
