"use client";

import { useActionState } from "react";
import { updatePassword, type AuthState } from "../actions";
import { AuthInput } from "@/components/auth/shell";

export function UpdatePasswordForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    updatePassword,
    undefined,
  );

  return (
    <form
      action={action}
      style={{ display: "flex", flexDirection: "column", gap: 18 }}
    >
      <AuthInput
        label="Fjalëkalimi i ri (min. 8 karaktere)"
        name="password"
        type="password"
        required
        autoComplete="new-password"
      />
      <AuthInput
        label="Konfirmo fjalëkalimin"
        name="confirm"
        type="password"
        required
        autoComplete="new-password"
      />

      {state?.error && (
        <div style={{ color: "var(--sale)", fontSize: 13 }}>{state.error}</div>
      )}

      <button
        type="submit"
        className="btn btn--solid"
        disabled={pending}
        style={{ justifyContent: "center", marginTop: 6 }}
      >
        {pending ? "Duke ruajtur…" : "Ruaj fjalëkalimin"}
      </button>
    </form>
  );
}
