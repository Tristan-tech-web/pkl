import { CopyButton } from "@/components/copy-button";
import { SchoolNav } from "@/components/school-nav";
import { Button, Card, ErrorNote, InfoNote, Input, Label, Select } from "@/components/ui";
import { first, getSchoolContext } from "@/lib/school";
import Link from "next/link";
import { createInvite, revokeInvite } from "../actions";

export const metadata = { title: "Anggota · EduSmart" };

type Role = { id: string; code: string; name: string };
type Member = { id: string; display_name: string | null; status: string; roles: { name: string } | { name: string }[] | null };
type Invite = {
  id: string;
  code: string;
  max_uses: number;
  used_count: number;
  expires_at: string;
  roles: { name: string } | { name: string }[] | null;
  class_groups: { name: string } | { name: string }[] | null;
};

function isInviteInactive(i: { expires_at: string; used_count: number; max_uses: number }): boolean {
  return new Date(i.expires_at).getTime() < Date.now() || i.used_count >= i.max_uses;
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });

export default async function AnggotaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; info?: string; baru?: string }>;
}) {
  const { id } = await params;
  const { error, info, baru } = await searchParams;
  const { supabase, school } = await getSchoolContext(id, { management: true });
  const [members, roles, classes, invites] = await Promise.all([
    supabase.from("school_members").select("id,display_name,status,roles(name)").eq("school_id", id).order("created_at"),
    supabase.from("roles").select("id,code,name").eq("school_id", id).neq("code", "owner").order("name"),
    supabase.from("class_groups").select("id,name").eq("school_id", id).order("name"),
    supabase
      .from("invites")
      .select("id,code,max_uses,used_count,expires_at,roles(name),class_groups(name)")
      .eq("school_id", id)
      .order("created_at", { ascending: false }),
  ]);
  const memberRows = (members.data ?? []) as unknown as Member[];
  const roleRows = (roles.data ?? []) as Role[];
  const classRows = (classes.data ?? []) as { id: string; name: string }[];
  const inviteRows = (invites.data ?? []) as unknown as Invite[];
  const add = createInvite.bind(null, id);

  return (
    <>
      <h1 className="font-display text-3xl font-bold tracking-tight">{school.name}</h1>
      <div className="mt-4" />
      <SchoolNav schoolId={id} active="anggota" />
      <div className="mb-6 flex flex-col gap-3">
        <ErrorNote message={error} />
        <InfoNote message={info} />
      </div>

      {baru ? (
        <Card className="mb-8 border-pen">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-ink-soft">Kode undangan baru</p>
          <p className="num mt-2 font-display text-4xl font-bold tracking-[0.12em]">{baru}</p>
          <p className="mt-2 text-ink-soft">Bagikan kode ini. Penerima membukanya di halaman Gabung setelah masuk atau mendaftar.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <CopyButton text={baru} label="Salin kode" />
            <CopyButton path={`/gabung?kode=${baru}`} label="Salin tautan" />
          </div>
        </Card>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <section>
          <h2 className="font-display text-2xl font-bold tracking-tight">Anggota</h2>
          <ul className="stagger mt-4 border-t border-line">
            {memberRows.map((m) => (
              <li key={m.id} className="flex items-baseline justify-between gap-4 border-b border-line py-3">
                <span className="font-semibold">{m.display_name ?? "Tanpa nama"}</span>
                <span className="text-sm text-ink-soft">{first(m.roles)?.name}</span>
              </li>
            ))}
          </ul>

          <h2 className="mt-10 font-display text-2xl font-bold tracking-tight">Undangan aktif</h2>
          {inviteRows.length === 0 ? (
            <p className="mt-3 text-ink-soft">Belum ada undangan.</p>
          ) : (
            <ul className="stagger mt-4 border-t border-line">
              {inviteRows.map((i) => {
                const expired = isInviteInactive(i);
                const revoke = revokeInvite.bind(null, id, i.id);
                return (
                  <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-3">
                    <div>
                      <p className={`num text-lg font-bold tracking-[0.1em] ${expired ? "text-ink-soft line-through" : ""}`}>{i.code}</p>
                      <p className="text-sm text-ink-soft">
                        {first(i.roles)?.name}
                        {first(i.class_groups) ? ` · ${first(i.class_groups)?.name}` : ""} · dipakai {i.used_count}/{i.max_uses} · sampai{" "}
                        {fmtDate(i.expires_at)}
                        {expired ? " (tidak berlaku)" : ""}
                      </p>
                    </div>
                    <form action={revoke}>
                      <Button type="submit" variant="ghost">
                        Cabut
                      </Button>
                    </form>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <Card className="self-start">
          <h2 className="text-lg font-bold">Buat undangan</h2>
          <Link href={`/dashboard/sekolah/${id}/anggota/impor`} className="mt-1 inline-flex min-h-11 items-center text-sm font-semibold text-pen underline">
            Atau impor banyak orang dari CSV
          </Link>
          <form action={add} className="mt-3 flex flex-col gap-4">
            <label>
              <Label>Peran</Label>
              <Select name="role_id" defaultValue={roleRows.find((r) => r.code === "teacher")?.id}>
                {roleRows.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </Select>
            </label>
            <label>
              <Label hint="khusus peran siswa">Masukkan ke rombel</Label>
              <Select name="class_group_id" defaultValue="">
                <option value="">Tanpa rombel</option>
                {classRows.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label>
                <Label>Berapa orang</Label>
                <Input name="max_uses" type="number" min={1} max={500} defaultValue={1} />
              </label>
              <label>
                <Label>Berlaku</Label>
                <Select name="days" defaultValue="14">
                  <option value="7">7 hari</option>
                  <option value="14">14 hari</option>
                  <option value="30">30 hari</option>
                  <option value="90">90 hari</option>
                </Select>
              </label>
            </div>
            <Button type="submit">Buat kode</Button>
          </form>
          <p className="mt-3 text-sm text-ink-soft">Peran pemilik tidak bisa diundang.</p>
        </Card>
      </div>
    </>
  );
}
