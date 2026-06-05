"use client";

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
  divane: "Divane që të përqafojnë — lëkurë e pëlhura të zgjedhura me kujdes.",
  "dhoma-gjumi": "Qetësia fillon këtu. Krevate dhe komodë me dizajn të rafinuar.",
  dekor: "Detajet që e bëjnë shtëpinë tënde. Ndriçim, tekstile dhe aksesorë.",
};

export function CategoriesSection({
  cats,
  productsByCat,
}: {
  cats: Cat[];
  productsByCat: Record<string, ProductCardData[]>;
}) {
  return (
    <section style={{ padding: "80px 7vw 100px" }}>
      <div className="eyebrow" style={{ fontSize: 11, letterSpacing: "0.24em", marginBottom: 48 }}>
        Kategoritë
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 32,
        }}
      >
        {cats.map((cat, i) => {
          const prod   = productsByCat[cat.slug]?.[0];
          const isSale = prod?.badge === "sale";

          return (
            <Link
              key={cat.slug}
              href={`/shop?cat=${cat.slug}`}
              style={{ textDecoration: "none", color: "inherit" }}
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
                        fontFamily: "var(--font-jetbrains), ui-monospace, monospace",
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
                      sizes="(max-width: 768px) 100vw, 33vw"
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
