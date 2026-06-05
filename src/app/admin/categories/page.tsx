import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/page-header";

export const metadata = { title: "Kategoritë — Admin" };

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return (
    <>
      <AdminPageHeader
        eyebrow="Kategoritë"
        title="Të gjitha kategoritë"
        actions={
          <Link href="/admin/categories/new" className="btn btn--solid">
            + Kategori e re
          </Link>
        }
      />

      {!categories?.length ? (
        <div
          style={{
            padding: 32,
            background: "var(--surface)",
            border: "1px dashed var(--border)",
            color: "var(--muted)",
            textAlign: "center",
          }}
        >
          Asnjë kategori ende.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/admin/categories/${c.id}`}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                textDecoration: "none",
                color: "inherit",
                display: "block",
              }}
            >
              <div
                style={{
                  position: "relative",
                  aspectRatio: "4 / 5",
                  background: "var(--bg)",
                  overflow: "hidden",
                }}
              >
                {c.image_url ? (
                  <Image
                    src={c.image_url}
                    alt={c.name}
                    fill
                    sizes="220px"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div
                    className="ph"
                    data-label={c.slug}
                    style={{ position: "absolute", inset: 0 }}
                  />
                )}
              </div>
              <div style={{ padding: "12px 14px" }}>
                <div className="serif" style={{ fontSize: 18 }}>
                  {c.name}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--muted)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  /{c.slug}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
