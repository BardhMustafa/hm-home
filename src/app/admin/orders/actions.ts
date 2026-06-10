"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

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

export async function updateOrderStatus(orderId: string, formData: FormData) {
  await assertAdmin();
  const status = String(formData.get("status") ?? "");
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
    throw new Error("Invalid status");
  }
  const admin = createAdminClient();

  if (status === "cancelled") {
    // Atomic + idempotent cancel: the RPC's conditional UPDATE is the gate
    // (only the transition INTO cancelled restocks) and the restock is a
    // single set-based UPDATE. Avoids the TOCTOU + lost-update races of doing
    // this in app code. See migration 0007.
    const { error } = await admin.rpc("cancel_order_restock", {
      p_order_id: orderId,
    });
    if (error) throw new Error(error.message);
    revalidatePath("/shop");
    revalidatePath("/");
  } else {
    const { error } = await admin
      .from("orders")
      .update({ status })
      .eq("id", orderId);
    if (error) throw new Error(error.message);
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}
