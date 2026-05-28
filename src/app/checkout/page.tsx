import Link from "next/link";
import { redirect } from "next/navigation";
import { getCart } from "@/lib/cart";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { CheckoutForm } from "./form";

export const metadata = { title: "Përfundo blerjen — HM Home" };

export default async function CheckoutPage() {
  const cart = await getCart();
  if (cart.lines.length === 0) redirect("/cart");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  return (
    <>
      <Header />
      <main
        className="r-px"
        style={{ paddingTop: 60, paddingBottom: "clamp(72px, 10vw, 120px)" }}
      >
        <div className="eyebrow">Checkout</div>
        <h1
          className="serif"
          style={{
            fontSize: "clamp(32px, 6vw, 48px)",
            margin: "12px 0 36px",
            lineHeight: 1,
          }}
        >
          Përfundo blerjen.
        </h1>

        <div className="r-split r-split--checkout">
          <CheckoutForm
            defaults={{
              full_name: profile?.full_name ?? "",
              email: user?.email ?? "",
              phone: profile?.phone ?? "",
            }}
            authed={Boolean(user)}
          />

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
              Porosia juaj
            </div>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: "0 0 18px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {cart.lines.map((l) => (
                <li
                  key={l.cart_item_id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                    color: "var(--text-2)",
                  }}
                >
                  <span>
                    {l.name}{" "}
                    <span style={{ color: "var(--muted)" }}>× {l.quantity}</span>
                  </span>
                  <span style={{ color: "var(--text)" }}>
                    € {l.line_total.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                paddingTop: 16,
                borderTop: "1px solid var(--border)",
                alignItems: "baseline",
              }}
            >
              <span className="serif" style={{ fontSize: 22 }}>
                Totali
              </span>
              <span className="serif" style={{ fontSize: 26, color: "var(--gold)" }}>
                € {cart.subtotal.toFixed(2)}
              </span>
            </div>
            <p
              style={{
                marginTop: 16,
                fontSize: 12,
                color: "var(--muted)",
                lineHeight: 1.5,
              }}
            >
              Pagesa kryhet me para në dorë në momentin e dorëzimit. Stafi do
              t&apos;ju kontaktojë për të konfirmuar porosinë dhe orarin.
            </p>
            <Link
              href="/cart"
              style={{
                marginTop: 16,
                display: "block",
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--text-2)",
                textDecoration: "none",
              }}
            >
              ← Modifiko shportën
            </Link>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
