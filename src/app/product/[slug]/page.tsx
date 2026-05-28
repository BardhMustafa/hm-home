import Image from "next/image";
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
import { AddToCartButton } from "@/components/shop/add-to-cart-button";

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
  const related = await getRelatedProducts(product.id, row?.category_id ?? null);

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
        product.stock > 0
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
          {/* Gallery */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                position: "relative",
                aspectRatio: "4 / 5",
                background: "var(--surface)",
                overflow: "hidden",
              }}
            >
              {product.images[0] ? (
                <Image
                  src={product.images[0].image_url}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div
                  className="ph"
                  data-label="product"
                  style={{ position: "absolute", inset: 0 }}
                />
              )}
            </div>
            {product.images.length > 1 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 8,
                }}
              >
                {product.images.slice(1, 5).map((img) => (
                  <div
                    key={img.image_url}
                    style={{
                      position: "relative",
                      aspectRatio: "1 / 1",
                      background: "var(--surface)",
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      src={img.image_url}
                      alt=""
                      fill
                      sizes="200px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {product.category && (
              <div className="eyebrow">{product.category.name}</div>
            )}
            <h1
              className="serif"
              style={{
                fontSize: "clamp(34px, 6vw, 56px)",
                margin: 0,
                lineHeight: 1,
                letterSpacing: "-0.015em",
              }}
            >
              {product.name}
            </h1>

            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 16,
                paddingBottom: 24,
                borderBottom: "1px solid var(--border-soft)",
              }}
            >
              <span
                className="serif"
                style={{ fontSize: 36, color: "var(--gold)" }}
              >
                € {shownPrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <span
                  style={{
                    color: "var(--muted-2)",
                    fontSize: 18,
                    textDecoration: "line-through",
                  }}
                >
                  € {product.price.toFixed(2)}
                </span>
              )}
            </div>

            {product.description && (
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.65,
                  color: "var(--text-2)",
                  margin: 0,
                  whiteSpace: "pre-wrap",
                }}
              >
                {product.description}
              </p>
            )}

            <div
              style={{
                fontSize: 12,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: product.stock > 0 ? "var(--gold)" : "var(--sale)",
              }}
            >
              {product.stock > 0
                ? `Në stok · ${product.stock} copë`
                : "Përkohësisht nuk është në stok"}
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <AddToCartButton productId={product.id} disabled={product.stock <= 0} />
              <button className="btn btn--ghost">♡</button>
            </div>

            {product.sku && (
              <div
                style={{
                  marginTop: 4,
                  fontSize: 11,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                }}
              >
                SKU: {product.sku}
              </div>
            )}
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
                <ProductCard key={p.slug} p={p} />
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
