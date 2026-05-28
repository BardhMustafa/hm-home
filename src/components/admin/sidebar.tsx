import Link from "next/link";
import { Wordmark } from "@/components/home/wordmark";
import { signout } from "@/app/auth/actions";

const NAV = [
  { href: "/admin", label: "Paneli" },
  { href: "/admin/products", label: "Produktet" },
  { href: "/admin/categories", label: "Kategoritë" },
  { href: "/admin/orders", label: "Porositë" },
];

export function AdminSidebar() {
  return (
    <aside
      className="r-admin-sidebar"
      style={{
        width: 240,
        background: "var(--bg-2)",
        borderRight: "1px solid var(--border-soft)",
        padding: "32px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 32,
        position: "sticky",
        top: 0,
        height: "100vh",
      }}
    >
      <Link href="/" style={{ textDecoration: "none" }}>
        <Wordmark size={18} />
      </Link>

      <div className="eyebrow" style={{ fontSize: 10 }}>
        Admin
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              padding: "10px 12px",
              fontSize: 13,
              letterSpacing: "0.08em",
              color: "var(--text-2)",
              textDecoration: "none",
              borderLeft: "2px solid transparent",
              transition: "all 0.15s ease",
            }}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="r-admin-signout" style={{ marginTop: "auto" }}>
        <form action={signout}>
          <button
            type="submit"
            className="btn btn--ghost"
            style={{ width: "100%", justifyContent: "center" }}
          >
            Dilni
          </button>
        </form>
      </div>
    </aside>
  );
}
