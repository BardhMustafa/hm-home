import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminRouteLoader } from "@/components/admin/route-loader";

export const metadata = { title: "Admin — HM Home" };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="r-admin-shell"
      style={{
        display: "grid",
        gridTemplateColumns: "240px 1fr",
        minHeight: "100vh",
        background: "var(--bg)",
      }}
    >
      <AdminRouteLoader />
      <AdminSidebar />
      <main className="r-admin-main" style={{ padding: "40px 48px" }}>
        {children}
      </main>
    </div>
  );
}
