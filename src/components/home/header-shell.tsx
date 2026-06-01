"use client";

import { useEffect, useState } from "react";

export function HeaderShell({
  overlay,
  children,
}: {
  overlay: boolean;
  children: React.ReactNode;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!overlay) return;
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlay]);

  const solid = !overlay || scrolled;

  return (
    <header
      className="r-px r-header-grid"
      style={{
        paddingTop: 22,
        paddingBottom: 22,
        borderBottom: solid
          ? "1px solid var(--border-soft)"
          : "1px solid rgba(255,255,255,0.06)",
        position: overlay ? "fixed" : "sticky",
        top: 0,
        left: 0,
        right: 0,
        background: solid ? "var(--bg)" : "transparent",
        backdropFilter: solid ? "blur(12px)" : "none",
        zIndex: 30,
        transition: "background 0.35s ease, border-color 0.35s ease, backdrop-filter 0.35s ease",
      }}
    >
      {children}
    </header>
  );
}
