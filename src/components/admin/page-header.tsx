import type { ReactNode } from "react";

export function AdminPageHeader({
  eyebrow,
  title,
  actions,
}: {
  eyebrow: string;
  title: string;
  actions?: ReactNode;
}) {
  return (
    <div
      className="r-stack-sm"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: 32,
        paddingBottom: 24,
        borderBottom: "1px solid var(--border-soft)",
        gap: 24,
      }}
    >
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1
          className="serif"
          style={{ fontSize: "clamp(28px, 5vw, 36px)", margin: "10px 0 0", lineHeight: 1 }}
        >
          {title}
        </h1>
      </div>
      {actions && <div style={{ display: "flex", gap: 10 }}>{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        padding: 20,
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--muted)",
        }}
      >
        {label}
      </div>
      <div
        className="serif"
        style={{
          fontSize: 36,
          color: "var(--gold)",
          marginTop: 10,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      {hint && (
        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            color: "var(--text-2)",
          }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}
