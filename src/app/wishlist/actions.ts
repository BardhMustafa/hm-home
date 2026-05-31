"use server";

import { revalidatePath } from "next/cache";
import { toggleWishlist } from "@/lib/wishlist";

export async function toggleWishlistAction(
  productId: string,
): Promise<{ wishlisted: boolean; error?: string }> {
  try {
    const result = await toggleWishlist(productId);
    revalidatePath("/");
    revalidatePath("/shop");
    return result;
  } catch (e) {
    return {
      wishlisted: false,
      error: e instanceof Error ? e.message : "Gabim i panjohur.",
    };
  }
}
