"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { WishlistButton } from "@/components/shop/wishlist-button";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";

export type ProductCardData = {
  id?: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  was?: number | null;
  badge?: "new" | "sale" | null;
  image?: string | null;
};

export function ProductCard({
  p,
  isWishlisted = false,
}: {
  p: ProductCardData;
  isWishlisted?: boolean;
}) {
  const [hover, setHover] = useState(false);

  return (
    <Link
      href={`/product/${p.slug}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "block",
        color: "inherit",
        textDecoration: "none",
        border: `1px solid ${hover ? "var(--gold-deep)" : "var(--border-soft)"}`,
        transition: "border-color 0.3s ease",
      }}
    >
      {/* Image */}
      <div
        style={{
          position: "relative",
          aspectRatio: "4 / 3",
          overflow: "hidden",
          background: "var(--surface)",
        }}
      >
        {p.image ? (
          <Image
            src={p.image}
            alt={p.name}
            fill
            sizes="(max-width: 1024px) 50vw, 25vw"
            style={{
              objectFit: "cover",
              transform: hover ? "scale(1.05)" : "scale(1)",
              transition: "transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          />
        ) : (
          <div className="ph" data-label={p.slug} style={{ position: "absolute", inset: 0 }} />
        )}

        {/* Badge */}
        {p.badge && (
          <div style={{ position: "absolute", top: 12, left: 12 }}>
            <span className={`badge ${p.badge === "sale" ? "badge--sale" : "badge--new"}`}>
              {p.badge === "sale" ? "ulje" : "i ri"}
            </span>
          </div>
        )}

        {/* Wishlist — top right, fades in on hover */}
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            opacity: hover ? 1 : 0,
            transform: `translateY(${hover ? 0 : -4}px)`,
            transition: "opacity 0.25s ease, transform 0.25s ease",
            pointerEvents: hover ? "auto" : "none",
          }}
          onClick={(e) => e.preventDefault()}
        >
          {p.id ? (
            <WishlistButton productId={p.id} initialWishlisted={isWishlisted} variant="card" />
          ) : (
            <button
              type="button"
              aria-label="Shto në të preferuarat"
              style={{
                width: 34,
                height: 34,
                background: "rgba(10,9,8,0.75)",
                border: "1px solid var(--border)",
                color: "var(--text-2)",
                display: "grid",
                placeItems: "center",
                backdropFilter: "blur(6px)",
                cursor: "pointer",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "16px 16px 18px" }}>
        {/* Gold rule */}
        <div
          style={{
            height: 1,
            width: hover ? 48 : 28,
            background: "var(--gold-deep)",
            marginBottom: 12,
            transition: "width 0.35s ease",
          }}
        />

        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: 6,
          }}
        >
          {p.category}
        </div>

        <div
          className="serif"
          style={{
            fontSize: 20,
            lineHeight: 1.15,
            color: "var(--text)",
            marginBottom: 10,
          }}
        >
          {p.name}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ color: "var(--gold)", fontSize: 14, letterSpacing: "0.04em" }}>
              € {p.price.toFixed(2)}
            </span>
            {p.was && (
              <span style={{ color: "var(--muted-2)", fontSize: 12, textDecoration: "line-through" }}>
                € {p.was.toFixed(2)}
              </span>
            )}
          </div>

          {/* Add to cart — always visible, stops link navigation */}
          {p.id && (
            <AddToCartButton productId={p.id} variant="icon" />
          )}
        </div>
      </div>
    </Link>
  );
}
