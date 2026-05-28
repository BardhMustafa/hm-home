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
        <div className="eyebrow">Shporta</div>
        <h1
          className="serif"
          style={{
            fontSize: "clamp(32px, 6vw, 48px)",
            margin: "12px 0 36px",
            lineHeight: 1,
          }}
        >
          {cart.lines.length === 0
            ? "Shporta juaj është bosh."
            : "Shporta juaj"}
        </h1>

        {cart.lines.length === 0 ? (
          <div
            style={{
              padding: 60,
              border: "1px dashed var(--border)",
              textAlign: "center",
              maxWidth: 560,
            }}
          >
            <p style={{ color: "var(--text-2)", margin: "0 0 20px" }}>
              Shfletoni produktet tona dhe shtoni në shportë çfarë ju pëlqen.
            </p>
            <Link href="/shop" className="btn btn--solid">
              Shko në dyqan
            </Link>
          </div>
        ) : (
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
                      € {line.price.toFixed(2)}
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
                        max={line.stock}
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
                      € {line.line_total.toFixed(2)}
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
                <span>€ {cart.subtotal.toFixed(2)}</span>
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
                  € {cart.subtotal.toFixed(2)}
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
        )}
      </main>
      <Footer />
    </>
  );
}
