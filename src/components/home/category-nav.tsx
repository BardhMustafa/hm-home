"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";

type Cat = { name: string; slug: string };

// Desktop header navigation. Instead of a flat row of category links — which
// breaks the centered-logo layout once there are more than a handful — all
// categories live behind a single "Kategoritë" dropdown, so the nav stays
// clean no matter how many categories the client adds.
export function CategoryNav({ categories }: { categories: Cat[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close on outside click or Escape (only while open).
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Hover-intent: open immediately, close after a short delay so a brief
  // gap between the trigger and the panel doesn't snap it shut.
  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 140);
  };
  useEffect(() => cancelClose, []);

  const linkStyle: React.CSSProperties = {
    color: "inherit",
    textDecoration: "none",
  };

  // No categories yet → just a plain shop link, matching the old fallback.
  if (categories.length === 0) {
    return (
      <nav
        className="r-header-nav-left"
        style={{
          display: "flex",
          gap: 28,
          fontSize: 12,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--text-2)",
        }}
      >
        <Link href="/shop" style={linkStyle}>
          Dyqani
        </Link>
      </nav>
    );
  }

  return (
    <nav
      className="r-header-nav-left"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 28,
        fontSize: 12,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: "var(--text-2)",
      }}
    >
      <div
        ref={ref}
        style={{ position: "relative" }}
        onMouseEnter={() => {
          cancelClose();
          setOpen(true);
        }}
        onMouseLeave={scheduleClose}
      >
        <button
          type="button"
          className="cat-nav-trigger"
          aria-haspopup="true"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span>Kategoritë</span>
          <svg
            width="11"
            height="11"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            style={{
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
              flexShrink: 0,
            }}
          >
            <path d="M2 4l4 4 4-4" />
          </svg>
        </button>

        {open && (
          <div
            className="cat-nav-panel"
            role="menu"
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/shop?cat=${c.slug}`}
                role="menuitem"
                className="cat-nav-option"
                onClick={() => setOpen(false)}
              >
                {c.name}
              </Link>
            ))}
            <Link
              href="/shop"
              role="menuitem"
              className="cat-nav-option cat-nav-all"
              onClick={() => setOpen(false)}
            >
              Të gjitha
            </Link>
          </div>
        )}
      </div>

      {/* A direct shop link always stays visible next to the dropdown. */}
      <Link href="/shop" style={linkStyle}>
        Koleksione
      </Link>
    </nav>
  );
}
