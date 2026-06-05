"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const STATUSES = ["new", "confirmed", "done", "cancelled"] as const;

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") throw new Error("Forbidden");
}

export async function updateVisitStatus(id: string, status: string) {
  await assertAdmin();
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
    throw new Error("Invalid status");
  }
  const admin = createAdminClient();
  await admin.from("visit_requests").update({ status }).eq("id", id);
  revalidatePath("/admin/visits");
}

export async function deleteVisit(id: string) {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("visit_requests").delete().eq("id", id);
  revalidatePath("/admin/visits");
}
