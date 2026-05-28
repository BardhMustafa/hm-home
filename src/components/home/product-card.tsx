"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// Inline SVG icons — same set as the design's cards.jsx
function Icon({
  name,
  size = 16,
}: {
  name: "heart" | "cart" | "eye";
  size?: number;
}) {
  const paths: Record<string, React.ReactNode> = {
    heart: (
      <path
        d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    cart: (
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L20.6 8H6.2" />
        <circle cx="10" cy="20" r="1.2" />
        <circle cx="17" cy="20" r="1.2" />
      </g>
    ),
    eye: (
      <g fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
        <circle cx="12" cy="12" r="2.8" />
      </g>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ display: "block" }}
    >
      {paths[name]}
    </svg>
  );
}

export type ProductCardData = {
  name: string;
  slug: string;
  category: string;
  price: number;
  was?: number | null;
  badge?: "new" | "sale" | null;
  image?: string | null; // public path; falls back to placeholder
};

// Editorial card (Variation A from the design).
// Image-dominant, hover surfaces a smoked add-to-cart bar + quick actions.
export function ProductCard({ p }: { p: ProductCardData }) {
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
      }}
    >
      <div
        style={{
          position: "relative",
          aspectRatio: "4 / 5",
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
              transform: hover ? "scale(1.04)" : "scale(1)",
              transition: "transform 0.5s ease",
            }}
          />
        ) : (
          <div
            className="ph"
            data-label={`product · ${p.slug}`}
            style={{ position: "absolute", inset: 0 }}
          />
        )}

        {p.badge && (
          <div style={{ position: "absolute", top: 14, left: 14 }}>
            <span
              className={`badge ${
                p.badge === "sale" ? "badge--sale" : "badge--new"
              }`}
            >
              {p.badge === "sale" ? "ulje" : "i ri"}
            </span>
          </div>
        )}

        {/* Hover affordances — wishlist + quick view */}
        <div
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            opacity: hover ? 1 : 0,
            transform: `translateY(${hover ? 0 : -4}px)`,
            transition: "all 0.25s ease",
            pointerEvents: hover ? "auto" : "none",
          }}
        >
          <button
            type="button"
            aria-label="Shto në të preferuarat"
            style={{
              width: 36,
              height: 36,
              background: "rgba(15,13,11,0.85)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              display: "grid",
              placeItems: "center",
              backdropFilter: "blur(6px)",
              cursor: "pointer",
            }}
            onClick={(e) => e.preventDefault()}
          >
            <Icon name="heart" />
          </button>
          <button
            type="button"
            aria-label="Shiko shpejt"
            style={{
              width: 36,
              height: 36,
              background: "rgba(15,13,11,0.85)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              display: "grid",
              placeItems: "center",
              backdropFilter: "blur(6px)",
              cursor: "pointer",
            }}
            onClick={(e) => e.preventDefault()}
          >
            <Icon name="eye" />
          </button>
        </div>

        {/* Hover add-to-cart bar — slides up from the bottom */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            padding: "14px 18px",
            background: "rgba(15,13,11,0.92)",
            backdropFilter: "blur(8px)",
            color: "var(--text)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 12,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            transform: `translateY(${hover ? 0 : 100}%)`,
            transition: "transform 0.3s ease",
          }}
        >
          <span>Shto në shportë</span>
          <Icon name="cart" />
        </div>
      </div>

      <div
        style={{
          paddingTop: 16,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--muted)",
          }}
        >
          {p.category}
        </div>
        <div
          className="serif"
          style={{ fontSize: 22, color: "var(--text)" }}
        >
          {p.name}
        </div>
        <div
          style={{ display: "flex", alignItems: "baseline", gap: 10 }}
        >
          <span
            style={{
              color: "var(--gold)",
              fontSize: 15,
              letterSpacing: "0.02em",
            }}
          >
            € {p.price}
          </span>
          {p.was && (
            <span
              style={{
                color: "var(--muted-2)",
                fontSize: 13,
                textDecoration: "line-through",
              }}
            >
              € {p.was}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
