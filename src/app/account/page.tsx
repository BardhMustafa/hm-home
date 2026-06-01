import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { signout } from "../auth/actions";

export const metadata = { title: "Llogaria — HM Home" };

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user!.id)
    .single();

  const name = profile?.full_name ?? user!.email ?? "";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0].toUpperCase())
    .join("");

  return (
    <>
      <Header />
      <main
        className="r-px"
        style={{
          paddingTop: "clamp(56px, 10vw, 88px)",
          paddingBottom: "clamp(72px, 10vw, 120px)",
          maxWidth: 680,
          margin: "0 auto",
        }}
      >
        {/* Page label */}
        <div className="eyebrow" style={{ marginBottom: 36 }}>Llogaria</div>

        {/* Profile row */}
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 48 }}>
          {/* Avatar */}
          <div
            className="serif"
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              border: "1px solid var(--gold-deep)",
              display: "grid",
              placeItems: "center",
              fontSize: 22,
              color: "var(--gold)",
              flexShrink: 0,
              letterSpacing: "0.04em",
              background: "var(--surface)",
            }}
          >
            {initials}
          </div>

          <div>
            <div
              className="serif"
              style={{ fontSize: "clamp(24px, 4vw, 34px)", lineHeight: 1.1, color: "var(--text)" }}
            >
              {name}
            </div>
            <div style={{ marginTop: 6, fontSize: 13, color: "var(--muted)", letterSpacing: "0.04em" }}>
              {user!.email}
            </div>
          </div>
        </div>

        {/* Admin tiles */}
        {profile?.role === "admin" && (
          <div style={{ marginBottom: 32 }}>
            <div className="eyebrow" style={{ marginBottom: 16, fontSize: 10 }}>Admin</div>
            <div style={{ borderTop: "1px solid var(--border-soft)" }}>
              <Link
                href="/admin"
                className="account-tile"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  padding: "22px 4px",
                  borderBottom: "1px solid var(--border-soft)",
                  textDecoration: "none",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: "var(--gold)" }}>
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
                <span style={{ flex: 1, fontSize: 13, letterSpacing: "0.16em", textTransform: "uppercase" }}>
                  Paneli
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </Link>

              <Link
                href="/admin/orders"
                className="account-tile"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  padding: "22px 4px",
                  borderBottom: "1px solid var(--border-soft)",
                  textDecoration: "none",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: "var(--gold)" }}>
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                  <rect x="9" y="3" width="6" height="4" rx="1"/>
                  <line x1="9" y1="12" x2="15" y2="12"/>
                  <line x1="9" y1="16" x2="13" y2="16"/>
                </svg>
                <span style={{ flex: 1, fontSize: 13, letterSpacing: "0.16em", textTransform: "uppercase" }}>
                  Porositë
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </Link>

              <Link
                href="/admin/products"
                className="account-tile"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  padding: "22px 4px",
                  borderBottom: "1px solid var(--border-soft)",
                  textDecoration: "none",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: "var(--gold)" }}>
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
                <span style={{ flex: 1, fontSize: 13, letterSpacing: "0.16em", textTransform: "uppercase" }}>
                  Produktet
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </Link>
            </div>
          </div>
        )}

        {/* Action tiles */}
        <div style={{ borderTop: "1px solid var(--border-soft)" }}>
          {/* Orders */}
          <Link
            href="/account/orders"
            className="account-tile"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              padding: "22px 4px",
              borderBottom: "1px solid var(--border-soft)",
              textDecoration: "none",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: "var(--gold)" }}>
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
              <line x1="9" y1="12" x2="15" y2="12"/>
              <line x1="9" y1="16" x2="13" y2="16"/>
            </svg>
            <span style={{ flex: 1, fontSize: 13, letterSpacing: "0.16em", textTransform: "uppercase" }}>
              Porositë e mia
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </Link>

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="account-tile"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              padding: "22px 4px",
              borderBottom: "1px solid var(--border-soft)",
              textDecoration: "none",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: "var(--gold)" }}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span style={{ flex: 1, fontSize: 13, letterSpacing: "0.16em", textTransform: "uppercase" }}>
              Lista e dëshirave
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </Link>

          {/* Sign out */}
          <form action={signout}>
            <button
              type="submit"
              className="account-tile--muted"
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 18,
                padding: "22px 4px",
                background: "none",
                border: "none",
                borderBottom: "1px solid var(--border-soft)",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span style={{ flex: 1, fontSize: 13, letterSpacing: "0.16em", textTransform: "uppercase" }}>
                Dil
              </span>
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
