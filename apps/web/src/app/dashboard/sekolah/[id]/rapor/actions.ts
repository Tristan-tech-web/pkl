"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireModule } from "@/lib/modules";
import { getSchoolContext } from "@/lib/school";

const q = encodeURIComponent;

export async function saveReportNote(schoolId: string, memberId: string, termId: string, formData: FormData) {
  const { supabase, me } = await getSchoolContext(schoolId);
  await requireModule(supabase, schoolId, "gradebook");
  const page = `/dashboard/sekolah/${schoolId}/rapor/${memberId}?term=${termId}`;
  const note = String(formData.get("note") ?? "").trim().slice(0, 1000);
  const { error } = note
    ? await supabase.from("report_notes").upsert({ school_id: schoolId, term_id: termId, member_id: memberId, note, written_by: me.memberId, updated_at: new Date().toISOString() }, { onConflict: "term_id,member_id" })
    : await supabase.from("report_notes").delete().eq("term_id", termId).eq("member_id", memberId);
  if (error) redirect(`${page}&error=${q("Catatan belum bisa disimpan. Hanya wali kelas atau pengelola yang boleh menulis.")}`);
  revalidatePath(`/dashboard/sekolah/${schoolId}/rapor/${memberId}`);
  redirect(`${page}&info=${q("Catatan wali kelas tersimpan.")}`);
}

export async function saveExtras(schoolId: string, memberId: string, termId: string, section: string, formData: FormData) {
  const { supabase, me } = await getSchoolContext(schoolId);
  await requireModule(supabase, schoolId, "gradebook");
  const page = `/dashboard/sekolah/${schoolId}/rapor/${memberId}?term=${termId}`;
  const s = (k: string) => String(formData.get(k) ?? "").trim();
  let data: Record<string, unknown>;
  if (section === "sikap") data = { spiritual: s("spiritual").slice(0, 30), sosial: s("sosial").slice(0, 30), deskripsi: s("deskripsi").slice(0, 600) };
  else if (section === "ekskul") {
    const items: { nama: string; predikat: string; keterangan: string }[] = [];
    for (let i = 0; i < 5; i++) if (s(`nama_${i}`)) items.push({ nama: s(`nama_${i}`).slice(0, 80), predikat: s(`predikat_${i}`).slice(0, 30), keterangan: s(`keterangan_${i}`).slice(0, 200) });
    data = { items };
  } else if (section === "prestasi") data = { items: s("items").split("\n").map((x) => x.trim().slice(0, 200)).filter(Boolean).slice(0, 10) };
  else if (section === "p5") data = { items: s("items").split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 6).map((l) => { const i = l.indexOf(":"); return i < 0 ? { tema: l.slice(0, 120), deskripsi: "" } : { tema: l.slice(0, i).trim().slice(0, 120), deskripsi: l.slice(i + 1).trim().slice(0, 300) }; }) };
  else redirect(`${page}&error=${q("Bagian tidak dikenal.")}`);
  const { error } = await supabase.from("report_extras").upsert({ school_id: schoolId, term_id: termId, member_id: memberId, section, data, written_by: me.memberId, updated_at: new Date().toISOString() }, { onConflict: "term_id,member_id,section" });
  if (error) redirect(`${page}&error=${q("Belum bisa disimpan. Hanya wali kelas atau pengelola yang boleh mengisi.")}`);
  revalidatePath(`/dashboard/sekolah/${schoolId}/rapor/${memberId}`);
  redirect(`${page}&info=${q("Isian rapor tersimpan.")}`);
}
