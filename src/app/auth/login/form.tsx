"use client";

import { useActionState } from "react";
import { login, type AuthState } from "../actions";
import { AuthInput } from "@/components/auth/shell";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    login,
    undefined,
  );

  return (
    <form
      action={action}
      style={{ display: "flex", flexDirection: "column", gap: 18 }}
    >
      <input type="hidden" name="next" value={next} />
      <AuthInput label="Email" name="email" type="email" required autoComplete="email" />
      <AuthInput
        label="Fjalëkalimi"
        name="password"
        type="password"
        required
        autoComplete="current-password"
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
        {pending ? "Duke hyrë…" : "Hyr"}
      </button>
    </form>
  );
}
