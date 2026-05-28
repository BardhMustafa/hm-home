"use server";

import { revalidatePath } from "next/cache";
import {
  addToCart as addToCartLib,
  updateCartItem as updateCartItemLib,
  removeCartItem as removeCartItemLib,
} from "@/lib/cart";

export async function addToCartAction(productId: string, qty = 1) {
  await addToCartLib(productId, qty);
  revalidatePath("/cart");
  revalidatePath("/");
}

export async function updateCartItemAction(itemId: string, formData: FormData) {
  const qty = Number(formData.get("quantity") ?? 1);
  await updateCartItemLib(itemId, qty);
  revalidatePath("/cart");
}

export async function removeCartItemAction(itemId: string) {
  await removeCartItemLib(itemId);
  revalidatePath("/cart");
}
