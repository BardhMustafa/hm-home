"use client";

import { useActionState } from "react";
import { requestPasswordReset, type AuthState } from "../actions";
import { AuthInput } from "@/components/auth/shell";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    requestPasswordReset,
    undefined,
  );

  return (
    <form
      action={action}
      style={{ display: "flex", flexDirection: "column", gap: 18 }}
    >
      <AuthInput label="Email" name="email" type="email" required autoComplete="email" />

      {state?.error && (
        <div style={{ color: "var(--sale)", fontSize: 13 }}>{state.error}</div>
      )}

      <button
        type="submit"
        className="btn btn--solid"
        disabled={pending}
        style={{ justifyContent: "center", marginTop: 6 }}
      >
        {pending ? "Duke dërguar…" : "Dërgo linkun"}
      </button>
    </form>
  );
}
