// Murid sering belum punya email. Mereka masuk dengan ID murid (mis. bgb-2610001: kode sekolah + NIS).
// Di balik layar ID itu dipetakan ke alamat email sintetis, jadi tetap memakai Supabase Auth biasa.
export const STUDENT_DOMAIN = "murid.edusmart.test";

export function isStudentId(input: string): boolean {
  return /^[a-z0-9]{2,12}-[a-z0-9]{3,20}$/i.test(input.trim());
}

/** Email asli dipakai apa adanya; ID murid dipetakan ke email sintetis. Selain itu: null. */
export function toLoginEmail(input: string): string | null {
  const v = input.trim();
  if (v.includes("@")) return v;
  if (isStudentId(v)) return `${v.toLowerCase()}@${STUDENT_DOMAIN}`;
  return null;
}
