"use client";

import { useActionState } from "react";
import { requestVisit, type VisitState } from "./actions";
import { HONEYPOT_FIELD } from "@/lib/honeypot";

// Off-screen, aria-hidden, untabbable input bots tend to fill; real users
// never see or focus it.
const honeypotStyle: React.CSSProperties = {
  position: "absolute",
  left: "-9999px",
  width: 1,
  height: 1,
  opacity: 0,
};

const TIME_SLOTS = [
  "09:00 – 11:00",
  "11:00 – 13:00",
  "13:00 – 15:00",
  "15:00 – 17:00",
  "17:00 – 19:00",
];

export function VisitForm() {
  const [state, action, pending] = useActionState<VisitState, FormData>(
    requestVisit,
    undefined,
  );

  const err = (k: string) => state?.fieldErrors?.[k];

  if (state?.ok) {
    return (
      <div
        style={{
          padding: "40px 32px",
          background: "var(--surface)",
          border: "1px solid var(--gold-deep)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: "1.5px solid var(--gold)",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 20px",
            color: "var(--gold)",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h2 className="serif" style={{ fontSize: 26, margin: "0 0 12px" }}>
          Kërkesa u dërgua.
        </h2>
        <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
          Faleminderit! Stafi ynë do t&apos;ju kontaktojë së shpejti për të
          konfirmuar orarin e vizitës.
        </p>
      </div>
    );
  }

  return (
    <form
      action={action}
      style={{ display: "flex", flexDirection: "column", gap: 18 }}
    >
      <input
        type="text"
        name={HONEYPOT_FIELD}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={honeypotStyle}
      />
      <div className="eyebrow">Caktoni vizitën tuaj</div>

      <Row>
        <Field label="Emri i plotë" error={err("full_name")}>
          <input name="full_name" required style={inputStyle} />
        </Field>
        <Field label="Telefoni" error={err("phone")}>
          <input name="phone" required style={inputStyle} />
        </Field>
      </Row>

      <Field label="Email (opsionale)" error={err("email")}>
        <input name="email" type="email" style={inputStyle} />
      </Field>

      <Row>
        <Field label="Data e preferuar" error={err("preferred_date")}>
          <input name="preferred_date" type="date" style={inputStyle} />
        </Field>
        <Field label="Orari i preferuar" error={err("preferred_time")}>
          <select name="preferred_time" defaultValue="" style={inputStyle}>
            <option value="">Zgjidhni…</option>
            {TIME_SLOTS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
      </Row>

      <Field label="Shënime (opsionale)" error={err("notes")}>
        <textarea
          name="notes"
          rows={3}
          placeholder="Çfarë dëshironi të shihni? P.sh. divane, kuzhina…"
          style={inputStyle}
        />
      </Field>

      {state?.error && (
        <div style={{ color: "var(--sale)", fontSize: 13 }}>{state.error}</div>
      )}

      <button
        type="submit"
        className="btn btn--solid"
        disabled={pending}
        style={{ justifyContent: "center", marginTop: 6 }}
      >
        {pending ? "Duke dërguar…" : "Dërgo kërkesën"}
      </button>
    </form>
  );
}

function Row({ children }: { children: React.ReactNode }) {
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
  error,
  children,
}: {
  label: string;
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
      {error && (
        <span style={{ fontSize: 12, color: "var(--sale)" }}>{error}</span>
      )}
    </label>
  );
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
