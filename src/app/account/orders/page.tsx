import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";

export const metadata = { title: "Porositë e mia — HM Home" };

const STATUS_LABEL: Record<string, string> = {
  pending:    "Në pritje",
  confirmed:  "Konfirmuar",
  shipped:    "Në rrugë",
  delivered:  "Dorëzuar",
  cancelled:  "Anuluar",
};

export default async function MyOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, total, status, created_at, city")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <Header />
      <main
        className="r-px"
        style={{
          paddingTop: "clamp(56px, 10vw, 88px)",
          paddingBottom: "clamp(72px, 10vw, 120px)",
          maxWidth: 720,
          margin: "0 auto",
        }}
      >
        {/* Back + heading */}
        <Link
          href="/account"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--muted)",
            textDecoration: "none",
            marginBottom: 32,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          Llogaria
        </Link>

        <div className="eyebrow" style={{ marginBottom: 12 }}>Porositë e mia</div>
        <h1
          className="serif"
          style={{ fontSize: "clamp(28px, 5vw, 42px)", margin: "0 0 40px", lineHeight: 1.05 }}
        >
          {orders?.length
            ? `${orders.length} porosi`
            : "Asnjë porosi ende."}
        </h1>

        {!orders?.length ? (
          /* ── Empty state ── */
          <div
            style={{
              position: "relative",
              border: "1px solid var(--border-soft)",
              background: "var(--surface)",
              padding: "clamp(48px, 8vw, 72px) clamp(24px, 5vw, 48px)",
              textAlign: "center",
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
                transform: "translate(-50%, -52%)",
                fontSize: "clamp(180px, 40vw, 320px)",
                lineHeight: 0.85,
                color: "var(--text)",
                opacity: 0.03,
                pointerEvents: "none",
                userSelect: "none",
                letterSpacing: "-0.04em",
              }}
            >
              0
            </div>

            <div style={{ position: "relative", zIndex: 1 }}>
              <p style={{ margin: "0 0 28px", fontSize: 15, color: "var(--text-2)", lineHeight: 1.6, maxWidth: 320, marginInline: "auto" }}>
                Nuk keni bërë asnjë porosi ende. Zbuloni koleksionin tonë dhe gjeni diçka që ju frymëzon.
              </p>
              <Link href="/shop" className="btn btn--solid" style={{ padding: "13px 32px", fontSize: 11 }}>
                Shfleto dyqanin
              </Link>
            </div>
          </div>
        ) : (
          /* ── Orders list ── */
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {orders.map((o) => {
              const statusLabel = STATUS_LABEL[o.status] ?? o.status;
              const isDelivered = o.status === "delivered";
              const isCancelled = o.status === "cancelled";
              const dotColor = isCancelled ? "var(--muted)" : isDelivered ? "#6dbf7e" : "var(--gold)";

              return (
                <Link
                  key={o.id}
                  href={`/account/orders/${o.id}`}
                  className="order-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    alignItems: "center",
                    gap: 16,
                    padding: "20px 20px 20px 24px",
                    background: "var(--surface)",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {/* Order id + date */}
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 12,
                          color: "var(--gold)",
                          letterSpacing: "0.08em",
                        }}
                      >
                        #{o.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>
                        {new Date(o.created_at).toLocaleDateString("sq-AL", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Status + city */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-2)" }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
                        {statusLabel}
                      </span>
                      {o.city && (
                        <>
                          <span style={{ color: "var(--border)", fontSize: 10 }}>·</span>
                          <span style={{ fontSize: 12, color: "var(--muted)" }}>{o.city}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Total + arrow */}
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <span className="serif" style={{ fontSize: 22, color: "var(--gold)" }}>
                      {Number(o.total).toFixed(2)} €
                    </span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted)", flexShrink: 0 }}>
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
