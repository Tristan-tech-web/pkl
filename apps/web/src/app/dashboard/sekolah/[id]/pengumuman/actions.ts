"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireModule } from "@/lib/modules";
import { getSchoolContext } from "@/lib/school";

const q = encodeURIComponent;
const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export async function createAnnouncement(schoolId: string, formData: FormData) {
  const { supabase, me } = await getSchoolContext(schoolId);
  await requireModule(supabase, schoolId, "announcements");
  const page = `/dashboard/sekolah/${schoolId}/pengumuman`;
  const audience = str(formData, "audience");
  const classId = audience === "kelas" ? str(formData, "class_group_id") || null : null;
  const title = str(formData, "title");
  const body = str(formData, "body");
  if (title.length < 3 || !body || !["semua", "siswa", "guru", "kelas"].includes(audience) || (audience === "kelas" && !classId)) {
    redirect(`${page}?error=${q("Isi judul (minimal 3 huruf), isi, dan sasaran dengan benar.")}`);
  }
  const { error } = await supabase.from("announcements").insert({
    school_id: schoolId, author_member_id: me.memberId, title, body: body.slice(0, 4000), audience, class_group_id: classId, pinned: formData.get("pinned") === "on",
  });
  if (error) redirect(`${page}?error=${q("Pengumuman belum bisa dikirim. Guru hanya boleh mengumumkan ke rombel yang diajar.")}`);
  revalidatePath(page);
  redirect(`${page}?info=${q("Pengumuman terkirim.")}`);
}

export async function deleteAnnouncement(schoolId: string, id: string) {
  const { supabase } = await getSchoolContext(schoolId);
  await supabase.from("announcements").delete().eq("id", id).eq("school_id", schoolId);
  revalidatePath(`/dashboard/sekolah/${schoolId}/pengumuman`);
  redirect(`/dashboard/sekolah/${schoolId}/pengumuman?info=${q("Pengumuman dihapus.")}`);
}
