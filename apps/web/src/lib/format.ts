const FEATURE_LABELS: Record<string, string> = {
  max_students: "Jumlah siswa",
  ai_tutor: "Tutor AI",
  visual_modules: "Modul visual",
  custom_curriculum: "Kurikulum kustom",
};

export function featureLabel(feature: string): string {
  return FEATURE_LABELS[feature] ?? feature.replaceAll("_", " ");
}

export function formatEntitlement(enabled: boolean, limit: number | null): string {
  if (!enabled) return "Tidak tersedia";
  if (limit === null) return "Tanpa batas";
  return `Hingga ${limit.toLocaleString("id-ID")}`;
}

const AUTHORITY_LABELS: Record<string, string> = {
  kemendikdasmen: "Kemendikdasmen",
  kemenag: "Kemenag",
  lainnya: "Lainnya",
};

export function authorityLabel(value: string): string {
  return AUTHORITY_LABELS[value] ?? value;
}

const CATEGORY_LABELS: Record<string, string> = {
  paud: "PAUD",
  dasar: "Pendidikan dasar",
  menengah: "Pendidikan menengah",
  khusus: "Pendidikan khusus (SLB)",
  kesetaraan: "Kesetaraan",
  pesantren: "Pesantren",
  internasional: "Internasional",
  kustom: "Kustom",
};

export function categoryLabel(value: string): string {
  return CATEGORY_LABELS[value] ?? value;
}

export const rupiah = (n: number) => `Rp${new Intl.NumberFormat("id-ID").format(n)}`;
