import { notFound, redirect } from "next/navigation";
import { QuizRunner } from "@/components/quiz-runner";
import { loadMap } from "@/lib/learning";
import { getSchoolContext } from "@/lib/school";

export const metadata = { title: "Kuis · EduSmart" };

export default async function QuizPage({ params }: { params: Promise<{ id: string; nodeId: string }> }) {
  const { id, nodeId } = await params;
  const { supabase, me } = await getSchoolContext(id);
  const map = await loadMap(supabase, id, me.memberId, { ignoreSchedule: me.roleCode !== "student" });
  const node = map.find((n) => n.id === nodeId);
  if (!node) notFound();
  if (node.state === "terkunci" || node.state === "dijadwalkan") redirect(`/dashboard/sekolah/${id}/belajar`);
  const { data } = await supabase
    .from("quiz_questions")
    .select("id,kind,prompt,options,position")
    .eq("node_id", nodeId)
    .order("position");
  const questions = (data ?? []).map((q) => ({
    id: q.id as string,
    kind: q.kind as "mcq" | "multi" | "short",
    prompt: q.prompt as string,
    options: (q.options as string[]) ?? [],
  }));
  if (questions.length === 0) redirect(`/dashboard/sekolah/${id}/belajar/${nodeId}`);
  return <QuizRunner schoolId={id} nodeId={nodeId} title={node.title} questions={questions} nextHref={`/dashboard/sekolah/${id}/belajar`} lessonHref={`/dashboard/sekolah/${id}/belajar/${nodeId}`} />;
}
