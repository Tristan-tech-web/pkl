// Perhitungan nilai akhir: rata-rata berbobot dari nilai yang sudah terisi, dinormalisasi ke skala 0-100.
export type Scored = { weight: number; maxScore: number; score: number | null };

export function finalGrade(items: Scored[]): number | null {
  const done = items.filter((i) => i.score !== null && i.maxScore > 0);
  const w = done.reduce((a, i) => a + i.weight, 0);
  if (done.length === 0 || w === 0) return null;
  const total = done.reduce((a, i) => a + ((i.score as number) / i.maxScore) * 100 * i.weight, 0);
  return Math.round((total / w) * 10) / 10;
}

// Skala predikat bawaan; ambang ketuntasan ditentukan sekolah (gradebook_settings.pass_mark).
export function predicate(grade: number | null): string {
  if (grade === null) return "–";
  return grade >= 90 ? "A" : grade >= 80 ? "B" : grade >= 70 ? "C" : "D";
}

export const KIND_LABEL: Record<string, string> = { tugas: "Tugas", kuis: "Kuis", uts: "UTS", uas: "UAS", praktik: "Praktik", proyek: "Proyek" };

export function currentTerm<T extends { id: string; starts_on: string; ends_on: string }>(terms: T[], today: string): T | undefined {
  return terms.find((t) => t.starts_on <= today && today <= t.ends_on) ?? terms[0];
}
