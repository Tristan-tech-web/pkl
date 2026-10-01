"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function submitLead(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const schoolName = String(formData.get("school_name") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  if (name.length < 2 || !email.includes("@")) {
    redirect("/?kontak=tidak-valid#kontak");
  }
  const supabase = await createClient();
  const { error } = await supabase.from("leads").insert({
    name,
    email,
    school_name: schoolName || null,
    plan_interest: "enterprise",
    message: message || null,
  });
  redirect(error ? "/?kontak=gagal#kontak" : "/?kontak=terkirim#kontak");
}
