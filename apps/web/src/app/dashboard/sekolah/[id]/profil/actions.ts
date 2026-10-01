"use server";

import { revalidatePath } from "next/cache";
import { sanitizeAvatar, type Avatar } from "@/lib/avatar";
import { createClient } from "@/lib/supabase/server";

export async function saveAvatar(schoolId: string, avatar: Avatar): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("user_preferences").upsert({ user_id: user.id, avatar: sanitizeAvatar(avatar), updated_at: new Date().toISOString() });
  revalidatePath(`/dashboard/sekolah/${schoolId}`, "layout");
}
