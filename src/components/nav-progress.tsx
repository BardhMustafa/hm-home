"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

function NavProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const slowTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Route changed → complete & fade out
  useEffect(() => {
    clearTimeout(slowTimer.current);
    clearTimeout(hideTimer.current);
    clearTimeout(safetyTimer.current);
    setWidth(100);
    hideTimer.current = setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 350);
  }, [pathname, searchParams]);

  // Click on any internal <a> → start bar
  useEffect(() => {
    function onLinkClick(e: MouseEvent) {
      const anchor = (e.target as Element).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href") ?? "";
      if (!href || href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      // Same URL as now → no navigation happens, so don't start a bar that
      // would never be completed by the route-change effect (it'd stick).
      const target = new URL(href, window.location.href);
      if (
        target.pathname === window.location.pathname &&
        target.search === window.location.search
      ) {
        return;
      }
      clearTimeout(slowTimer.current);
      clearTimeout(hideTimer.current);
      clearTimeout(safetyTimer.current);
      setVisible(true);
      setWidth(35);
      slowTimer.current = setTimeout(() => setWidth(65), 600);
      // Failsafe: if navigation never completes (blocked, error), auto-hide.
      safetyTimer.current = setTimeout(() => {
        setVisible(false);
        setWidth(0);
      }, 8000);
    }
    document.addEventListener("click", onLinkClick);
    return () => {
      document.removeEventListener("click", onLinkClick);
      clearTimeout(slowTimer.current);
      clearTimeout(hideTimer.current);
      clearTimeout(safetyTimer.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: 2,
        width: `${width}%`,
        background: "var(--gold)",
        zIndex: 9999,
        pointerEvents: "none",
        transition: width === 100 ? "width 0.25s ease" : "width 1.2s ease",
        boxShadow: "0 0 8px var(--gold)",
      }}
    />
  );
}

export function NavProgress() {
  return (
    <Suspense fallback={null}>
      <NavProgressInner />
    </Suspense>
  );
}
