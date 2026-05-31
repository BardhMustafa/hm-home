import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";

export const metadata = { title: "Faleminderit — HM Home" };

// Reachable by URL after placement: anyone with the order id can read the
// confirmation. Guest orders have no auth.uid() so we use the admin client.
// Risk is low — the id is a uuid and only shared with the buyer.
export default async function CheckoutSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, full_name, total, status, city, address, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!order) notFound();

  return (
    <>
      <Header />
      <main
        className="r-px"
        style={{
          paddingTop: "clamp(72px, 12vw, 100px)",
          paddingBottom: "clamp(80px, 12vw, 140px)",
          maxWidth: 720,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <div className="eyebrow">Faleminderit</div>
        <h1
          className="serif"
          style={{
            fontSize: "clamp(36px, 7vw, 56px)",
            margin: "16px 0 20px",
            lineHeight: 1,
          }}
        >
          Porosia juaj u regjistrua.
        </h1>
        <p style={{ color: "var(--text-2)", fontSize: 16, maxWidth: 520, margin: "0 auto 40px" }}>
          Stafi i HM Home do t&apos;ju kontaktojë në orët në vijim për të
          konfirmuar dorëzimin.
        </p>

        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            padding: 28,
            textAlign: "left",
            display: "grid",
            gap: 10,
            fontSize: 14,
          }}
        >
          <div>
            <span style={{ color: "var(--muted)" }}>Nr. porosisë: </span>
            <span style={{ fontFamily: "var(--font-jetbrains)" }}>
              {order.id.slice(0, 8)}
            </span>
          </div>
          <div>
            <span style={{ color: "var(--muted)" }}>Emri: </span>
            {order.full_name}
          </div>
          <div>
            <span style={{ color: "var(--muted)" }}>Adresa: </span>
            {order.address}, {order.city}
          </div>
          <div>
            <span style={{ color: "var(--muted)" }}>Totali: </span>
            <span style={{ color: "var(--gold)" }}>
              {Number(order.total).toFixed(2)} €
            </span>
          </div>
        </div>

        <div style={{ marginTop: 40 }}>
          <Link href="/" className="btn btn--ghost">
            Kthehu në faqen kryesore
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
