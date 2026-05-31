import Link from "next/link";
import { Wordmark } from "./wordmark";
import { createClient } from "@/lib/supabase/server";
import { getCart } from "@/lib/cart";
import { hasSupabase } from "@/lib/supabase/env";
import { MobileMenuButton } from "./mobile-menu";

const NAV_LEFT = [
  { label: "Kuzhina", href: "/shop?cat=kuzhina" },
  { label: "Divane", href: "/shop?cat=divane" },
  { label: "Dhoma Gjumi", href: "/shop?cat=dhoma-gjumi" },
  { label: "Dekor", href: "/shop?cat=dekor" },
];

export async function Header({ overlay = false }: { overlay?: boolean }) {
  const user = hasSupabase()
    ? (await (await createClient()).auth.getUser()).data.user
    : null;
  const cart = await getCart();

  const borderColor = overlay
    ? "1px solid rgba(255,255,255,0.06)"
    : "1px solid var(--border-soft)";

  return (
    <header
      className="r-px r-header-grid"
      style={{
        paddingTop: 22,
        paddingBottom: 22,
        borderBottom: borderColor,
        position: overlay ? "absolute" : "relative",
        top: 0,
        left: 0,
        right: 0,
        background: overlay ? "transparent" : "var(--bg)",
        zIndex: 30,
      }}
    >
      {/* ── Left slot ──────────────────────────────────────────
          Desktop: nav links (hamburger hidden)
          Mobile:  hamburger button (nav links hidden)           */}
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        {/* Hamburger — visible only on mobile via .r-hamburger-wrap */}
        <div className="r-hamburger-wrap">
          <MobileMenuButton
            overlay={overlay}
            authed={Boolean(user)}
            cartCount={cart.itemCount}
          />
        </div>

        {/* Desktop nav — hidden on mobile via .r-header-nav-left */}
        <nav
          className="r-header-nav-left"
          style={{
            display: "flex",
            gap: 28,
            fontSize: 12,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--text-2)",
          }}
        >
          {NAV_LEFT.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              style={{ color: "inherit", textDecoration: "none" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* ── Center: wordmark (always) ── */}
      <Link href="/" style={{ textDecoration: "none" }}>
        <Wordmark />
      </Link>

      {/* ── Right slot ── */}
      <div
        style={{
          display: "flex",
          gap: 18,
          justifyContent: "flex-end",
          alignItems: "center",
          fontSize: 12,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--text-2)",
        }}
      >
        <Link
          href="/shop"
          className="r-hide-phone"
          style={{ color: "inherit", textDecoration: "none" }}
        >
          Kërko
        </Link>
        <Link
          href={user ? "/account" : "/auth/login"}
          className="r-hide-phone"
          style={{ color: "inherit", textDecoration: "none" }}
        >
          {user ? "Llogaria" : "Hyr"}
        </Link>
        <Link
          href="/cart"
          style={{
            color: "inherit",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {/* Text label on desktop */}
          <span className="r-hide-phone">Shporta</span>
          {/* Cart icon on mobile */}
          <span className="r-show-phone" aria-label="Shporta">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L20.6 8H6.2"/>
              <circle cx="10" cy="20" r="1.2"/><circle cx="17" cy="20" r="1.2"/>
            </svg>
          </span>
          {cart.itemCount > 0 && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "var(--gold)",
                color: "#15110d",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: 0,
              }}
            >
              {cart.itemCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
