"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCartAction } from "@/app/cart/actions";
import { toast } from "@/lib/toast";

// variant="default" — full text button used on product page
// variant="icon"    — small square icon button used on product cards
export function AddToCartButton({
  productId,
  disabled,
  variant = "default",
}: {
  productId: string;
  disabled?: boolean;
  variant?: "default" | "icon";
}) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const router = useRouter();

  function handleClick(e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();
    if (disabled || pending || done) return;
    startTransition(async () => {
      await addToCartAction(productId, 1);
      setDone(true);
      toast("U shtua në shportë");
      router.refresh();
      setTimeout(() => setDone(false), 1800);
    });
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || pending}
        aria-label="Shto në shportë"
        style={{
          width: 34,
          height: 34,
          display: "grid",
          placeItems: "center",
          background: done ? "var(--gold)" : "var(--surface)",
          border: `1px solid ${done ? "var(--gold)" : "var(--border)"}`,
          color: done ? "#15110d" : "var(--text-2)",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.4 : 1,
          flexShrink: 0,
          transition: "background 0.2s, border-color 0.2s, color 0.2s",
        }}
      >
        {pending ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: "spin 0.7s linear infinite" }}>
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
        ) : done ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L20.6 8H6.2" />
            <circle cx="10" cy="20" r="1.2" />
            <circle cx="17" cy="20" r="1.2" />
          </svg>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => handleClick()}
      disabled={disabled || pending}
      className="btn btn--solid"
      style={{ flex: 1, justifyContent: "center" }}
    >
      {pending ? "Duke shtuar…" : done ? "U shtua ✓" : "Shto në shportë"}
    </button>
  );
}
