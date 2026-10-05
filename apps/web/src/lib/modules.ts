import { notFound } from "next/navigation";
import { cache } from "react";
import type { createClient } from "@/lib/supabase/server";

type Supa = Awaited<ReturnType<typeof createClient>>;

export type ModuleInfo = { code: string; name: string; description: string; category: string; status: string; sort: number; enabled: boolean };

// Katalog modul dan isi paket sama untuk semua sekolah dan jarang berubah, jadi disimpan di memori server selama semenit.
// Hanya data umum yang disimpan di sini; pengaturan per sekolah (school_modules) selalu diambil baru.
type Catalog = { mods: { code: string; name: string; description: string; category: string; status: string; sort: number }[]; planModules: { plan_code: string; module_code: string }[] };
let catalog: { at: number; data: Catalog } | null = null;
async function loadCatalog(supabase: Supa): Promise<Catalog> {
  if (catalog && Date.now() - catalog.at < 60_000) return catalog.data;
  const [mods, pm] = await Promise.all([
    supabase.from("modules").select("code,name,description,category,status,sort").order("sort"),
    supabase.from("plan_modules").select("plan_code,module_code"),
  ]);
  const data: Catalog = { mods: (mods.data ?? []) as Catalog["mods"], planModules: (pm.data ?? []) as Catalog["planModules"] };
  if (!mods.error && !pm.error && data.mods.length > 0) catalog = { at: Date.now(), data };
  return data;
}

// Modul aktif = isi paket sekolah, dengan penimpaan per sekolah (Enterprise kustom). Satu hasil per permintaan.
export const loadModules = cache(async function loadModules(supabase: Supa, schoolId: string): Promise<{ plan: { code: string; name: string }; modules: ModuleInfo[] }> {
  const [schoolRes, cat, overrides] = await Promise.all([
    supabase.from("schools").select("plan_code,plans(code,name)").eq("id", schoolId).maybeSingle(),
    loadCatalog(supabase),
    supabase.from("school_modules").select("module_code,enabled").eq("school_id", schoolId),
  ]);
  const school = schoolRes.data;
  const planCode = (school?.plan_code as string | undefined) ?? "starter";
  const planRef = school?.plans as { code: string; name: string } | { code: string; name: string }[] | null | undefined;
  const plan = (Array.isArray(planRef) ? planRef[0] : planRef) ?? { code: planCode, name: planCode };
  const base = new Set(cat.planModules.filter((r) => r.plan_code === planCode).map((r) => r.module_code));
  const over = new Map((overrides.data ?? []).map((r) => [r.module_code as string, r.enabled as boolean]));
  return {
    plan,
    modules: cat.mods.map((m) => ({ ...m, enabled: over.get(m.code) ?? base.has(m.code) })),
  };
});

export const enabledModuleCodes = cache(async function enabledModuleCodes(supabase: Supa, schoolId: string): Promise<Set<string>> {
  const { modules } = await loadModules(supabase, schoolId);
  return new Set(modules.filter((m) => m.enabled && m.status === "tersedia").map((m) => m.code));
});

export async function requireModule(supabase: Supa, schoolId: string, code: string): Promise<void> {
  if (!(await enabledModuleCodes(supabase, schoolId)).has(code)) notFound();
}
