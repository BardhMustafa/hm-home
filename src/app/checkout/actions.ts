"use server";

import "server-only";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCart } from "@/lib/cart";
import { grantOrderAccess } from "@/lib/order-access";
import { isValidPhone } from "@/lib/phone";
import { isHoneypotTripped } from "@/lib/honeypot";
import { getClientIp, checkRateLimit } from "@/lib/anti-abuse";
import { sendOrderEmails } from "@/lib/email";

const checkoutSchema = z.object({
  full_name: z.string().trim().min(2),
  email: z.string().email(),
  phone: z
    .string()
    .trim()
    .refine(isValidPhone, "Numri i telefonit nuk është valid."),
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
  // Honeypot: a real user can't fill a field they can't see. Reject quietly
  // with a generic error (don't reveal the trap).
  if (isHoneypotTripped(formData)) {
    return { error: "Porosia dështoi. Provoni përsëri." };
  }

  // Rate limit per IP — no payment friction means nothing else caps order
  // volume. Fails open if the IP is unknown (local dev) or the limiter errors.
  const ip = await getClientIp();
  if (ip && !(await checkRateLimit(`order:${ip}`, 8, 3600))) {
    return { error: "Keni dërguar shumë porosi. Provoni më vonë." };
  }

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

  // Resolve the cart server-side; never trust prices/quantities from the form.
  const cart = await getCart();
  if (!cart.cartId || cart.lines.length === 0) {
    return { error: "Shporta juaj është bosh." };
  }

  const idempotencyKey =
    String(formData.get("idempotency_key") ?? "").trim() || null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Atomic, transactional placement: stock is decremented under a row lock,
  // prices are taken live, and the cart is cleared — all or nothing. The
  // idempotency key makes a double-submit return the same order instead of
  // creating a second one. See supabase/migrations/0004_audit_fixes.sql.
  const admin = createAdminClient();
  const { data: orderId, error } = await admin.rpc("place_order", {
    p_cart_id: cart.cartId,
    p_user_id: user?.id ?? null,
    p_guest_email: user ? null : parsed.data.email,
    p_full_name: parsed.data.full_name,
    p_phone: parsed.data.phone,
    p_country: parsed.data.country,
    p_city: parsed.data.city,
    p_address: parsed.data.address,
    p_postal_code: parsed.data.postal_code,
    p_notes: parsed.data.notes,
    p_idempotency_key: idempotencyKey,
  });

  if (error) {
    const msg = error.message ?? "";
    if (msg.includes("OUT_OF_STOCK")) {
      const name = msg.split("OUT_OF_STOCK:")[1]?.trim();
      return {
        error: name
          ? `Stoku i pamjaftueshëm për ${name}. Rifresko shportën.`
          : "Stok i pamjaftueshëm. Rifresko shportën.",
      };
    }
    if (msg.includes("CART_EMPTY") || msg.includes("CART_NOT_FOUND")) {
      return { error: "Shporta juaj është bosh." };
    }
    return { error: "Porosia dështoi. Provoni përsëri." };
  }
  if (!orderId) return { error: "Porosia dështoi. Provoni përsëri." };

  // Let this browser view the receipt without exposing it to others.
  await grantOrderAccess(orderId as string);

  // Notify the owner (so they phone the customer) and confirm to the customer.
  // Built from the server-resolved cart snapshot captured before placement —
  // place_order clears the cart, but `cart` is still in memory here. Best-effort
  // and awaited so it runs before the redirect, but never throws.
  await sendOrderEmails({
    orderId: orderId as string,
    fullName: parsed.data.full_name,
    phone: parsed.data.phone,
    email: parsed.data.email,
    address: parsed.data.address,
    city: parsed.data.city,
    country: parsed.data.country,
    notes: parsed.data.notes,
    lines: cart.lines.map((l) => ({
      name: l.name,
      quantity: l.quantity,
      line_total: l.line_total,
    })),
    total: cart.subtotal,
  });

  revalidatePath("/", "layout");
  redirect(`/checkout/success/${orderId}`);
}
