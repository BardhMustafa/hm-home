import Link from "next/link";
import { getShopProducts } from "@/lib/products";
import { ProductCard } from "@/components/home/product-card";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { createClient } from "@/lib/supabase/server";
import { hasSupabase } from "@/lib/supabase/env";

export const metadata = { title: "Dyqani — HM Home" };

const SORTS = [
  { id: "newest", label: "Më të rejat" },
  { id: "price-asc", label: "Çmimi: nga më i ulëti" },
  { id: "price-desc", label: "Çmimi: nga më i larti" },
] as const;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    cat?: string;
    sort?: "newest" | "price-asc" | "price-desc";
    min?: string;
    max?: string;
  }>;
}) {
  const sp = await searchParams;
  const categories = hasSupabase()
    ? (
        await (await createClient())
          .from("categories")
          .select("name, slug")
          .order("name")
      ).data
    : null;

  const products = await getShopProducts({
    category: sp.cat,
    sort: sp.sort ?? "newest",
    minPrice: sp.min ? Number(sp.min) : undefined,
    maxPrice: sp.max ? Number(sp.max) : undefined,
  });

  const activeCat = sp.cat ?? "";

  return (
    <>
      <Header />
      <main
        className="r-px"
        style={{
          paddingTop: 60,
          paddingBottom: "clamp(72px, 10vw, 120px)",
          minHeight: "60vh",
        }}
      >
        <div
          className="r-stack-sm"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 36,
            paddingBottom: 24,
            borderBottom: "1px solid var(--border-soft)",
            gap: 24,
          }}
        >
          <div>
            <div className="eyebrow">Dyqani</div>
            <h1
              className="serif"
              style={{
                fontSize: "clamp(36px, 7vw, 56px)",
                margin: "12px 0 0",
                lineHeight: 1,
              }}
            >
              {activeCat
                ? (categories?.find((c) => c.slug === activeCat)?.name ?? "Dyqani")
                : "Të gjitha produktet"}
            </h1>
          </div>

          <form
            action="/shop"
            style={{ display: "flex", gap: 12, alignItems: "flex-end" }}
          >
            <input type="hidden" name="cat" value={sp.cat ?? ""} />
            <label
              style={{
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--muted)",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              Renditja
              <select
                name="sort"
                defaultValue={sp.sort ?? "newest"}
                style={{
                  padding: "10px 12px",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                  fontSize: 13,
                }}
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <button className="btn btn--ghost" type="submit">
              Filtro
            </button>
          </form>
        </div>

        <div className="r-split r-split--shop">
          <aside>
            <div className="eyebrow" style={{ marginBottom: 14 }}>
              Kategoritë
            </div>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <li>
                <Link
                  href="/shop"
                  style={{
                    color: !activeCat ? "var(--gold)" : "var(--text-2)",
                    textDecoration: "none",
                    fontSize: 14,
                  }}
                >
                  Të gjitha
                </Link>
              </li>
              {categories?.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/shop?cat=${c.slug}`}
                    style={{
                      color: activeCat === c.slug ? "var(--gold)" : "var(--text-2)",
                      textDecoration: "none",
                      fontSize: 14,
                    }}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>

          <div>
            {products.length === 0 ? (
              <div
                style={{
                  padding: 60,
                  border: "1px dashed var(--border)",
                  textAlign: "center",
                  color: "var(--muted)",
                }}
              >
                Nuk u gjet asnjë produkt për kriteret e zgjedhura.
              </div>
            ) : (
              <div className="r-grid-cards3">
                {products.map((p) => (
                  <ProductCard key={p.slug} p={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
