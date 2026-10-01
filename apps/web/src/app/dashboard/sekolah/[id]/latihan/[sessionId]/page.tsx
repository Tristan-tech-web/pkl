import { PracticeRunner } from "@/components/practice-runner";
import { getSchoolContext } from "@/lib/school";
import { practiceNext } from "../actions";

export const metadata = { title: "Sesi latihan · EduSmart" };

export default async function PracticeSession({ params }: { params: Promise<{ id: string; sessionId: string }> }) {
  const { id, sessionId } = await params;
  const { supabase } = await getSchoolContext(id);
  const { data: ses } = await supabase.from("practice_sessions").select("camera").eq("id", sessionId).maybeSingle();
  const initial = await practiceNext(id, sessionId);
  return (
    <>
      <a href={`/dashboard/sekolah/${id}/latihan`} className="back-link text-sm font-semibold text-pen underline">← Latihan</a>
      <div className="mt-4"><PracticeRunner schoolId={id} sessionId={sessionId} backHref={`/dashboard/sekolah/${id}/latihan`} initial={initial} camera={ses?.camera === true} /></div>
    </>
  );
}
