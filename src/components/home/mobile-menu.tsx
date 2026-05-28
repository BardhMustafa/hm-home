"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Wordmark } from "./wordmark";

const NAV = [
  { label: "Kuzhina", href: "/shop?cat=kuzhina" },
  { label: "Divane", href: "/shop?cat=divane" },
  { label: "Dhoma Gjumi", href: "/shop?cat=dhoma-gjumi" },
  { label: "Dekor", href: "/shop?cat=dekor" },
  { label: "Koleksione", href: "/shop" },
];

export function MobileMenuButton({
  authed,
  cartCount,
}: {
  overlay?: boolean;
  authed: boolean;
  cartCount: number;
}) {
  const [open, setOpen] = useState(false);

  // Lock body scroll when drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on route change (any link click inside the drawer).
  function close() { setOpen(false); }

  const lineStyle: React.CSSProperties = {
    display: "block",
    width: 22,
    height: 1.5,
    background: "var(--text)",
    transition: "transform 0.25s ease, opacity 0.25s ease",
  };

  return (
    <>
      {/* Hamburger button — only visible on mobile via CSS */}
      <button
        className="r-hamburger"
        aria-label={open ? "Mbyll menynë" : "Hap menynë"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={{
          background: "transparent",
          border: 0,
          cursor: "pointer",
          padding: 6,
          display: "flex",
          flexDirection: "column",
          gap: 5,
          color: "var(--text)",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            ...lineStyle,
            transform: open ? "translateY(6.5px) rotate(45deg)" : "none",
          }}
        />
        <span
          style={{
            ...lineStyle,
            opacity: open ? 0 : 1,
          }}
        />
        <span
          style={{
            ...lineStyle,
            transform: open ? "translateY(-6.5px) rotate(-45deg)" : "none",
          }}
        />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          onClick={close}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(8,7,6,0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 49,
          }}
        />
      )}

      {/* Drawer — slides in from the left */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "min(320px, 85vw)",
          background: "var(--bg-2)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          padding: "32px 28px 40px",
          gap: 0,
          zIndex: 50,
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
          overflowY: "auto",
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: 40 }}>
          <Link href="/" onClick={close} style={{ textDecoration: "none" }}>
            <Wordmark size={18} />
          </Link>
        </div>

        {/* Main nav */}
        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={close}
              style={{
                padding: "14px 0",
                fontSize: 22,
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontWeight: 400,
                color: "var(--text)",
                textDecoration: "none",
                borderBottom: "1px solid var(--border-soft)",
                letterSpacing: "0.02em",
              }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Secondary links */}
        <div
          style={{
            marginTop: 32,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            fontSize: 12,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--text-2)",
          }}
        >
          <Link
            href="/shop"
            onClick={close}
            style={{ color: "inherit", textDecoration: "none" }}
          >
            Kërko
          </Link>
          <Link
            href={authed ? "/account" : "/auth/login"}
            onClick={close}
            style={{ color: "inherit", textDecoration: "none" }}
          >
            {authed ? "Llogaria" : "Hyr / Regjistrohu"}
          </Link>
          <Link
            href="/cart"
            onClick={close}
            style={{
              color: "inherit",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            Shporta
            {cartCount > 0 && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "var(--gold)",
                  color: "#15110d",
                  fontSize: 10,
                  fontWeight: 600,
                }}
              >
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Close button at bottom */}
        <button
          onClick={close}
          style={{
            marginTop: "auto",
            paddingTop: 32,
            background: "transparent",
            border: 0,
            color: "var(--muted)",
            fontSize: 11,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            cursor: "pointer",
            textAlign: "left",
            padding: "12px 0",
          }}
        >
          × Mbyll
        </button>
      </div>
    </>
  );
}
