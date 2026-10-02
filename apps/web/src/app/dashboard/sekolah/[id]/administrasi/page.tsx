import Link from "next/link";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/role-views";
import { SchoolNav } from "@/components/school-nav";
import { requireModule } from "@/lib/modules";
import { first, getSchoolContext, MANAGEMENT_ROLES } from "@/lib/school";

export const metadata = { title: "Administrasi · EduSmart" };
const FIELDS = ["nis", "nisn", "gender", "birth_place", "birth_date", "address", "phone", "guardian_name", "guardian_phone"] as const;

export default async function AdministrasiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, me } = await getSchoolContext(id);
  await requireModule(supabase, id, "admin_records");
  if (!MANAGEMENT_ROLES.has(me.roleCode)) return <MyRecords schoolId={id} memberId={me.memberId} role={me.roleCode} />;

  const [members, profiles] = await Promise.all([
    supabase.from("school_members").select("id,display_name,roles(code,name)").eq("school_id", id).eq("status", "active").order("display_name"),
    supabase.from("member_profiles").select("member_id," + FIELDS.join(",")).eq("school_id", id),
  ]);
  const prof = new Map(((profiles.data ?? []) as unknown as Record<string, unknown>[]).map((p) => [p.member_id as string, p]));
  const rows = ((members.data ?? []) as unknown as { id: string; display_name: string | null; roles: { code: string; name: string } | { code: string; name: string }[] | null }[])
    .map((m) => {
      const p = prof.get(m.id);
      const filled = p ? FIELDS.filter((f) => p[f]).length : 0;
      return { id: m.id, name: m.display_name ?? "Tanpa nama", role: first(m.roles), nis: (p?.nis as string | undefined) ?? "", pct: Math.round((filled / FIELDS.length) * 100) };
    });
  return (
    <>
      <SchoolNav schoolId={id} active="administrasi" />
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">Administrasi</h1>
          <p className="mt-1 max-w-2xl text-ink-soft">Data induk siswa dan guru. Data ini pribadi: hanya pengelola, wali kelas siswa itu, dan pemilik datanya yang bisa membaca.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/dashboard/sekolah/${id}/administrasi/roster`} className="press inline-flex min-h-11 items-center surface px-5 font-semibold hover:border-pen">Roster (belum bergabung)</Link>
          <Link href={`/dashboard/sekolah/${id}/administrasi/surat`} className="press inline-flex min-h-11 items-center surface px-5 font-semibold hover:border-pen">Surat dan arsip</Link>
        </div>
      </header>
      {rows.length === 0 ? (
        <p className="rounded-box border border-dashed border-line p-6 text-ink-soft">Belum ada anggota.</p>
      ) : (
        <ul className="stagger border-t border-line">
          {rows.map((r, i) => (
            <li key={r.id} className="border-b border-line">
              <Link href={`/dashboard/sekolah/${id}/administrasi/${r.id}`} className="flex flex-wrap items-center justify-between gap-3 py-3 hover:text-pen">
                <span><span className="font-semibold">{r.name}</span> <span className="text-sm text-ink-soft">{r.role?.name}{r.nis ? ` · NIS ${r.nis}` : ""}</span></span>
                <span className="flex items-center gap-2 text-sm text-ink-soft">
                  <span className="h-2 w-24 overflow-hidden rounded-full border border-line bg-paper" aria-hidden="true"><span className="bar-grow block h-full bg-pen" style={{ ["--i" as string]: i, width: `${r.pct}%` }} /></span>
                  <span className="num">{r.pct}% lengkap</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

async function MyRecords({ schoolId, memberId, role }: { schoolId: string; memberId: string; role: string }) {
  const { supabase } = await getSchoolContext(schoolId);
  const [{ data: p }, { data: letters }] = await Promise.all([
    supabase.from("member_profiles").select("*").eq("member_id", memberId).maybeSingle(),
    supabase.from("letters").select("id,number,title,issued_on").eq("member_id", memberId).order("issued_on", { ascending: false }),
  ]);
  if (!["student", "teacher", "homeroom", "counselor", "parent"].includes(role)) notFound();
  const L: [string, string][] = [["NIS", "nis"], ["NISN", "nisn"], ["NIP", "nip"], ["Jenis kelamin", "gender"], ["Tempat lahir", "birth_place"], ["Tanggal lahir", "birth_date"], ["Alamat", "address"], ["Telepon", "phone"], ["Wali", "guardian_name"], ["Telepon wali", "guardian_phone"]];
  return (
    <>
      <BackLink />
      <header className="mt-3 mb-6"><h1 className="font-display text-4xl font-bold tracking-tight">Data diriku</h1><p className="mt-1 text-ink-soft">Untuk perubahan data, hubungi tata usaha.</p></header>
      {p ? (
        <dl className="grid gap-x-8 sm:grid-cols-2">
          {L.filter(([, k]) => p[k]).map(([l, k]) => <div key={k} className="flex gap-3 border-b border-line py-2"><dt className="w-28 shrink-0 text-ink-soft sm:w-32">{l}</dt><dd className="min-w-0 break-words font-semibold">{String(p[k])}</dd></div>)}
        </dl>
      ) : <p className="rounded-box border border-dashed border-line p-6 text-ink-soft">Data induk belum diisi sekolah.</p>}
      <h2 className="mt-10 font-display text-2xl font-bold tracking-tight">Surat untukku</h2>
      {(letters ?? []).length === 0 ? <p className="mt-3 text-ink-soft">Belum ada surat.</p> : (
        <ul className="mt-3 border-t border-line">
          {(letters ?? []).map((l) => <li key={l.id as string} className="border-b border-line"><Link href={`/dashboard/sekolah/${schoolId}/administrasi/surat/${l.id}`} className="flex justify-between gap-3 py-3 hover:text-pen"><span className="font-semibold">{l.title as string}</span><span className="num text-sm text-ink-soft">{l.number as string} · {l.issued_on as string}</span></Link></li>)}
        </ul>
      )}
    </>
  );
}
