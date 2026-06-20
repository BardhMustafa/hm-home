import "server-only";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdmin } from "@/lib/supabase/env";

// Trusted client IP for rate-limit keys. We deliberately do NOT use the
// leftmost `x-forwarded-for` value: that entry is client-supplied and a caller
// can rotate it per request to land in a fresh bucket and defeat the limiter.
// On Vercel, `x-vercel-forwarded-for` is set by the edge and any client-sent
// copy is stripped, so it's trustworthy; `x-real-ip` (also Vercel-set) is the
// fallback. Returns null when neither is present (e.g. local dev) → fail open.
export async function getClientIp(): Promise<string | null> {
  const h = await headers();
  const vercel = h.get("x-vercel-forwarded-for");
  if (vercel) return vercel.split(",")[0]!.trim() || null;
  const realIp = h.get("x-real-ip");
  if (realIp) return realIp.trim() || null;
  return null;
}

// DB-backed sliding-window limiter (see migration 0008). Returns true if the
// action is allowed. FAIL OPEN on any infra problem — never block a real
// customer because the limiter itself errored; the honeypot + phone checks
// remain as backstops.
export async function checkRateLimit(
  bucket: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  if (!hasSupabaseAdmin()) return true;
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("check_rate_limit", {
      p_bucket: bucket,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });
    if (error) return true;
    return data === true;
  } catch {
    return true;
  }
}
