// Alat MCP EduSmart. Semua akses data lewat RPC mcp_* yang memeriksa token pribadi dan hak pengguna di database.
export type Rpc = (fn: string, params: Record<string, unknown>) => Promise<unknown>;
export type ToolCtx = { rpc: Rpc; token: string; supabaseUrl: string; anonKey: string };
type Props = Record<string, { type: string; description: string; enum?: string[] }>;
export type Tool = {
  name: string;
  title: string;
  description: string;
  properties: Props;
  required?: string[];
  readOnly: boolean;
  run: (args: Record<string, unknown>, ctx: ToolCtx) => Promise<unknown>;
};

const SCHOOL = { school_id: { type: "string", description: "ID sekolah. Boleh dikosongkan bila akun hanya terdaftar di satu sekolah." } } satisfies Props;
const CATEGORIES = ["belum_dipilah", "siswa", "guru", "sekolah", "peraturan", "keuangan", "kurikulum", "buku_paket", "lks", "rapor_contoh", "lainnya"];

async function schoolOf(args: Record<string, unknown>, ctx: ToolCtx): Promise<string> {
  const given = typeof args.school_id === "string" ? args.school_id : "";
  if (/^[0-9a-f-]{36}$/i.test(given)) return given;
  const me = (await ctx.rpc("mcp_whoami", { p_token: ctx.token })) as { schools: { school_id: string; school: string }[] };
  if (me.schools.length === 1) return me.schools[0].school_id;
  if (me.schools.length === 0) throw new Error("Akun ini belum terdaftar di sekolah mana pun.");
  throw new Error(`Akun ada di beberapa sekolah; sebutkan school_id. Pilihan: ${me.schools.map((s) => `${s.school} (${s.school_id})`).join("; ")}`);
}
const int = (v: unknown, d: number) => (Number.isFinite(Number(v)) ? Math.trunc(Number(v)) : d);

