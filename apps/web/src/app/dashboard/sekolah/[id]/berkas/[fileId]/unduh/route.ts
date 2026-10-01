import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Unduh berkas: tautan bertanda tangan berumur pendek, hanya bila RLS mengizinkan membaca katalognya.
export async function GET(req: Request, { params }: { params: Promise<{ id: string; fileId: string }> }) {
  const { id, fileId } = await params;
  const supabase = await createClient();
  const { data: f } = await supabase.from("school_files").select("path,name").eq("id", fileId).eq("school_id", id).maybeSingle();
  if (!f) return new NextResponse("Tidak ditemukan", { status: 404 });
  const { data } = await supabase.storage.from("school-files").createSignedUrl(f.path as string, 60, { download: f.name as string });
  if (!data) return new NextResponse("Tidak bisa diunduh", { status: 403 });
  return NextResponse.redirect(data.signedUrl);
}
