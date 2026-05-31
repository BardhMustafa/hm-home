import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdmin } from "@/lib/supabase/env";

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
