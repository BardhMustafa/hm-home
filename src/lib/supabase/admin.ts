// Service-role Supabase client. Bypasses RLS — server-only.
// IMPORTANT: never import this from a client component.
import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_SERVICE_KEY } from "./env";

export function createAdminClient() {
  return createClient(
    SUPABASE_URL!,
    SUPABASE_SERVICE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
