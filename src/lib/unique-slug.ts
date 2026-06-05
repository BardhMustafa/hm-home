import "server-only";
import type { createAdminClient } from "@/lib/supabase/admin";

// Make a slug unique by appending -2, -3, … when the base is already taken.
// `excludeId` lets an update keep its own current slug. This replaces leaking
// a raw Postgres unique-violation to the user on a name collision.
export async function uniqueSlug(
  admin: ReturnType<typeof createAdminClient>,
  table: "products" | "categories",
  base: string,
  excludeId?: string,
): Promise<string> {
  const root = base || "artikull";
  for (let n = 1; n <= 100; n++) {
    const candidate = n === 1 ? root : `${root}-${n}`;
    let q = admin.from(table).select("id").eq("slug", candidate);
    if (excludeId) q = q.neq("id", excludeId);
    const { data } = await q.maybeSingle();
    if (!data) return candidate;
  }
  return `${root}-${Date.now()}`;
}

// Derive the in-bucket storage path from a Supabase public object URL, so an
// old image can be removed when it's replaced or its row is deleted.
export function storagePathFromPublicUrl(
  url: string | null | undefined,
  bucket: string,
): string | null {
  if (!url) return null;
  const marker = `/object/public/${bucket}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length));
}
