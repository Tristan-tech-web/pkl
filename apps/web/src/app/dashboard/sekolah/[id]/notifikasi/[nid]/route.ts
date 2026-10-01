import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Membuka notifikasi: tandai dibaca lalu arahkan ke tujuannya (hanya jalur internal /dashboard/).
export async function GET(req: Request, { params }: { params: Promise<{ id: string; nid: string }> }) {
  const { id, nid } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", nid).eq("school_id", id).select("link").maybeSingle();
  const link = (data?.link as string | null) ?? "";
  const target = link.startsWith("/dashboard/") && !link.startsWith("//") ? link : `/dashboard/sekolah/${id}/notifikasi`;
  return NextResponse.redirect(new URL(target, req.url));
}
