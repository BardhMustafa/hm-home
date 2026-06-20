import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Pagination } from "@/components/admin/pagination";

export const metadata = { title: "Produktet — Admin" };

const PAGE_SIZE = 50;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { page: pageParam, q: qParam } = await searchParams;
  const q = (qParam ?? "").trim();
  const page = Math.max(1, Number(pageParam) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(
      "id, name, slug, price, discount_price, stock, featured, category:categories(name), images:product_images(image_url, position)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);
  if (q) query = query.ilike("name", `%${q}%`);
  const { data: raw, count } = await query;
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  // Supabase's PostgREST returns nested FK relations as arrays by default
  // even for single-row to-one joins; flatten to a single object.
  type Row = NonNullable<typeof raw>[number];
  const products = (raw ?? []).map((p: Row) => ({
    ...p,
    category: Array.isArray(p.category) ? p.category[0] ?? null : p.category,
  }));

  return (
    <>
      <AdminPageHeader
        eyebrow="Produktet"
        title="Të gjitha produktet"
        actions={
          <Link href="/admin/products/new" className="btn btn--solid">
            + Produkt i ri
          </Link>
        }
      />

      {/* Search by name — plain GET form, works without client JS. */}
      <form
        method="GET"
        action="/admin/products"
        style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}
      >
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Kërko produkt sipas emrit…"
          style={{
            flex: "1 1 260px",
            maxWidth: 380,
            padding: "10px 12px",
            background: "var(--bg)",
            border: "1px solid var(--border)",
            color: "var(--text)",
            fontSize: 13,
            outline: "none",
          }}
        />
        <button type="submit" className="btn">
          Kërko
        </button>
        {q && (
          <Link
            href="/admin/products"
            className="btn btn--ghost"
            style={{ alignSelf: "center" }}
          >
            ✕ Pastro
          </Link>
        )}
      </form>

      {q && (
        <div style={{ marginBottom: 16, fontSize: 13, color: "var(--muted)" }}>
          {count ?? 0} produkte u gjetën për &ldquo;{q}&rdquo;
        </div>
      )}

      {!products?.length ? (
        <div
          style={{
            padding: 32,
            background: "var(--surface)",
            border: "1px dashed var(--border)",
            color: "var(--muted)",
            textAlign: "center",
          }}
        >
          {q
            ? "Asnjë produkt nuk përputhet me kërkimin."
            : "Asnjë produkt ende. Shto të parin për të filluar."}
        </div>
      ) : (
        <table
          className="r-table"
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "var(--surface)",
            fontSize: 13,
          }}
        >
          <thead>
            <tr>
              <Th>Imazhi</Th>
              <Th>Emri</Th>
              <Th>Kategoria</Th>
              <Th>Çmimi</Th>
              <Th>Stoku</Th>
              <Th>I shfaqur</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const firstImage = [...(p.images ?? [])].sort(
                (a, b) => a.position - b.position,
              )[0];
              return (
                <tr key={p.id}>
                  <Td>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        background: "var(--bg)",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      {firstImage && (
                        <Image
                          src={firstImage.image_url}
                          alt=""
                          fill
                          sizes="48px"
                          style={{ objectFit: "cover" }}
                        />
                      )}
                    </div>
                  </Td>
                  <Td>
                    <Link
                      href={`/admin/products/${p.id}`}
                      style={{ color: "var(--text)", textDecoration: "none", fontWeight: 500 }}
                    >
                      {p.name}
                    </Link>
                  </Td>
                  <Td style={{ color: "var(--text-2)" }}>
                    {p.category?.name ?? "—"}
                  </Td>
                  <Td>
                    <span style={{ color: "var(--gold)" }}>€ {Number(p.price).toFixed(2)}</span>
                    {p.discount_price && (
                      <span
                        style={{
                          marginLeft: 8,
                          color: "var(--muted-2)",
                          textDecoration: "line-through",
                          fontSize: 12,
                        }}
                      >
                        € {Number(p.discount_price).toFixed(2)}
                      </span>
                    )}
                  </Td>
                  <Td
                    style={{
                      color:
                        p.stock === 0
                          ? "var(--sale)"
                          : p.stock === null
                            ? "var(--gold)"
                            : "var(--text)",
                      fontFamily: "var(--font-mono)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.stock === null
                      ? "Me porosi"
                      : p.stock === 0
                        ? "0 — S'ka stok"
                        : p.stock}
                  </Td>
                  <Td
                    style={{
                      color: p.featured ? "var(--gold)" : "var(--muted-2)",
                    }}
                  >
                    {p.featured ? "Po" : "—"}
                  </Td>
                  <Td style={{ textAlign: "right" }}>
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="btn"
                      style={{ fontSize: 11, whiteSpace: "nowrap" }}
                    >
                      Ndrysho →
                    </Link>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        pathname="/admin/products"
        params={q ? { q } : undefined}
      />
    </>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: "12px 14px",
        fontSize: 10,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: "var(--muted)",
        borderBottom: "1px solid var(--border)",
        fontWeight: 500,
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <td
      style={{
        padding: "12px 14px",
        borderBottom: "1px solid var(--border-soft)",
        verticalAlign: "middle",
        ...style,
      }}
    >
      {children}
    </td>
  );
}
