"use client";

import { useActionState, useState } from "react";
import { placeOrder, type CheckoutState } from "./actions";

export function CheckoutForm({
  defaults,
  authed,
}: {
  defaults: { full_name: string; email: string; phone: string };
  authed: boolean;
}) {
  const [state, action, pending] = useActionState<CheckoutState, FormData>(
    placeOrder,
    undefined,
  );

  // Stable per-render-session idempotency key: a double-submit (double-click,
  // Enter-resubmit, retry) carries the same key, so the server places at most
  // one order for this checkout.
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  const err = (k: string) => state?.fieldErrors?.[k];

  return (
    <form
      action={action}
      style={{ display: "flex", flexDirection: "column", gap: 18 }}
    >
      <input type="hidden" name="idempotency_key" value={idempotencyKey} />
      <div className="eyebrow">Të dhënat e dorëzimit</div>

      <Row>
        <Field label="Emri i plotë" error={err("full_name")}>
          <Input name="full_name" required defaultValue={defaults.full_name} />
        </Field>
        <Field label="Telefoni" error={err("phone")}>
          <Input name="phone" required defaultValue={defaults.phone} />
        </Field>
      </Row>

      <Field
        label="Email"
        error={err("email")}
        hint={authed ? undefined : "Konfirmimi i porosisë do dërgohet këtu."}
      >
        <Input
          name="email"
          type="email"
          required
          defaultValue={defaults.email}
        />
      </Field>

      <Field label="Adresa" error={err("address")}>
        <Input name="address" required placeholder="Rr. & nr." />
      </Field>

      <Row>
        <Field label="Qyteti" error={err("city")}>
          <Input name="city" required />
        </Field>
        <Field label="Kodi postar">
          <Input name="postal_code" />
        </Field>
        <Field label="Shteti" error={err("country")}>
          <Input name="country" required defaultValue="Kosovë" />
        </Field>
      </Row>

      <Field label="Shënime (opsionale)">
        <textarea name="notes" rows={3} style={inputStyle} />
      </Field>

      {state?.error && (
        <div style={{ color: "var(--sale)", fontSize: 13 }}>{state.error}</div>
      )}

      <button
        type="submit"
        className="btn btn--solid"
        disabled={pending}
        style={{ justifyContent: "center", marginTop: 10 }}
      >
        {pending ? "Duke dërguar…" : "Vendos porosinë"}
      </button>
    </form>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  // auto-fit + minmax lets the row pack as many fields as fit and wrap the
  // rest to the next line on narrow screens — no breakpoint needed.
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: 14,
      }}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span
        style={{
          fontSize: 11,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--muted)",
        }}
      >
        {label}
      </span>
      {children}
      {hint && !error && (
        <span style={{ fontSize: 12, color: "var(--muted)" }}>{hint}</span>
      )}
      {error && (
        <span style={{ fontSize: 12, color: "var(--sale)" }}>{error}</span>
      )}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={inputStyle} />;
}

const inputStyle: React.CSSProperties = {
  padding: "11px 12px",
  background: "var(--bg)",
  border: "1px solid var(--border)",
  color: "var(--text)",
  fontFamily: "var(--font-sans), system-ui, sans-serif",
  fontSize: 14,
  outline: "none",
};
