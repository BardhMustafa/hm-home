import Link from "next/link";
import Image from "next/image";
import { getFeaturedProducts } from "@/lib/products";
import { getWishlistedIds } from "@/lib/wishlist";
import type { ProductCardData } from "./product-card";

const FALLBACK: ProductCardData[] = [
  { name: "Divan Veneto", slug: "divan-veneto", category: "Divane", price: 1290, was: 1490, badge: "sale" },
  { name: "Krevat Aurora", slug: "krevat-aurora", category: "Dhoma Gjumi", price: 980 },
  { name: "Karrige Lulëzimi", slug: "karrige-lulezimi", category: "Dekor", price: 489, badge: "new" },
  { name: "Tavolinë Toscana", slug: "tavoline-toscana", category: "Kuzhina", price: 720, was: 850, badge: "sale" },
];

export async function Featured() {
  const [real] = await Promise.all([
    getFeaturedProducts(4),
    getWishlistedIds(),
  ]);
  const products = real.length ? real : FALLBACK;
  const [primary, secondary, ...rest] = products;

  return (
    <section
      className="r-px"
      style={{ paddingTop: "clamp(72px, 10vw, 120px)", paddingBottom: "clamp(72px, 10vw, 120px)" }}
    >
      {/* Header */}
      <div
        className="r-stack-sm"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40, gap: 24 }}
      >
        <div>
          <div className="eyebrow">Të zgjedhurat</div>
          <h2 className="serif" style={{ fontSize: "clamp(32px, 5vw, 48px)", margin: "12px 0 0", lineHeight: 1, color: "var(--text)" }}>
            Pjesët e momentit.
          </h2>
        </div>
        <Link href="/shop" style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", textDecoration: "none", whiteSpace: "nowrap" }}>
          Shiko të gjitha →
        </Link>
      </div>

      {/* Editorial grid */}
      <div className="featured-grid">
        {/* Primary — large */}
        {primary && <EditorialCard p={primary} large />}

        {/* Secondary column */}
        <div className="featured-col">
          {secondary && <EditorialCard p={secondary} />}
          {rest.length > 0 && (
            <div className="featured-more-row">
              {rest.slice(0, 2).map((p) => (
                <EditorialCard key={p.slug} p={p} small />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function EditorialCard({ p, large, small }: { p: ProductCardData; large?: boolean; small?: boolean }) {
  return (
    <Link
      href={`/product/${p.slug}`}
      className="editorial-card"
      style={{ textDecoration: "none", color: "inherit", display: "block", position: "relative" }}
    >
      {/* Image */}
      <div
        style={{
          position: "relative",
          aspectRatio: large ? "3 / 4" : small ? "4 / 3" : "4 / 5",
          overflow: "hidden",
          background: "var(--surface)",
        }}
      >
        {p.image ? (
          <Image
            src={p.image}
            alt={p.name}
            fill
            sizes={large ? "50vw" : "25vw"}
            style={{ objectFit: "cover", transition: "transform 0.6s ease" }}
            className="editorial-img"
          />
        ) : (
          <div className="ph" data-label={p.slug} style={{ position: "absolute", inset: 0 }} />
        )}

        {/* Bottom gradient */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, transparent 45%, rgba(8,7,6,0.82) 100%)",
          zIndex: 1,
        }} />

        {/* Badge */}
        {p.badge && (
          <div style={{ position: "absolute", top: 14, left: 14, zIndex: 2 }}>
            <span className={`badge badge--${p.badge}`}>{p.badge === "sale" ? "ulje" : "i ri"}</span>
          </div>
        )}

        {/* Overlaid info */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: large ? "24px 28px" : "16px 20px",
          zIndex: 2,
        }}>
          <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 6 }}>
            {p.category}
          </div>
          <div
            className="serif"
            style={{ fontSize: large ? "clamp(22px, 3vw, 32px)" : small ? 16 : "clamp(18px, 2vw, 24px)", color: "var(--text)", lineHeight: 1.1 }}
          >
            {p.name}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
            <span style={{ fontSize: 14, color: "var(--gold)", fontWeight: 500 }}>€ {p.price.toFixed(2)}</span>
            {p.was && <span style={{ fontSize: 12, color: "var(--muted-2)", textDecoration: "line-through" }}>€ {p.was.toFixed(2)}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
