import "server-only";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdmin } from "@/lib/supabase/env";

// Best-effort client IP from the proxy headers Vercel/Netlify set. Returns null
// if absent (e.g. local dev), in which case callers should fail open.
export async function getClientIp(): Promise<string | null> {
  const h = await headers();
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim() || null;
  return h.get("x-real-ip");
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
