import Link from "next/link";
import { getShopProducts } from "@/lib/products";
import { ProductCard } from "@/components/home/product-card";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { createClient } from "@/lib/supabase/server";
import { hasSupabase } from "@/lib/supabase/env";
import { getWishlistedIds } from "@/lib/wishlist";
import { CategoryDropdown } from "@/components/shop/category-dropdown";

export const metadata = { title: "Dyqani — HM Home" };

const SORTS = [
  { id: "newest",     label: "Më të rejat" },
  { id: "price-asc",  label: "Çmimi: i ulëti" },
  { id: "price-desc", label: "Çmimi: i larti" },
] as const;


type Sp = {
  cat?:  string;
  sort?: "newest" | "price-asc" | "price-desc";
  min?:  string;
  max?:  string;
  sale?: string;
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<Sp> }) {
  const sp = await searchParams;

  const categories = hasSupabase()
    ? (await (await createClient()).from("categories").select("name, slug").order("name")).data
    : null;

  const [products, wishlistedIds] = await Promise.all([
    getShopProducts({
      category: sp.cat,
      sort:     sp.sort ?? "newest",
      minPrice: sp.min ? Number(sp.min) : undefined,
      maxPrice: sp.max ? Number(sp.max) : undefined,
      onSale:   sp.sale === "1",
    }),
    getWishlistedIds(),
  ]);

  const activeCat  = sp.cat  ?? "";
  const activeSort = sp.sort ?? "newest";
  const activeSale = sp.sale === "1";

  const activeCatName = categories?.find((c) => c.slug === activeCat)?.name;

  // Active filter chips for the results bar
  const chips: { label: string; href: string }[] = [];
  if (sp.min || sp.max) {
    const label = sp.min && sp.max ? `€${sp.min} – €${sp.max}` : sp.min ? `Min €${sp.min}` : `Max €${sp.max}`;
    chips.push({ label, href: buildQuery({ ...sp, min: undefined, max: undefined }) });
  }
  if (activeSale) {
    chips.push({ label: "Me ulje", href: buildQuery({ ...sp, sale: undefined }) });
  }

  // Query string without cat — passed to dropdown for URL building
  const queryWithoutCat = buildQuery({ ...sp, cat: undefined }).replace(/^\?/, "");

  return (
    <>
      <Header />
      <main
        className="r-px"
        style={{ paddingTop: 48, paddingBottom: "clamp(72px, 10vw, 120px)", minHeight: "60vh" }}
      >
        <div className="r-split r-split--shop" style={{ alignItems: "flex-start", gap: 0 }}>

          {/* ══ SIDEBAR ══════════════════════════════════════════ */}
          <aside
            className="shop-sidebar"
            style={{
              position: "sticky",
              top: 24,
              paddingRight: "clamp(24px, 3vw, 48px)",
              borderRight: "1px solid var(--border-soft)",
            }}
          >
            {/* Brand label */}
            <div style={{ marginBottom: 32, paddingBottom: 24, borderBottom: "1px solid var(--border-soft)" }}>
              <div className="eyebrow" style={{ fontSize: 10, letterSpacing: "0.3em" }}>HM Home</div>
              <div className="serif" style={{ fontSize: 22, marginTop: 6, color: "var(--text)" }}>
                {activeCatName ?? "Të gjitha"}
              </div>
              <div style={{ marginTop: 4, fontSize: 12, color: "var(--muted)" }}>
                {products.length} {products.length === 1 ? "produkt" : "produkte"}
              </div>
            </div>

            {/* ── Kategoritë — custom dropdown ── */}
            <div style={{ marginBottom: 32 }}>
              <div className="shop-section-head">Kategoritë</div>
              <CategoryDropdown
                categories={categories ?? []}
                activeCat={activeCat}
                query={queryWithoutCat}
              />
            </div>

            {/* ── Filter form ── */}
            <form action="/shop" method="GET">
              {sp.cat && <input type="hidden" name="cat" value={sp.cat} />}

              {/* Renditja */}
              <div style={{ marginBottom: 28 }}>
                <div className="shop-section-head">Renditja</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {SORTS.map((s) => (
                    <label key={s.id} className={`shop-filter-label${activeSort === s.id ? " active" : ""}`}>
                      <input type="radio" name="sort" value={s.id} defaultChecked={activeSort === s.id} className="shop-filter-radio" />
                      {s.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="shop-divider" />

              {/* Çmimi */}
              <div style={{ marginBottom: 28 }}>
                <div className="shop-section-head">Çmimi (€)</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div className="shop-price-wrap">
                    <span className="shop-price-prefix">€</span>
                    <input type="number" name="min" placeholder="Min" defaultValue={sp.min ?? ""} min={0} className="shop-price-input" />
                  </div>
                  <span style={{ color: "var(--border)", fontSize: 14 }}>—</span>
                  <div className="shop-price-wrap">
                    <span className="shop-price-prefix">€</span>
                    <input type="number" name="max" placeholder="Max" defaultValue={sp.max ?? ""} min={0} className="shop-price-input" />
                  </div>
                </div>
              </div>

              <div className="shop-divider" />

              {/* Ofertat */}
              <div style={{ marginBottom: 28 }}>
                <div className="shop-section-head">Ofertat</div>
                <label className={`shop-filter-label${activeSale ? " active" : ""}`}>
                  <input type="checkbox" name="sale" value="1" defaultChecked={activeSale} className="shop-filter-radio" />
                  Vetëm me ulje
                </label>
              </div>

              <button
                type="submit"
                className="btn btn--solid"
                style={{ width: "100%", justifyContent: "center", fontSize: 11, letterSpacing: "0.2em", padding: "13px 0" }}
              >
                Apliko
              </button>

              {chips.length > 0 && (
                <Link
                  href={`/shop${sp.cat ? `?cat=${sp.cat}` : ""}`}
                  style={{ display: "block", textAlign: "center", marginTop: 10, fontSize: 11, color: "var(--muted)", textDecoration: "none", letterSpacing: "0.1em", textTransform: "uppercase" }}
                >
                  Pastro të gjitha
                </Link>
              )}
            </form>
          </aside>

          {/* ══ PRODUCTS ═════════════════════════════════════════ */}
          <div style={{ paddingLeft: "clamp(24px, 3vw, 48px)", minWidth: 0 }}>

            {/* Results bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                marginBottom: 28,
                paddingBottom: 20,
                borderBottom: "1px solid var(--border-soft)",
                flexWrap: "wrap",
              }}
            >
              {/* Active filter chips */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                {chips.length > 0 ? chips.map((chip) => (
                  <Link
                    key={chip.label}
                    href={`/shop${chip.href}`}
                    className="shop-chip"
                  >
                    {chip.label}
                    <span style={{ marginLeft: 6, opacity: 0.6 }}>×</span>
                  </Link>
                )) : (
                  <span style={{ fontSize: 12, color: "var(--muted)", letterSpacing: "0.06em" }}>
                    {activeCatName ? activeCatName : "Të gjitha produktet"}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 12, color: "var(--muted)", flexShrink: 0, letterSpacing: "0.06em" }}>
                {products.length} {products.length === 1 ? "produkt" : "produkte"}
              </span>
            </div>

            {products.length === 0 ? (
              <div
                style={{
                  padding: "80px 40px",
                  border: "1px solid var(--border-soft)",
                  textAlign: "center",
                  color: "var(--muted)",
                  fontSize: 14,
                  letterSpacing: "0.06em",
                }}
              >
                Nuk u gjet asnjë produkt për kriteret e zgjedhura.
              </div>
            ) : (
              <div className="r-grid-cards">
                {products.map((p) => (
                  <ProductCard key={p.slug} p={p} isWishlisted={p.id ? wishlistedIds.has(p.id) : false} />
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

function buildQuery(params: Partial<Sp>): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== "" && v !== null,
  ) as [string, string][];
  if (!entries.length) return "";
  return "?" + new URLSearchParams(entries).toString();
}
