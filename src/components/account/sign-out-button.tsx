"use client";

import { useTransition } from "react";
import { signout } from "@/app/auth/actions";

export function SignOutButton() {
  const [pending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      await signout();
    });
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={pending}
      className="account-tile--muted"
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "22px 4px",
        background: "none",
        border: "none",
        borderBottom: "1px solid var(--border-soft)",
        cursor: pending ? "default" : "pointer",
        textAlign: "left",
        opacity: pending ? 0.6 : 1,
        transition: "opacity 0.2s",
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ flexShrink: 0 }}
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      <span style={{ flex: 1, fontSize: 13, letterSpacing: "0.16em", textTransform: "uppercase" }}>
        {pending ? "Duke dalë…" : "Dil"}
      </span>
    </button>
  );
}
