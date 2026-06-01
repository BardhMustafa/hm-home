import Link from "next/link";
import { Wordmark } from "./wordmark";
import { createClient } from "@/lib/supabase/server";
import { getCart } from "@/lib/cart";
import { hasSupabase } from "@/lib/supabase/env";
import { MobileMenuButton } from "./mobile-menu";
import { HeaderShell } from "./header-shell";
import { NavAccount } from "./nav-account";

const NAV_LEFT = [
  { label: "Kuzhina", href: "/shop?cat=kuzhina" },
  { label: "Divane", href: "/shop?cat=divane" },
  { label: "Dhoma Gjumi", href: "/shop?cat=dhoma-gjumi" },
  { label: "Dekor", href: "/shop?cat=dekor" },
];

export async function Header({ overlay = false }: { overlay?: boolean }) {
  const supabase = hasSupabase() ? await createClient() : null;
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  const isAdmin = user && supabase
    ? (await supabase.from("profiles").select("role").eq("id", user.id).single()).data?.role === "admin"
    : false;
  const cart = await getCart();

  return (
    <HeaderShell overlay={overlay}>
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
          gap: 20,
          justifyContent: "flex-end",
          alignItems: "center",
          color: "var(--text-2)",
        }}
      >
        <NavAccount authed={Boolean(user)} isAdmin={Boolean(isAdmin)} />

        <Link
          href="/cart"
          aria-label="Shporta"
          style={{
            color: "inherit",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L20.6 8H6.2"/>
            <circle cx="10" cy="20" r="1.2"/><circle cx="17" cy="20" r="1.2"/>
          </svg>
          {cart.itemCount > 0 && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 18,
                height: 18,
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
    </HeaderShell>
  );
}
