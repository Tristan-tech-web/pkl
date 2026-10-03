import { notFound } from "next/navigation";
import { Empty } from "@/components/empty";
import { BackLink } from "@/components/role-views";
import { LinkButton } from "@/components/ui";
import { ParabolaDemo } from "@/components/parabola-demo";
import { TutorChat } from "@/components/tutor-chat";
import { Stars } from "@/components/stars";
import { loadMap } from "@/lib/learning";
import { enabledModuleCodes } from "@/lib/modules";
import { Markdown } from "@/lib/md";
import { getSchoolContext } from "@/lib/school";

export const metadata = { title: "Pelajaran · EduSmart" };

export default async function LessonPage({ params }: { params: Promise<{ id: string; nodeId: string }> }) {
  const { id, nodeId } = await params;
  const { supabase, me } = await getSchoolContext(id);
  const [map, mods] = await Promise.all([loadMap(supabase, id, me.memberId, { ignoreSchedule: me.roleCode !== "student" }), enabledModuleCodes(supabase, id)]);
  const node = map.find((n) => n.id === nodeId);
  if (!node) notFound();
  const [{ data: lesson }, { count }] = await Promise.all([
    supabase.from("lessons").select("body_md,objectives,visual_module").eq("node_id", nodeId).maybeSingle(),
    supabase.from("quiz_questions").select("id", { count: "exact", head: true }).eq("node_id", nodeId),
  ]);
  const back = `/dashboard/sekolah/${id}/belajar`;
  const locked = node.state === "terkunci" || node.state === "dijadwalkan";
  const objectives = (lesson?.objectives as string[] | undefined) ?? [];

  return (
    <article>
      <a href={back} className="text-sm font-semibold text-pen underline">
        ← Peta belajar
      </a>
      <header className="mt-3 mb-6">
        <p className="num text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">{node.subjectName} · {node.code}</p>
        <h1 className="mt-1 font-display text-4xl font-bold tracking-tight">{node.title}</h1>
        {node.state === "selesai" ? (
          <p className="mt-2 flex items-center gap-2 text-ink-soft">
            <Stars n={node.stars} /> nilai terbaik <span className="num font-semibold text-ink">{node.bestScore}</span>
          </p>
        ) : null}
      </header>
      {locked ? (
        <Empty>
          {node.state === "dijadwalkan" && node.opensAt ? (
            <>Materi ini terbuka <span className="font-semibold text-ink">{new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(new Date(node.opensAt))} WIB</span>, supaya kamu belajarnya pas sebelum pelajaran di kelas.</>
          ) : "Materi ini masih terkunci. Selesaikan dulu materi sebelumnya di peta belajar, nanti terbuka sendiri."}
        </Empty>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div>
            {objectives.length ? (
              <div className="mb-6 surface p-4">
                <p className="text-sm font-semibold">Setelah ini kamu bisa:</p>
                <ul className="mt-1 list-disc pl-5 text-ink-soft">
                  {objectives.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <Markdown source={(lesson?.body_md as string | undefined) ?? "Guru belum menulis materi."} />
          </div>
          <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            {lesson?.visual_module === "parabola" ? <ParabolaDemo hero={false} /> : null}
            {me.roleCode === "student" && mods.has("ai_tutor") ? <TutorChat schoolId={id} nodeId={nodeId} /> : null}
          </div>
        </div>
      )}
      {!locked ? (
        <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-line pt-6">
          {(count ?? 0) > 0 && node.state !== "selesai" ? <p className="w-full font-display text-xl font-bold">Sudah paham? Buktikan lewat kuis.</p> : null}
          {(count ?? 0) > 0 ? (
            <>
              <LinkButton href={`${back}/${nodeId}/kuis`}>{node.state === "selesai" ? "Ulangi kuis" : "Mulai kuis"}</LinkButton>
              <p className="text-ink-soft">
                <span className="num">{count}</span> soal · hadiah sampai <span className="num">+{Math.round(node.xpReward * 1.25)}</span> XP
              </p>
            </>
          ) : (
            <p className="text-ink-soft">Soal belum tersedia.</p>
          )}
        </div>
      ) : null}
      <div className="mt-6 sm:hidden">
        <BackLink />
      </div>
    </article>
  );
}
