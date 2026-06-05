"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export function NavAccount({ authed, isAdmin = false }: { authed: boolean; isAdmin?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!authed) {
    return (
      <Link href="/auth/login" style={{ color: "inherit", display: "flex", alignItems: "center" }} aria-label="Hyr">
        <UserIcon />
      </Link>
    );
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Llogaria"
        aria-haspopup="menu"
        aria-expanded={open}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          color: "var(--text-2)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <UserIcon />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 14px)",
            right: 0,
            minWidth: 192,
            background: "var(--bg-2)",
            border: "1px solid var(--border-soft)",
            zIndex: 50,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {[
            ...(isAdmin ? [{ label: "Admin", href: "/admin" }] : []),
            { label: "Llogaria", href: "/account" },
            { label: "Porositë e mia", href: "/account/orders" },
            { label: "Lista e dëshirave", href: "/wishlist" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              style={{
                padding: "13px 20px",
                fontSize: 12,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--text-2)",
                textDecoration: "none",
                borderBottom: "1px solid var(--border-soft)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-2)")}
            >
              {item.label}
            </Link>
          ))}

          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "13px 20px",
                textAlign: "left",
                fontSize: 12,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--muted)",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
            >
              Dil
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
