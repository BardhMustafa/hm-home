"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Paneli" },
  { href: "/admin/products", label: "Produktet" },
  { href: "/admin/categories", label: "Kategoritë" },
  { href: "/admin/orders", label: "Porositë" },
  { href: "/admin/visits", label: "Vizitat" },
];

// Client component so the current section can be highlighted — the sidebar
// itself stays a server component.
export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {NAV.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            style={{
              padding: "10px 12px",
              fontSize: 13,
              letterSpacing: "0.08em",
              color: active ? "var(--gold)" : "var(--text-2)",
              background: active ? "var(--surface)" : "transparent",
              textDecoration: "none",
              borderLeft: active
                ? "2px solid var(--gold)"
                : "2px solid transparent",
              transition: "all 0.15s ease",
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
