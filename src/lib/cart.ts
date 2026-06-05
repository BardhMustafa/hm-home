// Cart helpers. Guests are identified by a long-lived `hm_session` cookie
// set server-side; authed users are identified by their auth.uid().
// All DB writes go through the service-role client so guest carts (which
// have no auth.uid()) work the same as authed ones.
import "server-only";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdmin } from "@/lib/supabase/env";

const SESSION_COOKIE = "hm_session";

export type CartLine = {
  cart_item_id: string;
  product_id: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  image_url: string | null;
  stock: number | null;
  line_total: number;
};

export type CartSnapshot = {
  cartId: string | null;
  lines: CartLine[];
  subtotal: number;
  itemCount: number;
};

// Resolve the current cart identifier — either user_id (authed) or
// session_id (guest). For guests, lazily mint a session_id cookie on first
// write so reads stay side-effect-free.
async function currentIdentity(): Promise<{
  userId: string | null;
  sessionId: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) return { userId: user.id, sessionId: null };

  const jar = await cookies();
  const sid = jar.get(SESSION_COOKIE)?.value ?? null;
  return { userId: null, sessionId: sid };
}

async function ensureGuestSession(): Promise<string> {
  const jar = await cookies();
  let sid = jar.get(SESSION_COOKIE)?.value;
  if (!sid) {
    sid = randomUUID();
    jar.set(SESSION_COOKIE, sid, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 90, // 90 days
      path: "/",
    });
  }
  return sid;
}

// Look up the cart row matching the current identity. Returns null if the
// guest has no session cookie yet (i.e. nothing has been added).
async function findCartRow(): Promise<{ id: string } | null> {
  const { userId, sessionId } = await currentIdentity();
  const admin = createAdminClient();

  if (userId) {
    const { data } = await admin
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    return data ?? null;
  }
  if (sessionId) {
    const { data } = await admin
      .from("carts")
      .select("id")
      .eq("session_id", sessionId)
      .maybeSingle();
    return data ?? null;
  }
  return null;
}

// Find-or-create. Mints a guest session cookie if needed. Use from writes.
async function getOrCreateCart(): Promise<{ id: string }> {
  const existing = await findCartRow();
  if (existing) return existing;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const admin = createAdminClient();

  if (user) {
    const { data, error } = await admin
      .from("carts")
      .insert({ user_id: user.id })
      .select("id")
      .single();
    // A parallel add may have created the row between findCartRow() and this
    // insert; the partial unique index rejects the duplicate (23505) — fall
    // back to the row that won the race instead of throwing.
    if (error) {
      if (error.code === "23505") {
        const raced = await findCartRow();
        if (raced) return raced;
      }
      throw error;
    }
    return data;
  }

  const sid = await ensureGuestSession();
  const { data, error } = await admin
    .from("carts")
    .insert({ session_id: sid })
    .select("id")
    .single();
  if (error) {
    if (error.code === "23505") {
      const raced = await findCartRow();
      if (raced) return raced;
    }
    throw error;
  }
  return data;
}

// Read-only snapshot for the cart page + header badge.
export async function getCart(): Promise<CartSnapshot> {
  if (!hasSupabaseAdmin()) {
    return { cartId: null, lines: [], subtotal: 0, itemCount: 0 };
  }
  const cart = await findCartRow();
  if (!cart) {
    return { cartId: null, lines: [], subtotal: 0, itemCount: 0 };
  }

  const admin = createAdminClient();
  const { data: items } = await admin
    .from("cart_items")
    .select(
      "id, quantity, product:products(id, name, slug, price, discount_price, stock, images:product_images(image_url, position))",
    )
    .eq("cart_id", cart.id);

  const lines: CartLine[] = (items ?? [])
    .map((it) => {
      // Same to-one shape oddity as elsewhere.
      const p = Array.isArray(it.product) ? it.product[0] : it.product;
      if (!p) return null;
      const price =
        typeof p.discount_price === "number" && p.discount_price < Number(p.price)
          ? Number(p.discount_price)
          : Number(p.price);
      const cover = [...(p.images ?? [])].sort(
        (a, b) => a.position - b.position,
      )[0];
      return {
        cart_item_id: it.id,
        product_id: p.id,
        name: p.name,
        slug: p.slug,
        price,
        quantity: it.quantity,
        image_url: cover?.image_url ?? null,
        stock: p.stock,
        line_total: price * it.quantity,
      };
    })
    .filter((x): x is CartLine => x !== null);

  const subtotal = lines.reduce((s, l) => s + l.line_total, 0);
  const itemCount = lines.reduce((s, l) => s + l.quantity, 0);
  return { cartId: cart.id, lines, subtotal, itemCount };
}

// Mutations -----------------------------------------------------

