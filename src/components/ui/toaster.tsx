"use client";

import { useEffect, useState } from "react";
import type { ToastPayload } from "@/lib/toast";

export function Toaster() {
  const [toasts, setToasts] = useState<(ToastPayload & { leaving: boolean })[]>([]);

  useEffect(() => {
    function handler(e: Event) {
      const data = (e as CustomEvent<ToastPayload>).detail;
      setToasts((t) => [...t, { ...data, leaving: false }]);

      // Start leave animation
      setTimeout(() => {
        setToasts((t) =>
          t.map((x) => (x.id === data.id ? { ...x, leaving: true } : x)),
        );
      }, 2800);

      // Remove from DOM
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== data.id));
      }, 3200);
    }

    window.addEventListener("hm:toast", handler);
    return () => window.removeEventListener("hm:toast", handler);
  }, []);

  if (!toasts.length) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 28,
        right: 28,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast-item${t.leaving ? " leaving" : ""}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 18px",
            background: "var(--elevated)",
            borderLeft: `3px solid ${
              t.type === "error" ? "#c46a3a" : t.type === "info" ? "var(--gold-deep)" : "var(--gold)"
            }`,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            minWidth: 240,
            maxWidth: 320,
          }}
        >
          {/* Icon */}
          <span style={{ flexShrink: 0, color: t.type === "error" ? "#c46a3a" : "var(--gold)" }}>
            {t.type === "error" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            )}
          </span>
          <span style={{ fontSize: 13, color: "var(--text)", letterSpacing: "0.02em", lineHeight: 1.4 }}>
            {t.message}
          </span>
        </div>
      ))}
    </div>
  );
}
