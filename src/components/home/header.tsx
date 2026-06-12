import Link from "next/link";
import { Wordmark } from "./wordmark";
import { createClient } from "@/lib/supabase/server";
import { getCart } from "@/lib/cart";
import { getNavCategories } from "@/lib/products";
import { hasSupabase } from "@/lib/supabase/env";
import { MobileMenuButton } from "./mobile-menu";
import { HeaderShell } from "./header-shell";
import { NavAccount } from "./nav-account";
import { CategoryNav } from "./category-nav";

export async function Header({ overlay = false }: { overlay?: boolean }) {
  const supabase = hasSupabase() ? await createClient() : null;
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  const isAdmin = user && supabase
    ? (await supabase.from("profiles").select("role").eq("id", user.id).single()).data?.role === "admin"
    : false;
  const cart = await getCart();

  // Categories drive the nav so it can never drift from the DB. The desktop
  // bar holds them all behind a "Kategoritë" dropdown (so it scales to any
  // number); the mobile drawer lists them all directly.
  const categories = await getNavCategories();

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
            categories={categories}
          />
        </div>

        {/* Desktop nav — hidden on mobile via .r-header-nav-left */}
        <CategoryNav categories={categories} />
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
