// Centralised resolution of the Supabase env vars. Supports both the legacy
// names (ANON_KEY / SERVICE_ROLE_KEY) and the newer ones Supabase now shows
// in the dashboard (PUBLISHABLE_KEY / SECRET_KEY), so either set works.
//
// NOTE: these must be referenced as full `process.env.X` expressions (not via
// a dynamic key) so Next.js can statically inline the NEXT_PUBLIC_* ones into
// the client bundle at build time.

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

// True iff the env vars needed to instantiate the SSR Supabase client are
// present. When false the site renders with fixture data / empty cart so a
// fresh clone is bootable before Supabase is wired up.
export function hasSupabase(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export function hasSupabaseAdmin(): boolean {
  return hasSupabase() && Boolean(SUPABASE_SERVICE_KEY);
}
