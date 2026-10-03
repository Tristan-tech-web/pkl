import { createSchool } from "@/app/dashboard/actions";
import { Button, Card, ErrorNote, Input, Label, Select } from "@/components/ui";
import { categoryLabel } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Buat sekolah · EduSmart" };

type Form = { code: string; name: string; category: string; default_authority: string; verified: boolean };
type Pack = { code: string; name: string; version: string; verified: boolean };

export default async function NewSchoolPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const [formsRes, packsRes] = await Promise.all([
    supabase.from("education_forms").select("code,name,category,default_authority,verified").order("name"),
    supabase.from("curriculum_packs").select("code,name,version,verified").is("owner_school_id", null).order("name"),
  ]);
  const forms = (formsRes.data ?? []) as Form[];
  const packs = (packsRes.data ?? []) as Pack[];

  const grouped = new Map<string, Form[]>();
  for (const f of forms) grouped.set(f.category, [...(grouped.get(f.category) ?? []), f]);

  return (
    <>
      <h1 className="font-display text-3xl font-bold tracking-tight">Daftarkan sekolah</h1>
      <p className="mb-6 mt-1 max-w-2xl text-ink-soft">Isi yang penting dulu. Mapel, rombel, dan anggota bisa diatur setelah sekolahnya jadi, jadi tidak perlu lengkap sekarang.</p>
      <form action={createSchool} className="flex max-w-2xl flex-col gap-6">
        <ErrorNote message={error} />
        <Card className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Identitas</h2>
          <label>
            <Label>Nama sekolah</Label>
            <Input name="name" required minLength={2} maxLength={200} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <Label>Pengelola</Label>
              <Select name="authority" defaultValue="kemendikdasmen">
                <option value="kemendikdasmen">Kemendikdasmen</option>
                <option value="kemenag">Kemenag (madrasah)</option>
                <option value="lainnya">Lainnya</option>
              </Select>
            </label>
            <label>
              <Label>Status</Label>
              <Select name="ownership" defaultValue="swasta">
                <option value="swasta">Swasta</option>
                <option value="negeri">Negeri</option>
              </Select>
            </label>
            <label>
              <Label hint="opsional">Kota/kabupaten</Label>
              <Input name="city" />
            </label>
            <label>
              <Label hint="opsional">Provinsi</Label>
              <Input name="province" />
            </label>
          </div>
          <label>
            <Label hint="opsional">Nama Anda di sekolah ini</Label>
            <Input name="display_name" />
          </label>
        </Card>

        <Card className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold">Bentuk pendidikan</h2>
            <p className="text-sm text-ink-soft">
              Pilih satu atau lebih. Sekolah terpadu bisa memilih beberapa.
            </p>
          </div>
          {[...grouped.entries()].map(([category, items]) => (
            <fieldset key={category}>
              <legend className="mb-2 text-sm font-medium">{categoryLabel(category)}</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {items.map((f) => (
                  <label key={f.code} className="flex min-h-11 items-center gap-3 rounded-lg border border-line bg-card px-3">
                    <input type="checkbox" name="forms" value={f.code} className="size-5" />
                    <span>
                      {f.name}
                      {!f.verified ? (
                        <span className="ml-2 text-xs text-warn">belum diverifikasi</span>
                      ) : null}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </Card>

        <Card className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Paket kurikulum</h2>
          <label>
            <Label>Mulai dari</Label>
            <Select name="pack" defaultValue="kurmer">
              {packs.map((p) => (
                <option key={`${p.code}-${p.version}`} value={p.code}>
                  {p.name} ({p.version}){p.verified ? "" : " · draf"}
                </option>
              ))}
            </Select>
          </label>
          <p className="text-sm text-ink-soft">
            Paket bertanda “draf” belum dicek dengan sumber resmi. Sesuaikan dengan sekolah Anda nanti.
          </p>
        </Card>

        <div>
          <Button type="submit">Buat sekolah</Button>
        </div>
      </form>
    </>
  );
}
