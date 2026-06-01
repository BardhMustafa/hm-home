import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasSupabase } from "@/lib/supabase/env";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";

export const metadata = { title: "Faleminderit — HM Home" };

export default async function CheckoutSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [admin, user] = [
    createAdminClient(),
    hasSupabase()
      ? (await (await createClient()).auth.getUser()).data.user
      : null,
  ];
  const { data: order } = await admin
    .from("orders")
    .select("id, full_name, total, status, city, address, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!order) notFound();

  return (
    <>
      <Header />
      <main
        className="r-px"
        style={{
          paddingTop: "clamp(64px, 10vw, 100px)",
          paddingBottom: "clamp(80px, 12vw, 140px)",
          maxWidth: 600,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        {/* Check icon */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            border: "1.5px solid var(--gold)",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 32px",
            color: "var(--gold)",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>

        <div className="eyebrow" style={{ marginBottom: 16 }}>Faleminderit</div>
        <h1
          className="serif"
          style={{
            fontSize: "clamp(32px, 6vw, 52px)",
            margin: "0 0 16px",
            lineHeight: 1.05,
          }}
        >
          Porosia juaj u regjistrua.
        </h1>
        <p style={{ color: "var(--text-2)", fontSize: 15, lineHeight: 1.7, maxWidth: 440, margin: "0 auto 48px" }}>
          Stafi i HM Home do t&apos;ju kontaktojë në orët në vijim për të
          konfirmuar dorëzimin.
        </p>

        {/* Order details card */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-soft)",
            textAlign: "left",
            overflow: "hidden",
          }}
        >
          {/* Card header */}
          <div
            style={{
              padding: "16px 28px",
              borderBottom: "1px solid var(--border-soft)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span className="eyebrow" style={{ fontSize: 10 }}>Detajet e porosisë</span>
            <span
              style={{
                fontFamily: "var(--font-jetbrains)",
                fontSize: 11,
                color: "var(--gold)",
                letterSpacing: "0.08em",
              }}
            >
              #{order.id.slice(0, 8).toUpperCase()}
            </span>
          </div>

          {/* Rows */}
          {[
            {
              icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              ),
              label: "Emri",
              value: <span style={{ color: "var(--text)" }}>{order.full_name}</span>,
            },
            {
              icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              ),
              label: "Adresa",
              value: <span style={{ color: "var(--text)" }}>{order.address}, {order.city}</span>,
            },
            {
              icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" rx="1" />
                  <path d="M16 8h4l3 5v3h-7V8z" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              ),
              label: "Statusi",
              value: (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 11,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--gold)",
                  }}
                >
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--gold)", flexShrink: 0 }} />
                  Në pritje të konfirmimit
                </span>
              ),
            },
          ].map((row, i, arr) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "18px 28px",
                borderBottom: i < arr.length - 1 ? "1px solid var(--border-soft)" : "none",
              }}
            >
              <span style={{ color: "var(--muted)", flexShrink: 0 }}>{row.icon}</span>
              <span style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", width: 64, flexShrink: 0 }}>
                {row.label}
              </span>
              <span style={{ fontSize: 14 }}>{row.value}</span>
            </div>
          ))}

          {/* Total footer */}
          <div
            style={{
              padding: "20px 28px",
              background: "var(--bg)",
              borderTop: "1px solid var(--border-soft)",
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
            }}
          >
            <span className="serif" style={{ fontSize: 18 }}>Totali</span>
            <span className="serif" style={{ fontSize: 26, color: "var(--gold)" }}>
              {Number(order.total).toFixed(2)} €
            </span>
          </div>
        </div>

        {/* Guest upsell */}
        {!user && (
          <div
            style={{
              marginTop: 24,
              padding: "24px 28px",
              border: "1px solid var(--border-soft)",
              background: "var(--surface)",
              textAlign: "left",
              display: "flex",
              gap: 24,
              alignItems: "flex-start",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Krijoni llogari</div>
              <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--text-2)", lineHeight: 1.65 }}>
                Ndiqni gjendjen e porosisë, shikoni historikun dhe finalizoni blerjet e ardhshme më shpejt.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link href="/auth/register" className="btn btn--solid" style={{ padding: "11px 24px", fontSize: 11 }}>
                  Regjistrohu falas
                </Link>
                <Link href="/auth/login" className="btn btn--ghost" style={{ padding: "11px 24px", fontSize: 11 }}>
                  Kam llogari
                </Link>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: 32 }}>
          <Link href="/" className="btn btn--ghost" style={{ padding: "13px 36px" }}>
            Kthehu në faqen kryesore
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
