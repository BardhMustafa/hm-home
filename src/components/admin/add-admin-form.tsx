"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { promoteToAdmin } from "@/app/admin/admins/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn btn--primary"
      disabled={pending}
      style={{ opacity: pending ? 0.6 : 1, cursor: pending ? "wait" : "pointer" }}
    >
      {pending ? "Duke shtuar…" : "Shto admin"}
    </button>
  );
}

export function AddAdminForm() {
  const [state, formAction] = useActionState(promoteToAdmin, null);

  return (
    <form
      action={formAction}
      style={{
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        flexWrap: "wrap",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        padding: 20,
        marginBottom: 28,
      }}
    >
      <div style={{ flex: "1 1 280px" }}>
        <input
          type="email"
          name="email"
          required
          placeholder="email@shembull.com"
          autoComplete="off"
          style={{
            width: "100%",
            background: "var(--bg)",
            border: "1px solid var(--border)",
            color: "var(--text)",
            padding: "10px 12px",
            fontSize: 14,
          }}
        />
        {state?.error && (
          <p style={{ color: "#ef4444", fontSize: 12, marginTop: 8 }}>{state.error}</p>
        )}
        {state?.ok && state.message && (
          <p style={{ color: "#4a9e6a", fontSize: 12, marginTop: 8 }}>{state.message}</p>
        )}
        <p style={{ color: "var(--muted)", fontSize: 11, marginTop: 8 }}>
          Përdoruesi duhet të ketë një llogari të regjistruar.
        </p>
      </div>
      <SubmitButton />
    </form>
  );
}
