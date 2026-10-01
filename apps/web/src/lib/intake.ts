// Pemetaan kolom tabel berkas sekolah (CSV/XLSX) ke bidang baku, tanpa AI. AI hanya mengusulkan; ini juga cadangan dan validator.
export type PersonKind = "siswa" | "guru" | "staf" | "orang_tua";
export const CATEGORIES = ["belum_dipilah", "siswa", "guru", "sekolah", "peraturan", "keuangan", "kurikulum", "buku_paket", "lks", "rapor_contoh", "lainnya"] as const;
export type Category = (typeof CATEGORIES)[number];
export const CATEGORY_LABEL: Record<Category, string> = {
  belum_dipilah: "Belum dipilah", siswa: "Data siswa", guru: "Data guru", sekolah: "Data sekolah", peraturan: "Peraturan sekolah",
  keuangan: "Keuangan", kurikulum: "Kurikulum", buku_paket: "Buku paket", lks: "LKS", rapor_contoh: "Contoh rapor", lainnya: "Lainnya",
};

export const PERSON_FIELDS = ["full_name", "nis", "nisn", "nip", "gender", "birth_place", "birth_date", "address", "phone", "email", "class_name", "guardian_name", "guardian_phone"] as const;
export type PersonField = (typeof PERSON_FIELDS)[number];
export const FIELD_LABEL: Record<PersonField, string> = {
  full_name: "Nama lengkap", nis: "NIS", nisn: "NISN", nip: "NIP", gender: "Jenis kelamin", birth_place: "Tempat lahir", birth_date: "Tanggal lahir",
  address: "Alamat", phone: "Telepon", email: "Email", class_name: "Rombel/kelas", guardian_name: "Nama orang tua/wali", guardian_phone: "Telepon wali",
};

const SYN: Record<PersonField, string[]> = {
  full_name: ["nama", "nama lengkap", "nama siswa", "nama peserta didik", "nama guru", "nama pegawai", "name", "full name", "nama ptk"],
  nis: ["nis", "no induk", "nomor induk", "nomor induk siswa", "no induk siswa"],
  nisn: ["nisn", "nomor induk siswa nasional"],
  nip: ["nip", "nuptk", "nip/nuptk", "nomor induk pegawai"],
  gender: ["jk", "l/p", "jenis kelamin", "kelamin", "gender", "sex"],
  birth_place: ["tempat lahir", "tmp lahir", "tempat"],
  birth_date: ["tanggal lahir", "tgl lahir", "ttl", "lahir", "birth date", "tanggal_lahir"],
  address: ["alamat", "alamat rumah", "address", "alamat tinggal"],
  phone: ["telepon", "telp", "no hp", "hp", "no telp", "nomor hp", "no. hp", "phone", "wa", "whatsapp", "no wa"],
  email: ["email", "e-mail", "surel"],
  class_name: ["kelas", "rombel", "rombongan belajar", "nama rombel", "class", "tingkat kelas"],
  guardian_name: ["nama ayah", "nama ibu", "nama wali", "orang tua", "orangtua", "nama orang tua", "wali", "nama ortu", "ayah", "ibu"],
  guardian_phone: ["hp ortu", "telepon ortu", "no hp ortu", "telp wali", "hp wali", "telepon wali", "no hp wali", "hp orang tua"],
};

const norm = (s: string) => s.toLowerCase().replace(/[._\-:]+/g, " ").replace(/\s+/g, " ").trim();

// Mengembalikan indeks kolom per bidang; kecocokan persis menang atas kecocokan sebagian; satu kolom hanya untuk satu bidang.
export function guessMapping(header: string[]): Partial<Record<PersonField, number>> {
  const h = header.map(norm);
  const out: Partial<Record<PersonField, number>> = {};
  const used = new Set<number>();
  const order: PersonField[] = ["guardian_phone", "nisn", "nis", "nip", "full_name", "birth_date", "birth_place", "gender", "class_name", "email", "phone", "guardian_name", "address"];
  for (const pass of ["exact", "part"] as const) {
    for (const f of order) {
      if (out[f] !== undefined) continue;
      const i = h.findIndex((x, idx) => !used.has(idx) && (pass === "exact" ? SYN[f].includes(x) : SYN[f].some((s) => s.length > 3 && x.includes(s))));
      if (i >= 0) { out[f] = i; used.add(i); }
    }
  }
  return out;
}

