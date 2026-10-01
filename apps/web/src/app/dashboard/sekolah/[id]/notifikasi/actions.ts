"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSchoolContext } from "@/lib/school";

export async function markAllRead(schoolId: string) {
  const { supabase } = await getSchoolContext(schoolId);
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("school_id", schoolId).is("read_at", null);
  revalidatePath(`/dashboard/sekolah/${schoolId}`, "layout");
  redirect(`/dashboard/sekolah/${schoolId}/notifikasi`);
}
