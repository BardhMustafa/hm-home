"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCartAction } from "@/app/cart/actions";
import { WishlistButton } from "./wishlist-button";

export function ProductActions({
  productId,
  disabled,
  initialWishlisted,
  stock,
}: {
  productId: string;
  disabled?: boolean;
  initialWishlisted: boolean;
  stock: number | null;
}) {
  const [qty, setQty] = useState(1);
  const [pending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);
  const router = useRouter();

  const max = stock ?? Infinity;

  function addToCart() {
    startTransition(async () => {
      await addToCartAction(productId, qty);
      setAdded(true);
      router.refresh();
      setTimeout(() => setAdded(false), 1800);
    });
  }

  return (
    <div>
      {/* Quantity selector */}
      {!disabled && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            border: "1px solid var(--border)",
            marginBottom: 16,
          }}
        >
          <button
            type="button"
            aria-label="Zvogëlo sasinë"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            style={{
              width: 40,
              height: 40,
              background: "none",
              border: "none",
              color: qty === 1 ? "var(--muted)" : "var(--text)",
              fontSize: 18,
              cursor: qty === 1 ? "default" : "pointer",
              display: "grid",
              placeItems: "center",
              lineHeight: 1,
            }}
          >
            −
          </button>
          <span
            style={{
              width: 40,
              textAlign: "center",
              fontSize: 14,
              color: "var(--text)",
              letterSpacing: "0.06em",
              borderLeft: "1px solid var(--border)",
              borderRight: "1px solid var(--border)",
              lineHeight: "40px",
            }}
          >
            {qty}
          </span>
          <button
            type="button"
            aria-label="Shto sasinë"
            onClick={() => setQty((q) => Math.min(max, q + 1))}
            style={{
              width: 40,
              height: 40,
              background: "none",
              border: "none",
              color: qty >= max ? "var(--muted)" : "var(--text)",
              fontSize: 18,
              cursor: qty >= max ? "default" : "pointer",
              display: "grid",
              placeItems: "center",
              lineHeight: 1,
            }}
          >
            +
          </button>
        </div>
      )}

      {/* Actions row */}
      <div style={{ display: "flex", gap: 10 }}>
        <button
          type="button"
          onClick={addToCart}
          disabled={disabled || pending}
          className="btn btn--solid"
          style={{ flex: 1, justifyContent: "center" }}
        >
          {pending ? "Duke shtuar…" : added ? "U shtua ✓" : "Shto në shportë"}
        </button>
        <WishlistButton
          productId={productId}
          initialWishlisted={initialWishlisted}
          variant="page"
        />
      </div>
    </div>
  );
}