// Cari baris judul pada 10 baris pertama (berkas Dapodik sering punya judul/logo di atas).
export function findHeaderRow(rows: string[][]): number {
  let best = 0, bestScore = -1;
  rows.slice(0, 10).forEach((r, i) => {
    const score = Object.keys(guessMapping(r)).length;
    if (score > bestScore) { best = i; bestScore = score; }
  });
  return best;
}

export function guessCategory(fileName: string, header: string[] | null): { category: Category; confidence: number } {
  const n = norm(fileName);
  const has = (...w: string[]) => w.some((x) => n.includes(x));
  if (header) {
    const m = guessMapping(header);
    const fields = Object.keys(m).length;
    if (m.full_name !== undefined && fields >= 3) {
      if (m.nip !== undefined && m.nisn === undefined && m.nis === undefined) return { category: "guru", confidence: 0.75 };
      if (has("guru", "ptk", "pegawai", "pendidik")) return { category: "guru", confidence: 0.8 };
      return { category: "siswa", confidence: m.nisn !== undefined || m.nis !== undefined ? 0.8 : 0.6 };
    }
    if (header.some((c) => /(spp|tagihan|iuran|lks|pembayaran|biaya|nominal|jumlah bayar)/.test(norm(c)))) return { category: "keuangan", confidence: 0.6 };
  }
  if (has("tata tertib", "peraturan", "kode etik", "tatib")) return { category: "peraturan", confidence: 0.7 };
  if (has("lks", "lembar kerja")) return { category: "lks", confidence: 0.7 };
  if (has("buku", "modul ajar", "bahan ajar")) return { category: "buku_paket", confidence: 0.55 };
  if (has("kurikulum", "silabus", "atp", "capaian pembelajaran", "kktp", "rpp")) return { category: "kurikulum", confidence: 0.65 };
  if (has("rapor", "raport")) return { category: "rapor_contoh", confidence: 0.6 };
  if (has("spp", "keuangan", "anggaran", "rab", "kas")) return { category: "keuangan", confidence: 0.55 };
  if (has("siswa", "peserta didik", "murid")) return { category: "siswa", confidence: 0.5 };
  if (has("guru", "ptk")) return { category: "guru", confidence: 0.5 };
  if (has("profil sekolah", "data sekolah", "npsn", "visi")) return { category: "sekolah", confidence: 0.5 };
  return { category: "belum_dipilah", confidence: 0 };
}

const MONTHS: Record<string, number> = { januari: 1, februari: 2, maret: 3, april: 4, mei: 5, juni: 6, juli: 7, agustus: 8, september: 9, oktober: 10, november: 11, desember: 12, jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, agu: 8, agt: 8, sep: 9, okt: 10, nov: 11, des: 12 };
const pad = (n: number) => String(n).padStart(2, "0");
const validDate = (y: number, m: number, d: number) => y >= 1900 && y <= 2100 && m >= 1 && m <= 12 && d >= 1 && d <= new Date(y, m, 0).getDate();

