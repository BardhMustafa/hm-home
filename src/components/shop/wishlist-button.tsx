"use client";

import { useState, useTransition } from "react";
import { toggleWishlistAction } from "@/app/wishlist/actions";
import { toast } from "@/lib/toast";

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      style={{ display: "block" }}
    >
      <path
        d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z"
        fill={filled ? "var(--gold)" : "none"}
        stroke={filled ? "var(--gold)" : "currentColor"}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WishlistButton({
  productId,
  initialWishlisted = false,
  variant = "card",
}: {
  productId: string;
  initialWishlisted?: boolean;
  variant?: "card" | "page";
}) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [pending, startTransition] = useTransition();

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await toggleWishlistAction(productId);
      if (result.requiresAuth) {
        toast("Kyçuni për të ruajtur të preferuarat", "error");
        return;
      }
      if (result.error) {
        toast("Ndodhi një gabim", "error");
        return;
      }
      setWishlisted(result.wishlisted);
      toast(result.wishlisted ? "U shtua në të preferuarat" : "U hoq nga të preferuarat");
    });
  }

  if (variant === "page") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="btn btn--ghost"
        style={{ color: wishlisted ? "var(--gold)" : undefined }}
        aria-label={
          wishlisted ? "Hiq nga të preferuarat" : "Shto në të preferuarat"
        }
      >
        {wishlisted ? "♥" : "♡"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-label={
        wishlisted ? "Hiq nga të preferuarat" : "Shto në të preferuarat"
      }
      style={{
        width: 36,
        height: 36,
        background: "rgba(15,13,11,0.85)",
        border: "1px solid var(--border)",
        color: wishlisted ? "var(--gold)" : "var(--text)",
        display: "grid",
        placeItems: "center",
        backdropFilter: "blur(6px)",
        cursor: "pointer",
        opacity: pending ? 0.7 : 1,
      }}
    >
      <HeartIcon filled={wishlisted} />
    </button>
  );
}
