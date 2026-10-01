import { notFound } from "next/navigation";
import { PrintButton } from "@/components/print-button";
import { Button } from "@/components/ui";
import { requireModule } from "@/lib/modules";
import { getSchoolContext, MANAGEMENT_ROLES } from "@/lib/school";
import { deleteLetter } from "../../actions";

export const metadata = { title: "Surat · EduSmart" };

export default async function LetterPage({ params }: { params: Promise<{ id: string; letterId: string }> }) {
  const { id, letterId } = await params;
  const { supabase, me } = await getSchoolContext(id);
  await requireModule(supabase, id, "admin_records");
  const [{ data: l }, { data: s }] = await Promise.all([
    supabase.from("letters").select("number,title,body,issued_on").eq("id", letterId).maybeSingle(),
    supabase.from("schools").select("name,city,province").eq("id", id).maybeSingle(),
  ]);
  if (!l || !s) notFound();
  const management = MANAGEMENT_ROLES.has(me.roleCode);
  const where = [s.city, s.province].filter(Boolean).join(", ");
  const date = new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" }).format(new Date(l.issued_on as string));
  return (
    <article className="report">
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <a href={`/dashboard/sekolah/${id}/administrasi${management ? "/surat" : ""}`} className="text-sm font-semibold text-pen underline">← Kembali</a>
        <div className="flex gap-3">
          <PrintButton />
          {management ? <form action={deleteLetter.bind(null, id, letterId)}><Button type="submit" variant="ghost">Hapus dari arsip</Button></form> : null}
        </div>
      </div>
      <div className="rounded-[6px] border border-line bg-card p-8 sm:p-12">
        <header className="border-b-2 border-ink pb-3 text-center">
          <p className="font-display text-2xl font-bold">{s.name as string}</p>
          {where ? <p className="text-sm text-ink-soft">{where}</p> : null}
        </header>
        <div className="mt-6 text-center">
          <h1 className="font-display text-xl font-bold underline">{(l.title as string).toUpperCase()}</h1>
          <p className="num text-sm text-ink-soft">Nomor: {l.number as string}</p>
        </div>
        <p className="mt-6 whitespace-pre-wrap leading-relaxed">{l.body as string}</p>
        <div className="mt-12 ml-auto w-64 text-center">
          <p>{where.split(",")[0] || ""}, {date}</p>
          <p>Kepala Sekolah,</p>
          <div className="h-20" />
          <p className="border-t border-ink pt-1">&nbsp;</p>
        </div>
      </div>
    </article>
  );
}
