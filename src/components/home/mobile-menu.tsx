"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Only portal after hydration so SSR doesn't break
  useEffect(() => { setMounted(true); }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Modal a11y while open: focus the drawer, trap Tab inside it, close on
  // Escape, and return focus to the hamburger when it closes.
  useEffect(() => {
    if (!open) return;
    const drawer = drawerRef.current;
    const trigger = triggerRef.current;
    const focusables = () =>
      drawer
        ? Array.from(
            drawer.querySelectorAll<HTMLElement>(
              'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
            ),
          )
        : [];
    focusables()[0]?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key === "Tab") {
        const items = focusables();
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [open]);

  function close() { setOpen(false); }

  const lineStyle: React.CSSProperties = {
    display: "block",
    width: 22,
    height: 1.5,
    background: "var(--text)",
    transition: "transform 0.25s ease, opacity 0.25s ease",
  };

  // Backdrop + drawer rendered at <body> level to escape the sticky header's
  // stacking context — fixes iOS Safari where position:fixed inside
  // position:sticky+z-index doesn't paint correctly.
  const overlay = mounted ? createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={close}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(8,7,6,0.6)",
          backdropFilter: "blur(4px)",
          zIndex: 9000,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menyja"
        // When closed, take the drawer out of the tab order + a11y tree so the
        // hidden links can't be focused or read by screen readers.
        {...(open ? {} : { inert: true })}
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
          zIndex: 9001,
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
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
          <Link href="/shop" onClick={close} style={{ color: "inherit", textDecoration: "none" }}>
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

        {/* Close button */}
        <button
          onClick={close}
          style={{
            marginTop: "auto",
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
    </>,
    document.body,
  ) : null;

  return (
    <>
      {/* Hamburger button */}
      <button
        ref={triggerRef}
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
        <span style={{ ...lineStyle, transform: open ? "translateY(6.5px) rotate(45deg)" : "none" }} />
        <span style={{ ...lineStyle, opacity: open ? 0 : 1 }} />
        <span style={{ ...lineStyle, transform: open ? "translateY(-6.5px) rotate(-45deg)" : "none" }} />
      </button>

      {overlay}
    </>
  );
}
