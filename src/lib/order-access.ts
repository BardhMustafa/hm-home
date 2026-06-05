// Grants the buyer's browser permission to view a specific order's receipt.
// Orders are addressable by id, so the success page must not render PII for
// an arbitrary id. Authenticated buyers are matched by user_id; guests (who
// have no auth.uid) are matched against this httpOnly cookie, which lists the
// order ids placed from this browser.
import "server-only";
import { cookies } from "next/headers";

const COOKIE = "hm_orders";
const MAX_IDS = 20;
const NINETY_DAYS = 60 * 60 * 24 * 90;

export async function grantOrderAccess(orderId: string): Promise<void> {
  const jar = await cookies();
  const current = (jar.get(COOKIE)?.value ?? "").split(",").filter(Boolean);
  const next = [orderId, ...current.filter((id) => id !== orderId)].slice(
    0,
    MAX_IDS,
  );
  jar.set(COOKIE, next.join(","), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: NINETY_DAYS,
    path: "/",
  });
}

export async function hasGuestOrderAccess(orderId: string): Promise<boolean> {
  const jar = await cookies();
  const ids = (jar.get(COOKIE)?.value ?? "").split(",").filter(Boolean);
  return ids.includes(orderId);
}
