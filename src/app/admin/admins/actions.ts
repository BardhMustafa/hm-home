"use server";

import "server-only";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";

export type AdminActionResult = { ok: boolean; error?: string; message?: string };

// Returns the authenticated admin's user id, or throws. Mirrors the guard used
// across the other admin action files.
async function requireAdmin(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") throw new Error("Forbidden");
  return user.id;
}

// No getUserByEmail in supabase-js admin, so page through listUsers. perPage is
// large enough that one page covers this site; the loop is a defensive cap.
async function findUserByEmail(
  admin: SupabaseClient,
  email: string,
): Promise<{ id: string; email: string } | null> {
  const target = email.trim().toLowerCase();
  const perPage = 1000;
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const match = data.users.find((u) => u.email?.toLowerCase() === target);
    if (match) return { id: match.id, email: match.email ?? target };
    if (data.users.length < perPage) break; // reached the last page
  }
  return null;
}

const emailSchema = z.string().trim().toLowerCase().email().max(254);

// Promote an already-registered user to admin by their email address.
export async function promoteToAdmin(
  _prev: AdminActionResult | null,
  formData: FormData,
): Promise<AdminActionResult> {
  try {
    await requireAdmin();

    const parsed = emailSchema.safeParse(formData.get("email"));
    if (!parsed.success) {
      return { ok: false, error: "Shkruani një email të vlefshëm." };
    }
    const email = parsed.data;

    const admin = createAdminClient();
    const target = await findUserByEmail(admin, email);
    if (!target) {
      return {
        ok: false,
        error:
          "Asnjë llogari me këtë email. Përdoruesi duhet të regjistrohet së pari.",
      };
    }

    const { data: existing } = await admin
      .from("profiles")
      .select("role")
      .eq("id", target.id)
      .single();
    if (existing?.role === "admin") {
      return { ok: false, error: "Ky përdorues është tashmë admin." };
    }

    const { error } = await admin
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", target.id);
    if (error) return { ok: false, error: "Përditësimi dështoi. Provoni përsëri." };

    revalidatePath("/admin/admins");
    return { ok: true, message: `${target.email} u bë admin.` };
  } catch {
    return { ok: false, error: "Veprimi dështoi." };
  }
}

// Demote an admin back to a normal customer. Guards against self-demotion and
// removing the last admin so the panel can never lock everyone out.
export async function revokeAdmin(userId: string): Promise<AdminActionResult> {
  try {
    const currentUserId = await requireAdmin();

    if (userId === currentUserId) {
      return { ok: false, error: "Nuk mund të hiqni vetveten." };
    }

    const admin = createAdminClient();
    const { count } = await admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) <= 1) {
      return { ok: false, error: "Duhet të mbetet të paktën një admin." };
    }

    const { error } = await admin
      .from("profiles")
      .update({ role: "customer" })
      .eq("id", userId);
    if (error) return { ok: false, error: "Heqja dështoi. Provoni përsëri." };

    revalidatePath("/admin/admins");
    return { ok: true };
  } catch {
    return { ok: false, error: "Veprimi dështoi." };
  }
}
