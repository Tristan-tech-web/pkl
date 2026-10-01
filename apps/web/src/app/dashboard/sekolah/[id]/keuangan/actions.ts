"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireModule } from "@/lib/modules";
import { getSchoolContext } from "@/lib/school";

const q = encodeURIComponent;
const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const page = (id: string) => `/dashboard/sekolah/${id}/keuangan`;

export async function issueInvoices(schoolId: string, formData: FormData) {
  const { supabase, me } = await getSchoolContext(schoolId, { management: true });
  await requireModule(supabase, schoolId, "fees");
  const title = str(formData, "title");
  const amount = Math.round(Number(str(formData, "amount").replace(/[.\s]/g, "").replace(",", ".")));
  const due = str(formData, "due_on") || null;
  const target = str(formData, "target");
  if (title.length < 3 || !Number.isFinite(amount) || amount <= 0 || amount > 1_000_000_000) redirect(`${page(schoolId)}?error=${q("Isi judul dan jumlah (angka positif).")}`);
  let ids: string[] = [];
  if (target === "semua") {
    const { data } = await supabase.from("school_members").select("id,roles!inner(code)").eq("school_id", schoolId).eq("status", "active").eq("roles.code", "student");
    ids = (data ?? []).map((r) => r.id as string);
  } else {
    const { data } = await supabase.from("class_group_students").select("member_id").eq("school_id", schoolId).eq("class_group_id", target);
    ids = (data ?? []).map((r) => r.member_id as string);
  }
  if (ids.length === 0) redirect(`${page(schoolId)}?error=${q("Tidak ada siswa pada sasaran itu.")}`);
  const { error } = await supabase.from("invoices").insert(ids.map((member_id) => ({ school_id: schoolId, member_id, title, amount, due_on: due, created_by: me.memberId })));
  if (error) redirect(`${page(schoolId)}?error=${q("Tagihan belum bisa diterbitkan.")}`);
  revalidatePath(page(schoolId));
  redirect(`${page(schoolId)}?info=${q(`${ids.length} tagihan diterbitkan.`)}`);
}

export async function recordPayment(schoolId: string, invoiceId: string, formData: FormData) {
  const { supabase, me } = await getSchoolContext(schoolId, { management: true });
  await requireModule(supabase, schoolId, "fees");
  const amount = Math.round(Number(str(formData, "amount").replace(/[.\s]/g, "").replace(",", ".")));
  const method = str(formData, "method");
  if (!Number.isFinite(amount) || amount <= 0 || !["tunai", "transfer", "lainnya"].includes(method)) redirect(`${page(schoolId)}?error=${q("Isi jumlah dan cara bayar dengan benar.")}`);
  const { error } = await supabase.from("payments").insert({ school_id: schoolId, invoice_id: invoiceId, amount, method, note: str(formData, "note").slice(0, 200) || null, recorded_by: me.memberId });
  if (error) redirect(`${page(schoolId)}?error=${q("Pembayaran belum bisa dicatat.")}`);
  revalidatePath(page(schoolId));
  redirect(`${page(schoolId)}?info=${q("Pembayaran dicatat.")}`);
}

export async function cancelInvoice(schoolId: string, invoiceId: string) {
  const { supabase } = await getSchoolContext(schoolId, { management: true });
  await supabase.from("invoices").update({ status: "dibatalkan" }).eq("id", invoiceId).eq("school_id", schoolId);
  revalidatePath(page(schoolId));
  redirect(`${page(schoolId)}?info=${q("Tagihan dibatalkan.")}`);
}
