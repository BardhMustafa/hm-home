"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function AdminRouteLoader() {
  const pathname = usePathname();
  const prevRef = useRef(pathname);
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearTimers() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }

  // Navigation complete — jump to 100% then hide
  useEffect(() => {
    if (pathname === prevRef.current) return;
    prevRef.current = pathname;
    clearTimers();
    setWidth(100);
    const t = setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 280);
    timersRef.current = [t];
    return clearTimers;
  }, [pathname]);

  // Intercept link clicks inside the admin shell
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as Element).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      // Skip external links, hash links, tel/mailto
      if (/^(https?:|#|tel:|mailto:)/.test(href)) return;
      // Skip same-page navigation
      if (href === prevRef.current) return;

      clearTimers();
      setVisible(true);
      setWidth(0);
      timersRef.current = [
        setTimeout(() => setWidth(22), 30),
        setTimeout(() => setWidth(58), 280),
        setTimeout(() => setWidth(80), 900),
      ];
    }

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      clearTimers();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null;

  return (
    <>
      {/* Thin gold progress bar at very top */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          zIndex: 10000,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${width}%`,
            background: "var(--gold)",
            boxShadow: "0 0 10px rgba(194,168,117,0.55)",
            transition:
              width === 100
                ? "width 0.15s ease-out"
                : width === 0
                  ? "none"
                  : "width 0.65s ease-out",
          }}
        />
      </div>

      {/* Subtle overlay on the main content area */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 240,  // sidebar width
          right: 0,
          bottom: 0,
          background: "rgba(10,9,8,0.28)",
          zIndex: 9998,
          pointerEvents: "none",
          animation: "fadeInOverlay 0.15s ease-out",
        }}
      />

      <style>{`
        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  );
}
