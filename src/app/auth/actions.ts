"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { mergeGuestCartOnLogin } from "@/lib/cart";
import { safeNextPath } from "@/lib/safe-redirect";

export type AuthState = { error?: string } | undefined;

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"));

  if (!email || !password) return { error: "Plotëso email-in dhe fjalëkalimin." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return { error: "Email-i ose fjalëkalimi është i pasaktë." };

  // Fold the browser's guest cart (if any) into the user's persistent cart.
  if (data.user) {
    try {
      await mergeGuestCartOnLogin(data.user.id);
    } catch {
      // Don't fail the login if a merge step misbehaves — the user can
      // re-add items by hand if their guest cart was lost.
    }
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function register(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();

  if (!email || !password || !fullName)
    return { error: "Plotëso emrin, email-in dhe fjalëkalimin." };
  if (password.length < 8)
    return { error: "Fjalëkalimi duhet të jetë të paktën 8 karaktere." };

  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "";

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: { full_name: fullName },
    },
  });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/auth/login?registered=1");
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
