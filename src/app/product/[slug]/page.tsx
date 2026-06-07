import { ProductGallery } from "@/components/shop/product-gallery";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/products";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { ProductCard } from "@/components/home/product-card";
import { ProductActions } from "@/components/shop/product-actions";
import { ProductAccordion } from "@/components/shop/product-accordion";
import { getWishlistedIds } from "@/lib/wishlist";

type PageParams = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produkti — HM Home" };

  const cover = product.images[0]?.image_url;
  return {
    title: `${product.name} — HM Home`,
    description: product.description ?? `${product.name} — HM Home`,
    openGraph: {
      title: product.name,
      description: product.description ?? undefined,
      images: cover ? [cover] : undefined,
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: PageParams) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  // category_id is filtered out of getProductBySlug's return, refetch the
  // id once for the related-products query. Trivial extra round-trip.
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("products")
    .select("category_id")
    .eq("id", product.id)
    .single();
  const [related, wishlistedIds] = await Promise.all([
    getRelatedProducts(product.id, row?.category_id ?? null),
    getWishlistedIds(),
  ]);

  const hasDiscount =
    typeof product.discount_price === "number" &&
    product.discount_price < product.price;
  const shownPrice = hasDiscount ? product.discount_price! : product.price;

  const ld = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    sku: product.sku ?? undefined,
    image: product.images.map((i) => i.image_url),
    offers: {
      "@type": "Offer",
      price: shownPrice,
      priceCurrency: "EUR",
      availability:
        product.stock === null || product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <Header />
      <main
        className="r-px"
        style={{ paddingTop: 60, paddingBottom: "clamp(64px, 9vw, 100px)" }}
      >
        <nav
          style={{
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: 32,
          }}
        >
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
            HM Home
          </Link>
          {" / "}
          <Link href="/shop" style={{ color: "inherit", textDecoration: "none" }}>
            Dyqani
          </Link>
          {product.category && (
            <>
              {" / "}
              <Link
                href={`/shop?cat=${product.category.slug}`}
                style={{ color: "inherit", textDecoration: "none" }}
              >
                {product.category.name}
              </Link>
            </>
          )}
        </nav>

        <div className="r-split r-split--product">
          <ProductGallery images={product.images} name={product.name} />

          {/* Info */}
          <div style={{ display: "flex", flexDirection: "column" }}>

            {/* Category + name */}
            <div style={{ marginBottom: 20 }}>
              {product.category && (
                <div className="eyebrow" style={{ marginBottom: 12 }}>{product.category.name}</div>
              )}
              <h1
                className="serif"
                style={{
                  fontSize: "clamp(32px, 5vw, 52px)",
                  margin: 0,
                  lineHeight: 1.05,
                  letterSpacing: "-0.015em",
                }}
              >
                {product.name}
              </h1>
              {product.sku && (
                <div style={{ marginTop: 10, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--muted)" }}>
                  SKU: {product.sku}
                </div>
              )}
            </div>

            <div style={{ height: 1, background: "var(--border-soft)", marginBottom: 24 }} />

            {/* Price */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 24 }}>
              <span style={{ fontSize: 28, fontWeight: 500, color: "var(--gold)", lineHeight: 1, letterSpacing: "0.01em" }}>
                {shownPrice} €
              </span>
              {hasDiscount && (
                <span style={{ color: "var(--muted-2)", fontSize: 16, textDecoration: "line-through", fontWeight: 400 }}>
                  {product.price} €
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--text-2)", margin: "0 0 24px" }}>
                  {product.description}
                </p>
                <div style={{ height: 1, background: "var(--border-soft)", marginBottom: 24 }} />
              </>
            )}

            {/* Stock badge */}
            <div style={{ marginBottom: 20 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  fontSize: 11,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  padding: "6px 12px",
                  border: `1px solid ${product.stock === 0 ? "var(--sale)" : "var(--gold)"}`,
                  color: product.stock === 0 ? "var(--sale)" : "var(--gold)",
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: product.stock === 0 ? "var(--sale)" : "var(--gold)",
                    flexShrink: 0,
                  }}
                />
                {product.stock === null
                  ? "Me porosi"
                  : product.stock > 0
                    ? `Në stok · ${product.stock} copë`
                    : "Nuk është në stok"}
              </span>
            </div>

            {/* Actions — qty selector + cart + wishlist */}
            <ProductActions
              productId={product.id}
              disabled={product.stock !== null && product.stock <= 0}
              initialWishlisted={wishlistedIds.has(product.id)}
              stock={product.stock}
            />

            {/* Made-to-order delivery note */}
            {product.stock === null && (
              <div
                style={{
                  marginTop: 20,
                  padding: "14px 16px",
                  border: "1px solid var(--border-soft)",
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                }}
              >
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 4 }}>
                    Informacion i dorëzimit
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>
                    Ky produkt prodhohet sipas porosisë. Koha e pritjes është zakonisht 3–6 javë. Do t&apos;ju kontaktojmë për konfirmim pas porosisë.
                  </p>
                </div>
              </div>
            )}

            {/* Trust badges */}
            <div
              className="product-trust-grid"
              style={{
                marginTop: 28,
                paddingTop: 24,
                borderTop: "1px solid var(--border-soft)",
              }}
            >
              {[
                {
                  icon: (
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="3" width="15" height="13" rx="1" />
                      <path d="M16 8h4l3 5v3h-7V8z" />
                      <circle cx="5.5" cy="18.5" r="2.5" />
                      <circle cx="18.5" cy="18.5" r="2.5" />
                    </svg>
                  ),
                  label: "Dorëzim falas",
                  sub: "Mbi €500",
                },
                {
                  icon: (
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  ),
                  label: "Garanci 2 vjet",
                  sub: "Çdo produkt",
                },
                {
                  icon: (
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  ),
                  label: "Prodhim Europian",
                  sub: "Nga viti 2002",
                },
              ].map((b) => (
                <div
                  key={b.label}
                  className="product-trust-badge"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    textAlign: "center",
                    padding: "16px 8px",
                    border: "1px solid var(--border-soft)",
                  }}
                >
                  <div style={{ color: "var(--gold)", flexShrink: 0 }}>{b.icon}</div>
                  <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text)", fontWeight: 500 }}>
                    {b.label}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.06em" }}>
                    {b.sub}
                  </div>
                </div>
              ))}
            </div>

            {/* Accordion — dimensions, materials, delivery, returns */}
            <div style={{ marginTop: 32 }}>
              <ProductAccordion />
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section style={{ marginTop: "clamp(64px, 10vw, 100px)" }}>
            <div className="eyebrow">Mund t&apos;ju pëlqejë</div>
            <h2
              className="serif"
              style={{
                fontSize: "clamp(28px, 5vw, 36px)",
                margin: "12px 0 32px",
                lineHeight: 1,
              }}
            >
              Produkte të ngjashme
            </h2>
            <div className="r-grid-cards">
              {related.map((p) => (
                <ProductCard
                  key={p.slug}
                  p={p}
                  isWishlisted={p.id ? wishlistedIds.has(p.id) : false}
                />
              ))}
            </div>
          </section>
        )}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      </main>
      <Footer />
    </>
  );
}