export async function addToCart(productId: string, qty = 1): Promise<void> {
  qty = Math.floor(qty);
  if (!Number.isFinite(qty) || qty <= 0) return;
  const admin = createAdminClient();

  // Validate the product exists + has stock before touching the cart.
  const { data: product } = await admin
    .from("products")
    .select("id, stock")
    .eq("id", productId)
    .maybeSingle();
  if (!product) throw new Error("Produkti nuk ekziston.");

  const cart = await getOrCreateCart();

  // Upsert by (cart_id, product_id) so re-adding bumps quantity.
  const { data: existing } = await admin
    .from("cart_items")
    .select("id, quantity")
    .eq("cart_id", cart.id)
    .eq("product_id", productId)
    .maybeSingle();

  const newQty = (existing?.quantity ?? 0) + qty;
  const nextQty = product.stock === null ? newQty : Math.min(product.stock, newQty);
  // stock === 0 (sold out) clamps to 0; never write a non-positive quantity
  // (the DB CHECK (quantity > 0) would reject it).
  if (nextQty <= 0) return;
  if (existing) {
    await admin
      .from("cart_items")
      .update({ quantity: nextQty })
      .eq("id", existing.id);
  } else {
    await admin
      .from("cart_items")
      .insert({ cart_id: cart.id, product_id: productId, quantity: nextQty });
  }
}

export async function updateCartItem(
  itemId: string,
  qty: number,
): Promise<void> {
  // Ownership: only act on items in the caller's own cart. Without this the
  // service-role client would let anyone edit any cart line by id.
  const cart = await findCartRow();
  if (!cart) return;
  const admin = createAdminClient();

  qty = Math.floor(qty);
  if (!Number.isFinite(qty) || qty <= 0) {
    await admin
      .from("cart_items")
      .delete()
      .eq("id", itemId)
      .eq("cart_id", cart.id);
    return;
  }

  // Cap by stock so the cart can't outpace inventory.
  const { data: item } = await admin
    .from("cart_items")
    .select("id, product:products(stock)")
    .eq("id", itemId)
    .eq("cart_id", cart.id)
    .maybeSingle();
  if (!item) return; // not found or not owned by this cart

  const stock = (() => {
    const p = item.product as
      | { stock: number | null }
      | { stock: number | null }[]
      | null
      | undefined;
    if (!p) return null;
    const s = Array.isArray(p) ? p[0]?.stock : p.stock;
    return s ?? null; // null = made-to-order, no cap
  })();
  const capped = stock === null ? qty : Math.min(qty, stock);
  if (capped <= 0) {
    await admin.from("cart_items").delete().eq("id", item.id);
    return;
  }
  await admin.from("cart_items").update({ quantity: capped }).eq("id", item.id);
}

export async function removeCartItem(itemId: string): Promise<void> {
  // Ownership-scoped delete — see updateCartItem.
  const cart = await findCartRow();
  if (!cart) return;
  const admin = createAdminClient();
  await admin
    .from("cart_items")
    .delete()
    .eq("id", itemId)
    .eq("cart_id", cart.id);
}

// Called from the login server action after a successful sign-in: if the
// browser had a guest cart, fold its items into the user's cart and
// retire the guest row.
export async function mergeGuestCartOnLogin(userId: string): Promise<void> {
  const jar = await cookies();
  const sid = jar.get(SESSION_COOKIE)?.value;
  if (!sid) return;

  const admin = createAdminClient();
  const { data: guestCart } = await admin
    .from("carts")
    .select("id")
    .eq("session_id", sid)
    .maybeSingle();
  if (!guestCart) return;

  const { data: userCart } = await admin
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!userCart) {
    // No prior user cart — just reassign the guest cart to the user.
    await admin
      .from("carts")
      .update({ user_id: userId, session_id: null })
      .eq("id", guestCart.id);
  } else {
    // Merge: for each guest line, add quantity to the matching user line
    // or insert if absent. SQL upsert would be cleaner but PostgREST's
    // unique-key conflict resolution doesn't let us increment, so do it
    // in JS — cart lines are typically <10.
    const { data: guestLines } = await admin
      .from("cart_items")
      .select("product_id, quantity")
      .eq("cart_id", guestCart.id);
    const { data: userLines } = await admin
      .from("cart_items")
      .select("id, product_id, quantity")
      .eq("cart_id", userCart.id);
    const userByProduct = new Map(
      (userLines ?? []).map((l) => [l.product_id, l]),
    );

    // Look up live stock so merged quantities can't exceed inventory.
    const productIds = [...new Set((guestLines ?? []).map((g) => g.product_id))];
    const { data: stocks } = productIds.length
      ? await admin.from("products").select("id, stock").in("id", productIds)
      : { data: [] };
    const stockById = new Map(
      (stocks ?? []).map((p) => [p.id, p.stock as number | null]),
    );
    const cap = (productId: string, qty: number) => {
      const stock = stockById.get(productId);
      return stock === null || stock === undefined ? qty : Math.min(qty, stock);
    };

    for (const g of guestLines ?? []) {
      const existing = userByProduct.get(g.product_id);
      if (existing) {
        const merged = cap(g.product_id, existing.quantity + g.quantity);
        if (merged <= 0) continue;
        await admin
          .from("cart_items")
          .update({ quantity: merged })
          .eq("id", existing.id);
      } else {
        const merged = cap(g.product_id, g.quantity);
        if (merged <= 0) continue;
        await admin
          .from("cart_items")
          .insert({
            cart_id: userCart.id,
            product_id: g.product_id,
            quantity: merged,
          });
      }
    }
    await admin.from("carts").delete().eq("id", guestCart.id);
  }

  // Drop the cookie — the guest cart concept is over for this browser.
  jar.delete(SESSION_COOKIE);
}
