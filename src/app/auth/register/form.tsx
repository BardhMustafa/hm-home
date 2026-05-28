"use client";

import { useActionState } from "react";
import { register, type AuthState } from "../actions";
import { AuthInput } from "@/components/auth/shell";

export function RegisterForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    register,
    undefined,
  );

  return (
    <form
      action={action}
      style={{ display: "flex", flexDirection: "column", gap: 18 }}
    >
      <AuthInput label="Emri i plotë" name="full_name" required autoComplete="name" />
      <AuthInput label="Email" name="email" type="email" required autoComplete="email" />
      <AuthInput
        label="Fjalëkalimi (min. 8 karaktere)"
        name="password"
        type="password"
        required
        autoComplete="new-password"
        minLength={8}
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
        {pending ? "Duke krijuar…" : "Krijo llogarinë"}
      </button>
    </form>
  );
}
