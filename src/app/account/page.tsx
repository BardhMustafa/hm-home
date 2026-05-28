import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signout } from "../auth/actions";

export const metadata = { title: "Llogaria — HM Home" };

export default async function AccountPage() {
  // Middleware already gated /account behind auth, so user is defined.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user!.id)
    .single();

  return (
    <main
      className="r-px"
      style={{
        paddingTop: "clamp(72px, 12vw, 100px)",
        paddingBottom: "clamp(72px, 10vw, 120px)",
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      <div className="eyebrow">Llogaria</div>
      <h1
        className="serif"
        style={{ fontSize: "clamp(32px, 6vw, 48px)", margin: "12px 0 32px" }}
      >
        Përshëndetje, {profile?.full_name ?? user!.email}.
      </h1>

      <div
        style={{
          border: "1px solid var(--border)",
          padding: 24,
          marginBottom: 24,
        }}
      >
        <div className="eyebrow" style={{ marginBottom: 12 }}>
          Të dhënat
        </div>
        <div style={{ display: "grid", gap: 6, fontSize: 14 }}>
          <div>
            <span style={{ color: "var(--muted)" }}>Email: </span>
            {user!.email}
          </div>
          {profile?.full_name && (
            <div>
              <span style={{ color: "var(--muted)" }}>Emri: </span>
              {profile.full_name}
            </div>
          )}
          <div>
            <span style={{ color: "var(--muted)" }}>Roli: </span>
            {profile?.role}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Link href="/account/orders" className="btn btn--solid">
          Porositë e mia
        </Link>
        <form action={signout}>
          <button className="btn btn--ghost" type="submit">
            Dilni
          </button>
        </form>
      </div>
    </main>
  );
}
