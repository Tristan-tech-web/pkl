import { notFound } from "next/navigation";
import { BackLink, OwnerView, StudentView, TeacherView, type Membership } from "@/components/role-views";
import { ParentView } from "@/components/parent-view";
import { LatestAnnouncements, ModuleLinks } from "@/components/module-links";
import { authorityLabel } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

const MANAGEMENT = new Set(["owner", "admin", "curriculum_lead"]);
const TEACHING = new Set(["teacher", "homeroom", "counselor"]);

type RoleRef = { code: string; name: string };
const one = <T,>(v: T | T[] | null): T | null => (Array.isArray(v) ? (v[0] ?? null) : v);

export default async function SchoolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const [{ data: school }, { data: mine }, { count: schoolCount }] = await Promise.all([
    supabase.from("schools").select("id,name,authority,ownership,city,province").eq("id", id).maybeSingle(),
    supabase
      .from("school_members")
      .select("id,display_name,roles(code,name)")
      .eq("school_id", id)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase.from("schools").select("id", { count: "exact", head: true }),
  ]);
  if (!school || !mine) notFound();

  const role = one(mine.roles as unknown as RoleRef | RoleRef[] | null);
  const me: Membership = {
    memberId: mine.id as string,
    roleCode: role?.code ?? "student",
    roleName: role?.name ?? "Anggota",
    displayName: (mine.display_name as string | null) ?? null,
  };
  const first = (me.displayName ?? "").split(" ")[0] || "Anda";
  const where = [school.city, school.province].filter(Boolean).join(", ");

  return (
    <>
      {(schoolCount ?? 0) > 1 ? <BackLink /> : null}
      {me.roleCode === "student" ? null : <header className="mt-3 mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-ink-soft">{me.roleName}</p>
        <h1 className="mt-1 font-display text-4xl font-bold tracking-tight">
          {me.roleCode === "student" || me.roleCode === "parent" ? `Halo, ${first}` : school.name}
        </h1>
        <p className="mt-1 text-ink-soft">
          {me.roleCode === "student" || me.roleCode === "parent" ? school.name : `${where ? `${where} · ` : ""}${authorityLabel(school.authority)} · ${school.ownership === "negeri" ? "Negeri" : "Swasta"}`}
        </p>
      </header>}
      {MANAGEMENT.has(me.roleCode) ? (
        <>
          <OwnerView supabase={supabase} schoolId={id} />
          <LatestAnnouncements schoolId={id} />
        </>
      ) : TEACHING.has(me.roleCode) ? (
        <>
          <TeacherView supabase={supabase} schoolId={id} me={me} />
          <ModuleLinks schoolId={id} role="teacher" />
          <LatestAnnouncements schoolId={id} />
        </>
      ) : me.roleCode === "student" ? (
        <>
          <StudentView supabase={supabase} schoolId={id} me={me} />
          <ModuleLinks schoolId={id} role="student" />
          <LatestAnnouncements schoolId={id} />
        </>
      ) : (
        <ParentView schoolId={id} />
      )}
    </>
  );
}
