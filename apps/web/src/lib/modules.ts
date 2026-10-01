import { notFound } from "next/navigation";
import type { createClient } from "@/lib/supabase/server";

type Supa = Awaited<ReturnType<typeof createClient>>;

export type ModuleInfo = { code: string; name: string; description: string; category: string; status: string; sort: number; enabled: boolean };

// Modul aktif = isi paket sekolah, dengan penimpaan per sekolah (Enterprise kustom).
export async function loadModules(supabase: Supa, schoolId: string): Promise<{ plan: { code: string; name: string }; modules: ModuleInfo[] }> {
  const { data: school } = await supabase.from("schools").select("plan_code,plans(code,name)").eq("id", schoolId).maybeSingle();
  const planCode = (school?.plan_code as string | undefined) ?? "starter";
  const planRef = school?.plans as { code: string; name: string } | { code: string; name: string }[] | null | undefined;
  const plan = (Array.isArray(planRef) ? planRef[0] : planRef) ?? { code: planCode, name: planCode };
  const [mods, inPlan, overrides] = await Promise.all([
    supabase.from("modules").select("code,name,description,category,status,sort").order("sort"),
    supabase.from("plan_modules").select("module_code").eq("plan_code", planCode),
    supabase.from("school_modules").select("module_code,enabled").eq("school_id", schoolId),
  ]);
  const base = new Set((inPlan.data ?? []).map((r) => r.module_code as string));
  const over = new Map((overrides.data ?? []).map((r) => [r.module_code as string, r.enabled as boolean]));
  return {
    plan,
    modules: (mods.data ?? []).map((m) => ({
      code: m.code as string, name: m.name as string, description: m.description as string,
      category: m.category as string, status: m.status as string, sort: m.sort as number,
      enabled: over.get(m.code as string) ?? base.has(m.code as string),
    })),
  };
}

export async function enabledModuleCodes(supabase: Supa, schoolId: string): Promise<Set<string>> {
  const { modules } = await loadModules(supabase, schoolId);
  return new Set(modules.filter((m) => m.enabled && m.status === "tersedia").map((m) => m.code));
}

export async function requireModule(supabase: Supa, schoolId: string, code: string): Promise<void> {
  if (!(await enabledModuleCodes(supabase, schoolId)).has(code)) notFound();
}
