import type { createClient } from "@/lib/supabase/server";

type Supa = Awaited<ReturnType<typeof createClient>>;

export type NodeState = "terkunci" | "dijadwalkan" | "tersedia" | "selesai";
export const NODE_KINDS = ["materi", "persiapan", "latihan", "ulang", "checkpoint", "boss", "proyek", "cerita"] as const;
export type MapNode = {
  id: string;
  code: string;
  title: string;
  summary: string | null;
  kind: string;
  position: number;
  xpReward: number;
  minutes: number | null;
  subjectId: string;
  subjectName: string;
  requires: string[];
  state: NodeState;
  stars: number;
  bestScore: number;
  attempts: number;
  unitId: string | null;
  unitTitle: string | null;
  unitPosition: number;
  opensAt: string | null;
};

const one = <T,>(v: T | T[] | null | undefined): T | null => (Array.isArray(v) ? (v[0] ?? null) : (v ?? null));

export async function loadMap(supabase: Supa, schoolId: string, memberId: string, opts: { ignoreSchedule?: boolean } = {}): Promise<MapNode[]> {
  const [nodes, prereq, prog, units, sched] = await Promise.all([
    supabase
      .from("competency_nodes")
      .select("id,code,title,summary,kind,position,xp_reward,estimated_minutes,subject_id,unit_id,school_subjects(name)")
      .eq("school_id", schoolId)
      .eq("status", "published")
      .order("position"),
    supabase.from("competency_prerequisites").select("node_id,requires_id").eq("school_id", schoolId),
    supabase.from("node_progress").select("node_id,best_score,stars,attempts,completed_at").eq("school_id", schoolId).eq("member_id", memberId),
    supabase.from("path_units").select("id,title,position").eq("school_id", schoolId),
    supabase.from("node_schedule").select("node_id,unlock_at").eq("school_id", schoolId),
  ]);
  const unitOf = new Map((units.data ?? []).map((u) => [u.id as string, { title: u.title as string, position: u.position as number }]));
  // Jadwal buka: untuk siswa RLS hanya memberi baris rombelnya; yang paling awal berlaku.
  const opens = new Map<string, string>();
  for (const r of sched.data ?? []) { const cur = opens.get(r.node_id as string); if (!cur || (r.unlock_at as string) < cur) opens.set(r.node_id as string, r.unlock_at as string); }
  const req = new Map<string, string[]>();
  for (const p of prereq.data ?? []) req.set(p.node_id as string, [...(req.get(p.node_id as string) ?? []), p.requires_id as string]);
  const done = new Map<string, { stars: number; best: number; attempts: number; completed: boolean }>();
  for (const p of prog.data ?? [])
    done.set(p.node_id as string, { stars: p.stars as number, best: p.best_score as number, attempts: p.attempts as number, completed: p.completed_at !== null });
  return (nodes.data ?? []).map((n) => {
    const requires = req.get(n.id as string) ?? [];
    const mine = done.get(n.id as string);
    const unlocked = requires.every((r) => done.get(r)?.completed);
    const opensAt = opts.ignoreSchedule ? null : opens.get(n.id as string) ?? null;
    const timeLocked = !!opensAt && new Date(opensAt).getTime() > Date.now();
    const unit = n.unit_id ? unitOf.get(n.unit_id as string) : undefined;
    return {
      id: n.id as string,
      code: n.code as string,
      title: n.title as string,
      summary: (n.summary as string | null) ?? null,
      kind: n.kind as string,
      position: n.position as number,
      xpReward: n.xp_reward as number,
      minutes: (n.estimated_minutes as number | null) ?? null,
      subjectId: n.subject_id as string,
      subjectName: one(n.school_subjects as { name: string } | { name: string }[] | null)?.name ?? "Mata pelajaran",
      requires,
      state: mine?.completed ? "selesai" : !unlocked ? "terkunci" : timeLocked ? "dijadwalkan" : "tersedia",
      stars: mine?.stars ?? 0,
      bestScore: mine?.best ?? 0,
      attempts: mine?.attempts ?? 0,
      unitId: (n.unit_id as string | null) ?? null,
      unitTitle: unit?.title ?? null,
      unitPosition: unit?.position ?? 0,
      opensAt,
    } satisfies MapNode;
  });
}

export async function loadStats(supabase: Supa, schoolId: string, memberId: string) {
  const { data } = await supabase
    .from("student_stats")
    .select("xp,level,streak,best_streak,last_activity_date")
    .eq("school_id", schoolId)
    .eq("member_id", memberId)
    .maybeSingle();
  const xp = (data?.xp as number | undefined) ?? 0;
  const level = (data?.level as number | undefined) ?? 1;
  let spent = 0;
  for (let l = 1; l < level; l++) spent += Math.floor(100 * Math.pow(l, 1.5));
  const need = Math.floor(100 * Math.pow(level, 1.5));
  return {
    xp,
    level,
    streak: (data?.streak as number | undefined) ?? 0,
    bestStreak: (data?.best_streak as number | undefined) ?? 0,
    into: xp - spent,
    need,
  };
}
