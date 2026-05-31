import Link from "next/link";
import Image from "next/image";
import { getCart } from "@/lib/cart";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { updateCartItemAction, removeCartItemAction } from "./actions";

export const metadata = { title: "Shporta — HM Home" };

export default async function CartPage() {
  const cart = await getCart();

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
        {cart.lines.length === 0 ? (
          <>
            {/* ── Editorial empty state ── */}
            <div
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                paddingTop: "clamp(32px, 6vh, 72px)",
                paddingBottom: "clamp(48px, 8vh, 88px)",
                overflow: "hidden",
              }}
            >
              {/* Ghost zero */}
              <div
                className="serif"
                aria-hidden
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -54%)",
                  fontSize: "min(72vw, 500px)",
                  lineHeight: 0.8,
                  color: "var(--text)",
                  opacity: 0.022,
                  pointerEvents: "none",
                  userSelect: "none",
                  letterSpacing: "-0.04em",
                }}
              >
                0
              </div>

              <div className="eyebrow" style={{ marginBottom: 32, position: "relative", zIndex: 1 }}>
                Shporta
              </div>

              <h1
                className="serif"
                style={{
                  fontSize: "clamp(52px, 9vw, 108px)",
                  lineHeight: 0.92,
                  letterSpacing: "-0.025em",
                  margin: "0 0 28px",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                Asgjë këtu —
                <br />
                <em style={{ color: "var(--gold)", fontStyle: "italic" }}>ende jo.</em>
              </h1>

              <p
                style={{
                  fontSize: 15,
                  color: "var(--muted)",
                  lineHeight: 1.75,
                  maxWidth: 380,
                  margin: "0 0 44px",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                Zbuloni koleksionin tonë dhe shtoni gjithçka që ju frymëzon.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  justifyContent: "center",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <Link href="/shop" className="btn btn--solid" style={{ padding: "14px 40px" }}>
                  Shfleto dyqanin
                </Link>
                <Link href="/shop" className="btn btn--ghost" style={{ padding: "14px 40px" }}>
                  Kategoritë
                </Link>
              </div>
            </div>

            {/* ── Category quick-access grid ── */}
            <div
              style={{
                borderTop: "1px solid var(--border-soft)",
                paddingTop: "clamp(36px, 5vw, 56px)",
                paddingBottom: "clamp(36px, 5vw, 56px)",
              }}
            >
              <div className="eyebrow" style={{ marginBottom: 28, color: "var(--muted)" }}>
                Ku të filloni
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 1,
                }}
              >
                {[
                  { name: "Kuzhina", slug: "kuzhina", n: "42" },
                  { name: "Divane", slug: "divane", n: "68" },
                  { name: "Dhoma Gjumi", slug: "dhoma-gjumi", n: "31" },
                  { name: "Dekor", slug: "dekor", n: "124" },
                ].map((cat, i) => (
                  <Link
                    key={cat.slug}
                    href={`/shop?cat=${cat.slug}`}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: 44,
                      padding: "clamp(22px, 3vw, 34px) clamp(18px, 2.5vw, 28px)",
                      background: "var(--surface)",
                      textDecoration: "none",
                      borderLeft: i > 0 ? "1px solid var(--border-soft)" : "none",
                    }}
                  >
                    <span
                      className="mono"
                      style={{ fontSize: 11, letterSpacing: "0.22em", color: "var(--muted)" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <div
                        className="serif"
                        style={{ fontSize: "clamp(24px, 3vw, 38px)", color: "var(--text)", marginBottom: 10 }}
                      >
                        {cat.name}
                      </div>
                      <div style={{ fontSize: 11, letterSpacing: "0.18em", color: "var(--gold)", textTransform: "uppercase" }}>
                        {cat.n} produkte →
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
          <div className="eyebrow">Shporta</div>
          <h1
            className="serif"
            style={{ fontSize: "clamp(32px, 6vw, 48px)", margin: "12px 0 36px", lineHeight: 1 }}
          >
            Shporta juaj
          </h1>
          <div className="r-split r-split--cart">
            <section style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {cart.lines.map((line) => (
                <div
                  key={line.cart_item_id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "100px 1fr auto",
                    gap: 20,
                    padding: "20px",
                    background: "var(--surface)",
                    alignItems: "center",
                  }}
                >
                  <Link
                    href={`/product/${line.slug}`}
                    style={{
                      position: "relative",
                      aspectRatio: "1 / 1",
                      background: "var(--bg)",
                      overflow: "hidden",
                      display: "block",
                    }}
                  >
                    {line.image_url ? (
                      <Image
                        src={line.image_url}
                        alt={line.name}
                        fill
                        sizes="100px"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        className="ph"
                        data-label="—"
                        style={{ position: "absolute", inset: 0 }}
                      />
                    )}
                  </Link>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <Link
                      href={`/product/${line.slug}`}
                      className="serif"
                      style={{
                        fontSize: 20,
                        color: "var(--text)",
                        textDecoration: "none",
                      }}
                    >
                      {line.name}
                    </Link>
                    <div
                      style={{
                        color: "var(--gold)",
                        fontSize: 14,
                      }}
                    >
                      {line.price.toFixed(2)} €
                    </div>
                    <form
                      action={updateCartItemAction.bind(null, line.cart_item_id)}
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <input
                        type="number"
                        name="quantity"
                        defaultValue={line.quantity}
                        min={1}
                        max={line.stock ?? undefined}
                        style={{
                          width: 64,
                          padding: "8px 10px",
                          background: "var(--bg)",
                          border: "1px solid var(--border)",
                          color: "var(--text)",
                          fontSize: 13,
                        }}
                      />
                      <button
                        type="submit"
                        style={{
                          fontSize: 11,
                          letterSpacing: "0.16em",
                          textTransform: "uppercase",
                          color: "var(--gold)",
                          background: "transparent",
                          border: 0,
                          cursor: "pointer",
                          padding: 4,
                        }}
                      >
                        Përditëso
                      </button>
                    </form>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 12,
                    }}
                  >
                    <div className="serif" style={{ fontSize: 20, color: "var(--text)" }}>
                      {line.line_total.toFixed(2)} €
                    </div>
                    <form
                      action={removeCartItemAction.bind(null, line.cart_item_id)}
                    >
                      <button
                        type="submit"
                        style={{
                          fontSize: 11,
                          letterSpacing: "0.16em",
                          textTransform: "uppercase",
                          color: "var(--muted)",
                          background: "transparent",
                          border: 0,
                          cursor: "pointer",
                        }}
                      >
                        Hiqe
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </section>

            <aside
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                padding: 28,
                position: "sticky",
                top: 24,
              }}
            >
              <div className="eyebrow" style={{ marginBottom: 18 }}>
                Përmbledhja
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 14,
                  color: "var(--text-2)",
                  marginBottom: 10,
                }}
              >
                <span>Nën-totali ({cart.itemCount} artikuj)</span>
                <span>{cart.subtotal.toFixed(2)} €</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 14,
                  color: "var(--text-2)",
                  paddingBottom: 16,
                  marginBottom: 16,
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span>Transporti</span>
                <span>Llogaritet në checkout</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 24,
                }}
              >
                <span className="serif" style={{ fontSize: 22 }}>
                  Totali
                </span>
                <span className="serif" style={{ fontSize: 26, color: "var(--gold)" }}>
                  {cart.subtotal.toFixed(2)} €
                </span>
              </div>
              <Link
                href="/checkout"
                className="btn btn--solid"
                style={{ width: "100%", justifyContent: "center" }}
              >
                Vazhdo me blerjen
              </Link>
            </aside>
          </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
