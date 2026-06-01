"use client";

import { useTransition } from "react";
import { updateCartItemAction } from "@/app/cart/actions";

export function CartQtyControl({
  itemId,
  quantity,
  stock,
}: {
  itemId: string;
  quantity: number;
  stock: number | null;
}) {
  const [pending, startTransition] = useTransition();

  const update = (qty: number) => {
    startTransition(() => updateCartItemAction(itemId, qty));
  };

  const atMin = quantity <= 1;
  const atMax = stock !== null && quantity >= stock;

  const btnStyle = (disabled: boolean) => ({
    width: 36,
    height: 36,
    background: "var(--bg)",
    border: "1px solid var(--border)",
    color: "var(--text)",
    fontSize: 18,
    cursor: disabled || pending ? "not-allowed" : "pointer",
    opacity: disabled || pending ? 0.35 : 1,
    display: "grid" as const,
    placeItems: "center",
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
      <button
        onClick={() => update(quantity - 1)}
        disabled={atMin || pending}
        style={btnStyle(atMin)}
      >
        −
      </button>
      <div
        style={{
          width: 40,
          height: 36,
          display: "grid",
          placeItems: "center",
          background: "var(--bg)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          fontSize: 14,
          color: "var(--text)",
        }}
      >
        {pending ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: "spin 0.7s linear infinite" }}>
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
        ) : quantity}
      </div>
      <button
        onClick={() => update(quantity + 1)}
        disabled={atMax || pending}
        style={btnStyle(atMax)}
      >
        +
      </button>
    </div>
  );
}