export const TOOLS: Tool[] = [
  {
    name: "siapa_saya", title: "Siapa saya", readOnly: true, properties: {},
    description: "Menampilkan nama pengguna dan sekolah beserta perannya (pemilik, guru, siswa, dst.) serta school_id. Panggil ini dulu bila belum tahu sekolah mana.",
    run: (_a, ctx) => ctx.rpc("mcp_whoami", { p_token: ctx.token }),
  },
  {
    name: "hari_ini", title: "Hari ini", readOnly: true, properties: { ...SCHOOL },
    description: "Ringkasan hari ini menurut peran: guru melihat kelas yang diajar, penilaian terdekat, dan absensi yang belum diisi; siswa melihat jadwal kelasnya, ujian/tugas terdekat, dan tagihan; semua melihat pengumuman terbaru. Gunakan untuk 'hari ini aku mengajar/ada apa?'.",
    run: async (a, ctx) => ctx.rpc("mcp_today", { p_token: ctx.token, p_school: await schoolOf(a, ctx) }),
  },
  {
    name: "pengumuman", title: "Pengumuman", readOnly: true, properties: { ...SCHOOL, limit: { type: "number", description: "Jumlah maksimal (1-30), bawaan 10." } },
    description: "Pengumuman sekolah terbaru yang boleh dilihat pengguna.",
    run: async (a, ctx) => ctx.rpc("mcp_announcements", { p_token: ctx.token, p_school: await schoolOf(a, ctx), p_limit: int(a.limit, 10) }),
  },
  {
    name: "cari_peraturan", title: "Cari peraturan dan dokumen", readOnly: true, properties: { ...SCHOOL, query: { type: "string", description: "Kata kunci, mis. 'seragam' atau 'keterlambatan'." } },
    description: "Mencari di peraturan sekolah (dan dokumen milik pengguna/pengelola) dan mengembalikan cuplikan relevan. Peraturan boleh dibaca semua anggota.",
    run: async (a, ctx) => ctx.rpc("mcp_school_docs", { p_token: ctx.token, p_school: await schoolOf(a, ctx), p_query: typeof a.query === "string" ? a.query.slice(0, 100) : null }),
  },
  {
    name: "daftar_berkas", title: "Daftar berkas", readOnly: true, properties: { ...SCHOOL, category: { type: "string", description: "Saring menurut kategori.", enum: CATEGORIES } },
    description: "Berkas di Pusat Data. Pengelola melihat semua; guru melihat berkasnya sendiri. Murid tidak punya akses.",
    run: async (a, ctx) => ctx.rpc("mcp_list_files", { p_token: ctx.token, p_school: await schoolOf(a, ctx), p_category: CATEGORIES.includes(String(a.category)) ? a.category : null }),
  },
  {
    name: "baca_berkas", title: "Baca isi berkas", readOnly: true, properties: { ...SCHOOL, file_id: { type: "string", description: "ID berkas dari daftar_berkas." }, offset: { type: "number", description: "Mulai dari karakter ke-... (potongan 20.000 karakter)." } },
    required: ["file_id"],
    description: "Membaca teks sebuah berkas (potongan 20.000 karakter; gunakan offset untuk bagian berikutnya). Berkas data pribadi (siswa/guru/keuangan) tidak menyertakan teks.",
    run: async (a, ctx) => ctx.rpc("mcp_read_file", { p_token: ctx.token, p_school: await schoolOf(a, ctx), p_file: String(a.file_id ?? ""), p_offset: int(a.offset, 0) }),
  },
  {
    name: "minta_unggah", title: "Minta jalur unggah berkas", readOnly: false,
    properties: { ...SCHOOL, scope: { type: "string", description: "'sekolah' (pengelola) atau 'guru' (guru, untuk kurikulum/buku).", enum: ["sekolah", "guru"] }, file_name: { type: "string", description: "Nama berkas dengan ekstensi." }, mime: { type: "string", description: "Tipe MIME, mis. application/pdf." } },
    required: ["scope", "file_name"],
    description: "Untuk memasukkan berkas BESAR mentah (xlsx, csv, pdf, docx, dll.): minta jalur unggah sekali pakai, lalu kirim isi berkas dengan HTTP POST ke URL yang diberikan (curl --data-binary @berkas), lalu panggil selesai_unggah. Butuh token dengan izin tulis.",
    run: async (a, ctx) => {
      const r = (await ctx.rpc("mcp_request_upload", { p_token: ctx.token, p_school: await schoolOf(a, ctx), p_scope: String(a.scope), p_name: String(a.file_name ?? "berkas").slice(0, 200), p_mime: typeof a.mime === "string" ? a.mime : null })) as { path: string };
      const url = `${ctx.supabaseUrl}/storage/v1/object/school-files/${r.path.split("/").map(encodeURIComponent).join("/")}`;
      const ct = typeof a.mime === "string" && a.mime ? a.mime : "application/octet-stream";
      return { path: r.path, upload_url: url, method: "POST", headers: { apikey: ctx.anonKey, Authorization: `Bearer ${ctx.anonKey}`, "Content-Type": ct }, curl: `curl -X POST '${url}' -H 'apikey: ${ctx.anonKey}' -H 'Authorization: Bearer ${ctx.anonKey}' -H 'Content-Type: ${ct}' --data-binary @NAMA_BERKAS`, next: "Setelah unggah berhasil (HTTP 200), panggil selesai_unggah dengan path ini. Berlaku 30 menit, sekali pakai." };
    },
  },
  {
    name: "selesai_unggah", title: "Selesaikan unggah", readOnly: false,
    properties: { path: { type: "string", description: "path dari minta_unggah." }, size: { type: "number", description: "Ukuran berkas dalam byte." }, category: { type: "string", description: "Kategori bila sudah pasti; kosongkan agar AI EduSmart memilah.", enum: CATEGORIES } },
    required: ["path"],
    description: "Mencatat berkas yang sudah terunggah ke Pusat Data. Pemilahan otomatis berjalan saat pengguna membuka menu Berkas di EduSmart.",
    run: (a, ctx) => ctx.rpc("mcp_finish_upload", { p_token: ctx.token, p_path: String(a.path ?? ""), p_size: int(a.size, 0), p_category: CATEGORIES.includes(String(a.category)) ? a.category : null }),
  },
];
