"use server";

import "server-only";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdmin } from "@/lib/supabase/env";
import { isValidPhone } from "@/lib/phone";
import { isHoneypotTripped } from "@/lib/honeypot";
import { getClientIp, checkRateLimit } from "@/lib/anti-abuse";

const visitSchema = z.object({
  full_name: z.string().trim().min(2, "Emri është i detyrueshëm."),
  phone: z.string().trim().refine(isValidPhone, "Numri i telefonit nuk është valid."),
  email: z.string().trim().email("Email i pavlefshëm.").optional().or(z.literal("")),
  preferred_date: z.string().trim().optional().nullable(),
  preferred_time: z.string().trim().optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export type VisitState =
  | { ok?: boolean; error?: string; fieldErrors?: Record<string, string> }
  | undefined;

export async function requestVisit(
  _prev: VisitState,
  formData: FormData,
): Promise<VisitState> {
  // Honeypot: pretend success so bots don't learn the field is a trap.
  if (isHoneypotTripped(formData)) {
    return { ok: true };
  }

  // Rate limit per IP to stop the public visit form from being flooded.
  const ip = await getClientIp();
  if (ip && !(await checkRateLimit(`visit:${ip}`, 5, 3600))) {
    return { error: "Keni dërguar shumë kërkesa. Provoni më vonë." };
  }

  const parsed = visitSchema.safeParse({
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
    email: formData.get("email") || "",
    preferred_date: formData.get("preferred_date") || null,
    preferred_time: formData.get("preferred_time") || null,
    notes: formData.get("notes") || null,
  });

  if (!parsed.success) {
    return {
      error: "Disa fusha janë të pavlefshme.",
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((i) => [i.path.join("."), i.message]),
      ),
    };
  }

  if (!hasSupabaseAdmin()) {
    return { error: "Shërbimi nuk është i disponueshëm për momentin." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("visit_requests").insert({
    full_name: parsed.data.full_name,
    phone: parsed.data.phone,
    email: parsed.data.email || null,
    preferred_date: parsed.data.preferred_date || null,
    preferred_time: parsed.data.preferred_time || null,
    notes: parsed.data.notes || null,
  });

  if (error) {
    return { error: "Kërkesa dështoi. Provoni përsëri." };
  }

  return { ok: true };
}
