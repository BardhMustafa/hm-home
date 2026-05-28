import { ProductCard, type ProductCardData } from "./product-card";
import { getFeaturedProducts } from "@/lib/products";

// Fallback fixture — shown when Supabase has no featured products yet
// (fresh install or before any product is flagged featured).
const FALLBACK: ProductCardData[] = [
  {
    name: "Karrige Lulëzimi",
    slug: "karrige-lulezimi",
    category: "Dekor / Karrige",
    price: 489,
    badge: "new",
    image: null,
  },
  {
    name: "Divan Veneto",
    slug: "divan-veneto",
    category: "Divane / 3-vendësh",
    price: 1290,
    was: 1490,
    badge: "sale",
  },
  {
    name: "Krevat Aurora",
    slug: "krevat-aurora",
    category: "Dhoma Gjumi",
    price: 980,
  },
  {
    name: "Tavolinë Toscana",
    slug: "tavoline-toscana",
    category: "Kuzhina / Tavolinë",
    price: 720,
    was: 850,
    badge: "sale",
  },
];

export async function Featured() {
  const real = await getFeaturedProducts(4);
  const products = real.length ? real : FALLBACK;

  return (
    <section
      className="r-px"
      style={{
        paddingTop: 20,
        paddingBottom: "clamp(72px, 10vw, 120px)",
      }}
    >
      <div
        className="r-stack-sm"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 44,
          gap: 24,
        }}
      >
        <div>
          <div className="eyebrow">Të zgjedhurat e javës</div>
          <h2
            className="serif"
            style={{
              fontSize: "clamp(32px, 6vw, 48px)",
              margin: "14px 0 0",
              lineHeight: 1,
              color: "var(--text)",
            }}
          >
            Pjesët e momentit.
          </h2>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn--ghost" style={{ padding: "12px 14px" }}>
            ←
          </button>
          <button className="btn btn--ghost" style={{ padding: "12px 14px" }}>
            →
          </button>
        </div>
      </div>

      <div className="r-grid-cards">
        {products.map((p) => (
          <ProductCard key={p.slug} p={p} />
        ))}
      </div>
    </section>
  );
}
