import Link from "next/link";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/home/wordmark";

// Shared frame for login/register/reset — centered card on the dark luxe bg.
export function AuthShell({
  eyebrow,
  title,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        background: "var(--bg)",
      }}
    >
      <header
        style={{
          padding: "26px 56px",
          borderBottom: "1px solid var(--border-soft)",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <Wordmark size={20} />
        </Link>
      </header>

      <main
        style={{
          display: "grid",
          placeItems: "center",
          padding: "60px 24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 440,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            padding: "44px 40px",
          }}
        >
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            {eyebrow}
          </div>
          <h1
            className="serif"
            style={{
              fontSize: 38,
              lineHeight: 1,
              margin: 0,
              color: "var(--text)",
            }}
          >
            {title}
          </h1>
          <div style={{ marginTop: 32 }}>{children}</div>
          {footer && (
            <div
              style={{
                marginTop: 28,
                paddingTop: 22,
                borderTop: "1px solid var(--border-soft)",
                fontSize: 13,
                color: "var(--text-2)",
                textAlign: "center",
              }}
            >
              {footer}
            </div>
          )}
        </div>
      </main>

      <footer
        style={{
          padding: "20px 56px",
          fontSize: 12,
          color: "var(--muted)",
          textAlign: "center",
        }}
      >
        © 2026 HM Home
      </footer>
    </div>
  );
}

// Reusable input — matches the dark-luxe surface treatment.
export function AuthInput(
  props: React.InputHTMLAttributes<HTMLInputElement> & { label: string },
) {
  const { label, ...input } = props;
  return (
    <label
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        fontSize: 11,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: "var(--muted)",
      }}
    >
      {label}
      <input
        {...input}
        style={{
          padding: "13px 14px",
          background: "var(--bg)",
          border: "1px solid var(--border)",
          color: "var(--text)",
          fontFamily: "var(--font-sans), system-ui, sans-serif",
          fontSize: 14,
          letterSpacing: 0,
          textTransform: "none",
          outline: "none",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--gold)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
      />
    </label>
  );
}
