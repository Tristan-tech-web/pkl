// Konfigurasi tampilan rapor per sekolah. Disimpan sebagai jsonb; semua masukan (termasuk usulan AI) dibersihkan di sini.
export type ReportConfig = {
  title: string;
  subtitle: string;
  columns: { nilai: boolean; predikat: boolean; ketuntasan: boolean; deskripsi: boolean };
  groups: { name: string; subjects: string[] }[];
  sections: { kehadiran: boolean; sikap: boolean; ekskul: boolean; prestasi: boolean; p5: boolean; catatan: boolean };
  signatures: string[];
  scale: { min: number; label: string }[];
  footnote: string;
};

export const DEFAULT_REPORT_CONFIG: ReportConfig = {
  title: "LAPORAN HASIL BELAJAR (RAPOR)",
  subtitle: "",
  columns: { nilai: true, predikat: true, ketuntasan: true, deskripsi: false },
  groups: [],
  sections: { kehadiran: true, sikap: false, ekskul: false, prestasi: false, p5: false, catatan: true },
  signatures: ["Orang tua/wali", "Wali kelas", "Kepala sekolah"],
  scale: [{ min: 90, label: "A" }, { min: 80, label: "B" }, { min: 70, label: "C" }, { min: 0, label: "D" }],
  footnote: "",
};

const str = (v: unknown, max: number, fallback = "") => (typeof v === "string" ? v.trim().slice(0, max) : fallback);
const bool = (v: unknown, fallback: boolean) => (typeof v === "boolean" ? v : fallback);

export function sanitizeConfig(input: unknown): ReportConfig {
  const d = DEFAULT_REPORT_CONFIG;
  const o = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const col = (o.columns && typeof o.columns === "object" ? o.columns : {}) as Record<string, unknown>;
  const sec = (o.sections && typeof o.sections === "object" ? o.sections : {}) as Record<string, unknown>;
  const groups = Array.isArray(o.groups)
    ? o.groups.slice(0, 8).map((g) => {
        const x = (g && typeof g === "object" ? g : {}) as Record<string, unknown>;
        return { name: str(x.name, 60), subjects: Array.isArray(x.subjects) ? x.subjects.map((s) => str(s, 80)).filter(Boolean).slice(0, 30) : [] };
      }).filter((g) => g.name)
    : d.groups;
  const sigs = Array.isArray(o.signatures) ? o.signatures.map((s) => str(s, 40)).filter(Boolean).slice(0, 4) : d.signatures;
  const scale = Array.isArray(o.scale)
    ? o.scale.slice(0, 8).map((s) => {
        const x = (s && typeof s === "object" ? s : {}) as Record<string, unknown>;
        return { min: Math.min(100, Math.max(0, Number(x.min) || 0)), label: str(x.label, 12) };
      }).filter((s) => s.label).sort((a, b) => b.min - a.min)
    : d.scale;
  return {
    title: str(o.title, 80, d.title) || d.title,
    subtitle: str(o.subtitle, 120),
    columns: { nilai: bool(col.nilai, d.columns.nilai), predikat: bool(col.predikat, d.columns.predikat), ketuntasan: bool(col.ketuntasan, d.columns.ketuntasan), deskripsi: bool(col.deskripsi, d.columns.deskripsi) },
    groups,
    sections: {
      kehadiran: bool(sec.kehadiran, d.sections.kehadiran), sikap: bool(sec.sikap, d.sections.sikap), ekskul: bool(sec.ekskul, d.sections.ekskul),
      prestasi: bool(sec.prestasi, d.sections.prestasi), p5: bool(sec.p5, d.sections.p5), catatan: bool(sec.catatan, d.sections.catatan),
    },
    signatures: sigs.length ? sigs : d.signatures,
    scale: scale.length ? scale : d.scale,
    footnote: str(o.footnote, 300),
  };
}

export function gradeLabel(scale: ReportConfig["scale"], grade: number | null): string {
  if (grade === null) return "–";
  return scale.find((s) => grade >= s.min)?.label ?? scale[scale.length - 1]?.label ?? "–";
}

// Deskripsi capaian otomatis dari hasil penilaian (tanpa AI): kekuatan (>= 85%) dan yang perlu penguatan (< ambang).
export function describeAchievement(items: { title: string; pct: number }[], pass: number): string {
  if (items.length === 0) return "";
  const strong = [...items].filter((i) => i.pct >= 85).sort((a, b) => b.pct - a.pct).slice(0, 2).map((i) => i.title);
  const weak = [...items].filter((i) => i.pct < pass).sort((a, b) => a.pct - b.pct).slice(0, 2).map((i) => i.title);
  const parts: string[] = [];
  if (strong.length) parts.push(`Menunjukkan capaian baik pada ${strong.join(" dan ")}.`);
  if (weak.length) parts.push(`Perlu penguatan pada ${weak.join(" dan ")}.`);
  return parts.length ? parts.join(" ") : "Capaian sesuai harapan.";
}

// "Kelompok A: Matematika; Bahasa Indonesia" per baris -> grup
export function parseGroups(text: string): ReportConfig["groups"] {
  return text.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 8).map((l) => {
    const i = l.indexOf(":");
    return i < 0 ? { name: l.slice(0, 60), subjects: [] } : { name: l.slice(0, i).trim().slice(0, 60), subjects: l.slice(i + 1).split(/[;,]/).map((s) => s.trim()).filter(Boolean) };
  }).filter((g) => g.name);
}
export const groupsToText = (g: ReportConfig["groups"]) => g.map((x) => `${x.name}: ${x.subjects.join("; ")}`).join("\n");
// "90=A, 80=B" -> skala
export function parseScale(text: string): ReportConfig["scale"] {
  return text.split(/[\n,;]+/).map((t) => t.trim()).filter(Boolean).map((t) => { const [m, l] = t.split("="); return { min: Number(m), label: (l ?? "").trim() }; }).filter((s) => Number.isFinite(s.min) && s.label);
}
export const scaleToText = (s: ReportConfig["scale"]) => s.map((x) => `${x.min}=${x.label}`).join(", ");
