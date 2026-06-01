import Link from "next/link";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { ProductCard } from "@/components/home/product-card";
import { getWishlistProducts, getWishlistedIds } from "@/lib/wishlist";
import { createClient } from "@/lib/supabase/server";
import { hasSupabase } from "@/lib/supabase/env";

export const metadata = { title: "Të preferuarat — HM Home" };

export default async function WishlistPage() {
  const user = hasSupabase()
    ? (await (await createClient()).auth.getUser()).data.user
    : null;

  const [products, wishlistedIds] = await Promise.all([
    getWishlistProducts(),
    getWishlistedIds(),
  ]);

  return (
    <>
      <Header />
      <main
        className="r-px"
        style={{ paddingTop: 60, paddingBottom: "clamp(72px, 10vw, 120px)", minHeight: "60vh" }}
      >
        {/* Page header */}
        <div
          style={{
            marginBottom: 48,
            paddingBottom: 28,
            borderBottom: "1px solid var(--border-soft)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Llogaria</div>
            <h1
              className="serif"
              style={{ fontSize: "clamp(32px, 6vw, 52px)", margin: 0, lineHeight: 1 }}
            >
              Të preferuarat
            </h1>
          </div>
          {products.length > 0 && (
            <span style={{ fontSize: 12, color: "var(--muted)", letterSpacing: "0.06em" }}>
              {products.length} {products.length === 1 ? "produkt" : "produkte"}
            </span>
          )}
        </div>

        {!user ? (
          /* Not logged in */
          <div
            style={{
              padding: "80px 40px",
              border: "1px solid var(--border-soft)",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
            }}
          >
            <div className="serif" style={{ fontSize: 28, color: "var(--text)" }}>
              Kyçuni për të parë listën tuaj
            </div>
            <p style={{ fontSize: 14, color: "var(--muted)", maxWidth: 340, margin: 0, lineHeight: 1.6 }}>
              Ruani produktet tuaja të preferuara dhe gjeni ato lehtësisht herën tjetër.
            </p>
            <Link href="/auth/login" className="btn btn--solid" style={{ marginTop: 8 }}>
              Kyçu
            </Link>
          </div>
        ) : products.length === 0 ? (
          /* Logged in but empty */
          <div
            style={{
              padding: "80px 40px",
              border: "1px solid var(--border-soft)",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z" />
            </svg>
            <div className="serif" style={{ fontSize: 28, color: "var(--text)" }}>
              Lista juaj është bosh
            </div>
            <p style={{ fontSize: 14, color: "var(--muted)", maxWidth: 300, margin: 0, lineHeight: 1.6 }}>
              Klikoni ikonën e zemrës mbi çdo produkt për ta shtuar këtu.
            </p>
            <Link href="/shop" className="btn btn--solid" style={{ marginTop: 8 }}>
              Eksploro dyqanin
            </Link>
          </div>
        ) : (
          /* Product grid */
          <div className="r-grid-cards">
            {products.map((p) => (
              <ProductCard
                key={p.slug}
                p={p}
                isWishlisted={p.id ? wishlistedIds.has(p.id) : false}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
