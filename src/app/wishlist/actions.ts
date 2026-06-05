"use server";

import { revalidatePath } from "next/cache";
import { toggleWishlist } from "@/lib/wishlist";

export async function toggleWishlistAction(
  productId: string,
): Promise<{ wishlisted: boolean; error?: string; requiresAuth?: boolean }> {
  try {
    const result = await toggleWishlist(productId);
    revalidatePath("/");
    revalidatePath("/shop");
    return result;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Gabim i panjohur.";
    if (message === "AUTH_REQUIRED") {
      return { wishlisted: false, requiresAuth: true };
    }
    return { wishlisted: false, error: message };
  }
}