export function parseDate(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ].*)?$/.exec(s);
  if (m && validDate(+m[1], +m[2], +m[3])) return `${m[1]}-${pad(+m[2])}-${pad(+m[3])}`;
  m = /^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})$/.exec(s);
  if (m) {
    const y = +m[3] < 100 ? (+m[3] > 30 ? 1900 + +m[3] : 2000 + +m[3]) : +m[3];
    if (validDate(y, +m[2], +m[1])) return `${y}-${pad(+m[2])}-${pad(+m[1])}`;
  }
  m = /^(\d{1,2})\s+([a-z]+)\s+(\d{4})$/i.exec(s);
  if (m && MONTHS[m[2].toLowerCase()] && validDate(+m[3], MONTHS[m[2].toLowerCase()], +m[1])) return `${m[3]}-${pad(MONTHS[m[2].toLowerCase()])}-${pad(+m[1])}`;
  if (/^\d{5}$/.test(s)) { // serial Excel
    const d = new Date(Date.UTC(1899, 11, 30) + +s * 86400000);
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  }
  return null;
}

export const normGender = (raw: string): "L" | "P" | null => {
  const s = raw.trim().toLowerCase();
  if (["l", "laki-laki", "laki laki", "pria", "male", "m"].includes(s)) return "L";
  if (["p", "perempuan", "wanita", "female", "f"].includes(s)) return "P";
  return null;
};

export const normPhone = (raw: string): string => {
  const d = raw.replace(/[^\d+]/g, "");
  return d.startsWith("+62") ? "0" + d.slice(3) : d.startsWith("62") && d.length > 9 ? "0" + d.slice(2) : d.length >= 8 && !d.startsWith("0") && !d.startsWith("+") ? "0" + d : d;
};

export type PersonRow = Partial<Record<PersonField, string>> & { full_name: string };
export type RowResult = { line: number; values: PersonRow | null; errors: string[]; warnings: string[] };

export function normalizePeople(rows: string[][], headerRow: number, mapping: Partial<Record<PersonField, number>>): RowResult[] {
  const out: RowResult[] = [];
  const seenNisn = new Set<string>(), seenNis = new Set<string>();
  for (let i = headerRow + 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.every((c) => !String(c ?? "").trim())) continue;
    const get = (f: PersonField) => (mapping[f] === undefined ? "" : String(r[mapping[f] as number] ?? "").trim());
    const errors: string[] = [], warnings: string[] = [];
    const v: PersonRow = { full_name: get("full_name").replace(/\s+/g, " ") };
    if (v.full_name.length < 2) errors.push("nama kosong");
    const nisn = get("nisn").replace(/\D/g, "");
    if (nisn) {
      const p = nisn.length >= 8 && nisn.length < 10 ? nisn.padStart(10, "0") : nisn;
      if (p.length !== 10) errors.push("NISN harus 10 digit");
      else { v.nisn = p; if (p !== nisn) warnings.push("NISN dilengkapi nol di depan"); if (seenNisn.has(p)) errors.push("NISN ganda di berkas"); seenNisn.add(p); }
    }
    const nis = get("nis"); if (nis) { v.nis = nis; if (seenNis.has(nis)) errors.push("NIS ganda di berkas"); seenNis.add(nis); }
    const nip = get("nip"); if (nip) v.nip = nip.replace(/\s+/g, "");
    const g = get("gender"); if (g) { const x = normGender(g); if (x) v.gender = x; else warnings.push("jenis kelamin tidak dikenali"); }
    const bp = get("birth_place"); if (bp) v.birth_place = bp.slice(0, 80);
    const bd = get("birth_date"); if (bd) { const x = parseDate(bd); if (x) v.birth_date = x; else warnings.push("tanggal lahir tidak dikenali"); }
    const ad = get("address"); if (ad) v.address = ad.slice(0, 300);
    const ph = get("phone"); if (ph) v.phone = normPhone(ph).slice(0, 30);
    const em = get("email"); if (em) { if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) v.email = em.slice(0, 200); else warnings.push("email tidak valid"); }
    const cn = get("class_name"); if (cn) v.class_name = cn.slice(0, 60);
    const gn = get("guardian_name"); if (gn) v.guardian_name = gn.slice(0, 100);
    const gp = get("guardian_phone"); if (gp) v.guardian_phone = normPhone(gp).slice(0, 30);
    out.push({ line: i + 1, values: errors.length ? null : v, errors, warnings });
  }
  return out;
}
