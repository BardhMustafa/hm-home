import Link from "next/link";
import Image from "next/image";
import { getHomepageCategories } from "@/lib/products";

const FALLBACK = [
  { name: "Kuzhina", slug: "kuzhina", productCount: 42, image_url: null },
  { name: "Divane", slug: "divane", productCount: 68, image_url: null },
  { name: "Dhoma Gjumi", slug: "dhoma-gjumi", productCount: 31, image_url: null },
  { name: "Dekor", slug: "dekor", productCount: 124, image_url: null },
];

export async function CategoryStrip() {
  const real = await getHomepageCategories();
  const cats = real.length >= 4 ? real.slice(0, 4) : FALLBACK;

  return (
    <section
      className="r-px"
      style={{
        paddingTop: "clamp(64px, 10vw, 100px)",
        paddingBottom: "clamp(56px, 8vw, 80px)",
        borderTop: "1px solid var(--border-soft)",
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
          <div className="eyebrow">Kategoritë</div>
          <h2
            className="serif"
            style={{
              fontSize: "clamp(32px, 6vw, 48px)",
              margin: "14px 0 0",
              lineHeight: 1,
              color: "var(--text)",
            }}
          >
            Çdo dhomë, e veçantë.
          </h2>
        </div>
        <Link
          href="/shop"
          style={{
            fontSize: 12,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--gold)",
            textDecoration: "none",
          }}
        >
          Të gjitha kategoritë →
        </Link>
      </div>

      <div className="r-grid-cats">
        {cats.map((c, i) => (
          <Link
            key={c.slug}
            href={`/shop?cat=${c.slug}`}
            style={{
              position: "relative",
              aspectRatio: "3 / 4",
              overflow: "hidden",
              textDecoration: "none",
              color: "inherit",
              display: "block",
            }}
          >
            {c.image_url ? (
              <Image
                src={c.image_url}
                alt={c.name}
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                style={{ objectFit: "cover" }}
              />
            ) : (
              <div
                className="ph"
                data-label={`category · ${c.name.toLowerCase()}`}
                style={{ position: "absolute", inset: 0 }}
              />
            )}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(10,9,8,0.05) 40%, rgba(10,9,8,0.85) 100%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 22,
                right: 22,
                bottom: 22,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--gold)",
                  marginBottom: 8,
                }}
              >
                0{i + 1}
              </div>
              <div
                className="serif"
                style={{
                  fontSize: 32,
                  color: "var(--text)",
                  lineHeight: 1,
                }}
              >
                {c.name}
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  color: "var(--text-2)",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>{c.productCount} produkte</span>
                <span>→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
