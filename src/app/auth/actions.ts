"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { mergeGuestCartOnLogin } from "@/lib/cart";
import { safeNextPath } from "@/lib/safe-redirect";
import { getClientIp, checkRateLimit } from "@/lib/anti-abuse";

export type AuthState = { error?: string } | undefined;

const TOO_MANY = "Shumë përpjekje. Provoni më vonë.";

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"));

  if (!email || !password) return { error: "Plotëso email-in dhe fjalëkalimin." };

  // Throttle credential-stuffing: cap login attempts per IP.
  const ip = await getClientIp();
  if (ip && !(await checkRateLimit(`login:${ip}`, 10, 600)))
    return { error: TOO_MANY };

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

  // Throttle signup spam per IP.
  const ip = await getClientIp();
  if (ip && !(await checkRateLimit(`register:${ip}`, 5, 3600)))
    return { error: TOO_MANY };

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
  // Generic message — don't echo Supabase's raw error (e.g. "User already
  // registered" is an account-enumeration leak). Log the real cause server-side.
  if (error) {
    console.error("[auth] register failed", error.message);
    return { error: "Regjistrimi dështoi. Kontrollo të dhënat dhe provo sërish." };
  }

  revalidatePath("/", "layout");
  redirect("/auth/login?registered=1");
}

export async function requestPasswordReset(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Plotëso email-in." };

  // Throttle reset-email bombing: cap per IP and per target email. Both fail
  // open. The redirect below is unconditional regardless, so hitting the limit
  // still doesn't reveal whether the email exists.
  const ip = await getClientIp();
  const overLimit =
    (ip && !(await checkRateLimit(`pwreset-ip:${ip}`, 5, 3600))) ||
    !(await checkRateLimit(`pwreset-email:${email.toLowerCase()}`, 3, 3600));
  if (overLimit) redirect("/auth/forgot-password?sent=1");

  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "";

  // The link lands on /auth/callback, which exchanges the recovery code for a
  // session and then bounces to /auth/update-password to set the new password.
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/auth/update-password`,
  });

  // Always report success — never reveal whether an email is registered.
  redirect("/auth/forgot-password?sent=1");
}

export async function updatePassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8)
    return { error: "Fjalëkalimi duhet të jetë të paktën 8 karaktere." };
  if (password !== confirm) return { error: "Fjalëkalimet nuk përputhen." };

  // Requires the recovery session established by the callback. If the link
  // expired or was never exchanged, updateUser fails with no session.
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error)
    return {
      error: "Lidhja ka skaduar ose është e pavlefshme. Kërkoni një link të ri.",
    };

  revalidatePath("/", "layout");
  redirect("/auth/login?reset=1");
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
