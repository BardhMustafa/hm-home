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

  // Detect a transition INTO cancelled so we restore the reserved stock
  // exactly once (re-cancelling an already-cancelled order is a no-op).
  const { data: current } = await admin
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .maybeSingle();
  if (!current) throw new Error("Order not found");
  const becomingCancelled =
    status === "cancelled" && current.status !== "cancelled";

  await admin.from("orders").update({ status }).eq("id", orderId);

  if (becomingCancelled) {
    // Return the reserved units to inventory for items whose product still
    // exists and tracks stock (NULL stock = made-to-order, never decremented).
    const { data: items } = await admin
      .from("order_items")
      .select("product_id, quantity")
      .eq("order_id", orderId);
    for (const it of items ?? []) {
      if (!it.product_id) continue;
      const { data: p } = await admin
        .from("products")
        .select("stock")
        .eq("id", it.product_id)
        .maybeSingle();
      if (p && p.stock !== null) {
        await admin
          .from("products")
          .update({ stock: p.stock + it.quantity })
          .eq("id", it.product_id);
      }
    }
    revalidatePath("/shop");
    revalidatePath("/");
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}
