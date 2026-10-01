import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const MANAGEMENT_ROLES = new Set(["owner", "admin", "curriculum_lead"]);

type RoleRef = { code: string; name: string };
const one = <T,>(v: T | T[] | null): T | null => (Array.isArray(v) ? (v[0] ?? null) : v);

export type SchoolContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  school: { id: string; name: string };
  me: { memberId: string; roleCode: string; roleName: string; displayName: string | null };
};

export async function getSchoolContext(schoolId: string, opts: { management?: boolean } = {}): Promise<SchoolContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();
  const [{ data: school }, { data: mine }] = await Promise.all([
    supabase.from("schools").select("id,name").eq("id", schoolId).maybeSingle(),
    supabase
      .from("school_members")
      .select("id,display_name,roles(code,name)")
      .eq("school_id", schoolId)
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);
  if (!school || !mine) notFound();
  const role = one(mine.roles as unknown as RoleRef | RoleRef[] | null);
  const roleCode = role?.code ?? "student";
  if (opts.management && !MANAGEMENT_ROLES.has(roleCode)) notFound();
  return {
    supabase,
    userId: user.id,
    school: { id: school.id as string, name: school.name as string },
    me: {
      memberId: mine.id as string,
      roleCode,
      roleName: role?.name ?? "Anggota",
      displayName: (mine.display_name as string | null) ?? null,
    },
  };
}

export const first = one;
