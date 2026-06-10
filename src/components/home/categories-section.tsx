"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ProductCardData } from "./product-card";

type Cat = {
  name: string;
  slug: string;
  productCount: number;
  image_url: string | null;
};

const CAT_DESCS: Record<string, string> = {
  kuzhina: "Kuzhina moderne, të punuara me përpikëri për çdo hapësirë.",
  divana: "Divana që të përqafojnë — lëkurë e pëlhura të zgjedhura me kujdes.",
  "dhoma-gjumi": "Qetësia fillon këtu. Krevate dhe komodë me dizajn të rafinuar.",
  dekore: "Detajet që e bëjnë shtëpinë tënde. Ndriçim, tekstile dhe aksesorë.",
};

export function CategoriesSection({
  cats,
  productsByCat,
}: {
  cats: Cat[];
  productsByCat: Record<string, ProductCardData[]>;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  // Arrows only make sense when the track actually overflows (mobile always,
  // desktop with 5+ categories). When everything fits, cards grow to fill the
  // row and this reads as a plain grid — so the arrows hide.
  const [hasOverflow, setHasOverflow] = useState(false);
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const check = () => setHasOverflow(track.scrollWidth > track.clientWidth + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(track);
    return () => ro.disconnect();
  }, []);

  const scrollByCard = (dir: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + 32 : track.clientWidth;
    track.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const arrowStyle: React.CSSProperties = {
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: "1px solid var(--border-soft)",
    background: "transparent",
    color: "var(--text-2)",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <section style={{ padding: "80px 7vw 100px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 48,
        }}
      >
        <div className="eyebrow" style={{ fontSize: 11, letterSpacing: "0.24em" }}>
          Kategoritë
        </div>
        {hasOverflow && (
          <div style={{ display: "flex", gap: 12 }}>
            <button type="button" aria-label="Kategoria e mëparshme" style={arrowStyle} onClick={() => scrollByCard(-1)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button type="button" aria-label="Kategoria tjetër" style={arrowStyle} onClick={() => scrollByCard(1)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div
        ref={trackRef}
        className="cat-carousel"
        style={{
          display: "flex",
          gap: 32,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {cats.map((cat, i) => {
          const prod   = productsByCat[cat.slug]?.[0];
          const isSale = prod?.badge === "sale";

          return (
            <Link
              key={cat.slug}
              href={`/shop?cat=${cat.slug}`}
              style={{
                textDecoration: "none",
                color: "inherit",
                // Cards flex between 280px and full width: while they can fit
                // by shrinking to minWidth the row reads as a grid; only past
                // that does the track overflow into a scrollable carousel.
                flex: "1 1 min(340px, 80vw)",
                minWidth: "min(280px, 80vw)",
                scrollSnapAlign: "start",
              }}
            >
              <div
                className="cat-grid-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                  cursor: "pointer",
                }}
              >
                {/* Image */}
                <div
                  style={{
                    position: "relative",
                    aspectRatio: "4 / 5",
                    background: "var(--surface)",
                    overflow: "hidden",
                  }}
                >
                  {prod?.badge && (
                    <span
                      style={{
                        position: "absolute",
                        top: 14,
                        left: 14,
                        zIndex: 2,
                        padding: "5px 10px",
                        fontFamily: "var(--font-mono), ui-monospace, monospace",
                        fontSize: 10,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        background: isSale ? "var(--sale)" : "transparent",
                        color: isSale ? "#15110d" : "var(--text)",
                        border: isSale ? "none" : "1px solid rgba(255,255,255,0.35)",
                      }}
                    >
                      {isSale ? "Ulje" : "I ri"}
                    </span>
                  )}
                  {prod?.image ? (
                    <Image
                      src={prod.image}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 768px) 80vw, 33vw"
                      style={{ objectFit: "cover", transition: "transform 0.5s ease" }}
                      className="cat-grid-img"
                    />
                  ) : (
                    <div className="ph" data-label={cat.slug} style={{ position: "absolute", inset: 0 }} />
                  )}
                </div>

                {/* Copy */}
                <div>
                  <div className="mono" style={{ fontSize: 11, letterSpacing: "0.28em", color: "var(--gold)", marginBottom: 8 }}>
                    {String(i + 1).padStart(2, "0")} / {String(cats.length).padStart(2, "0")}
                  </div>
                  <h2
                    className="serif"
                    style={{
                      fontWeight: 400,
                      fontSize: "clamp(28px, 3vw, 42px)",
                      lineHeight: 1,
                      letterSpacing: "-0.02em",
                      margin: 0,
                      color: "var(--text)",
                    }}
                  >
                    {cat.name}
                  </h2>
                  <div style={{ height: 1, width: 48, background: "var(--gold-deep)", margin: "16px 0" }} />
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--muted)" }}>
                    {CAT_DESCS[cat.slug] ?? `Koleksion ${cat.name.toLowerCase()} me stil të rafinuar.`}
                  </p>
                  <div style={{ marginTop: 18, fontSize: 12, letterSpacing: "0.2em", color: "var(--text-2)", textTransform: "uppercase" }}>
                    {cat.productCount} produkte
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
