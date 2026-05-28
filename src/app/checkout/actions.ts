"use server";

import "server-only";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCart, clearCart } from "@/lib/cart";

const SHIPPING_FLAT = 0; // free shipping placeholder

const checkoutSchema = z.object({
  full_name: z.string().trim().min(2),
  email: z.string().email(),
  phone: z.string().trim().min(5),
  country: z.string().trim().min(2),
  city: z.string().trim().min(2),
  address: z.string().trim().min(3),
  postal_code: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
});

export type CheckoutState =
  | { error?: string; fieldErrors?: Record<string, string> }
  | undefined;

export async function placeOrder(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const parsed = checkoutSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    country: formData.get("country"),
    city: formData.get("city"),
    address: formData.get("address"),
    postal_code: formData.get("postal_code") || null,
    notes: formData.get("notes") || null,
  });
  if (!parsed.success) {
    return {
      error: "Disa fusha janë të pavlefshme.",
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((i) => [i.path.join("."), i.message]),
      ),
    };
  }

  // Pull the current cart server-side so we never trust prices/quantities
  // from the form.
  const cart = await getCart();
  if (!cart.cartId || cart.lines.length === 0) {
    return { error: "Shporta juaj është bosh." };
  }

  const admin = createAdminClient();

  // Re-validate stock + prices against the live products table. If a price
  // moved or stock dropped between cart-add and checkout, refuse the order
  // and let the user re-confirm.
  const productIds = cart.lines.map((l) => l.product_id);
  const { data: live } = await admin
    .from("products")
    .select("id, price, discount_price, stock, name")
    .in("id", productIds);
  const byId = new Map((live ?? []).map((p) => [p.id, p]));

  for (const line of cart.lines) {
    const p = byId.get(line.product_id);
    if (!p) return { error: `${line.name} nuk është më në dispozicion.` };
    if (p.stock < line.quantity) {
      return {
        error: `Stoku i pamjaftueshëm për ${p.name} (mbeten ${p.stock}).`,
      };
    }
    const livePrice =
      typeof p.discount_price === "number" && p.discount_price < Number(p.price)
        ? Number(p.discount_price)
        : Number(p.price);
    if (livePrice !== line.price) {
      return {
        error: `Çmimi i ${p.name} ka ndryshuar. Rifresko shportën.`,
      };
    }
  }

  const subtotal = cart.lines.reduce((s, l) => s + l.line_total, 0);
  const total = subtotal + SHIPPING_FLAT;

  // Resolve the auth user (if any) so we set user_id rather than just
  // guest_email when an authed user checks out.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      user_id: user?.id ?? null,
      guest_email: user ? null : parsed.data.email,
      status: "pending",
      subtotal,
      shipping_cost: SHIPPING_FLAT,
      total,
      full_name: parsed.data.full_name,
      phone: parsed.data.phone,
      country: parsed.data.country,
      city: parsed.data.city,
      address: parsed.data.address,
      postal_code: parsed.data.postal_code,
      notes: parsed.data.notes,
    })
    .select("id")
    .single();
  if (orderError) return { error: orderError.message };

  const { error: itemsError } = await admin.from("order_items").insert(
    cart.lines.map((l) => ({
      order_id: order.id,
      product_id: l.product_id,
      product_name: l.name,
      price: l.price,
      quantity: l.quantity,
    })),
  );
  if (itemsError) {
    // Best-effort rollback. Without a transactional client this leaves a
    // potentially-empty order row — admins can clean those up.
    await admin.from("orders").delete().eq("id", order.id);
    return { error: itemsError.message };
  }

  // Decrement stock. Sequential to keep each update's read-modify-write
  // consistent; small line counts mean this is cheap. For true atomicity
  // we'd push this into a SQL function.
  for (const line of cart.lines) {
    const p = byId.get(line.product_id)!;
    await admin
      .from("products")
      .update({ stock: p.stock - line.quantity })
      .eq("id", line.product_id);
  }

  await clearCart(cart.cartId);

  // TODO: send order confirmation email via Resend.

  revalidatePath("/", "layout");
  redirect(`/checkout/success/${order.id}`);
}
