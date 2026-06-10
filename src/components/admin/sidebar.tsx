import Link from "next/link";
import { Wordmark } from "@/components/home/wordmark";
import { AdminNav } from "@/components/admin/nav";
import { signout } from "@/app/auth/actions";

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

      <AdminNav />

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
