import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminRouteLoader } from "@/components/admin/route-loader";

export const metadata = { title: "Admin — HM Home" };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Defense-in-depth: middleware already gates /admin, but re-verify here so
  // authorization never hangs on a single layer (a matcher change, a route
  // middleware doesn't run on, etc.). getUser() validates the JWT server-side.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/");

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
