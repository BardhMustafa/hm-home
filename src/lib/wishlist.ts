import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdmin } from "@/lib/supabase/env";
import type { ProductCardData } from "@/components/home/product-card";

async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function toggleWishlist(
  productId: string,
): Promise<{ wishlisted: boolean }> {
  const userId = await getCurrentUserId();
  if (!userId)
    throw new Error("Duhet të jeni i kyçur për të shtuar në të preferuara.");

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("wishlists")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    await admin.from("wishlists").delete().eq("id", existing.id);
    return { wishlisted: false };
  } else {
    await admin
      .from("wishlists")
      .insert({ user_id: userId, product_id: productId });
    return { wishlisted: true };
  }
}

export async function getWishlistedIds(): Promise<Set<string>> {
  if (!hasSupabaseAdmin()) return new Set();
  const userId = await getCurrentUserId();
  if (!userId) return new Set();

  const admin = createAdminClient();
  const { data } = await admin
    .from("wishlists")
    .select("product_id")
    .eq("user_id", userId);

  return new Set((data ?? []).map((r) => r.product_id));
}

export async function getWishlistProducts(): Promise<ProductCardData[]> {
  if (!hasSupabaseAdmin()) return [];
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const admin = createAdminClient();
  const { data } = await admin
    .from("wishlists")
    .select(
      "product:products(id, name, slug, price, discount_price, stock, category:categories(name), images:product_images(image_url, position))",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (!data) return [];

  return data.flatMap((row) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = row.product as any;
    if (!p) return [];
    const images: { image_url: string; position: number }[] = p.images ?? [];
    const first = [...images].sort((a, b) => a.position - b.position)[0];
    const cat = Array.isArray(p.category) ? p.category[0]?.name : p.category?.name;
    const hasDiscount = typeof p.discount_price === "number" && p.discount_price < Number(p.price);
    return [{
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: cat ?? "HM Home",
      price: hasDiscount ? Number(p.discount_price) : Number(p.price),
      was: hasDiscount ? Number(p.price) : null,
      badge: hasDiscount ? "sale" : null,
      image: first?.image_url ?? null,
      stock: p.stock ?? null,
    } satisfies ProductCardData];
  });
}
