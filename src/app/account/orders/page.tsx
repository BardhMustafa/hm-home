import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Porositë e mia — HM Home" };

export default async function MyOrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, total, status, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <main
      className="r-px"
      style={{
        paddingTop: "clamp(72px, 12vw, 100px)",
        paddingBottom: "clamp(72px, 10vw, 120px)",
        maxWidth: 880,
        margin: "0 auto",
      }}
    >
      <div className="eyebrow">Llogaria</div>
      <h1
        className="serif"
        style={{ fontSize: "clamp(32px, 6vw, 48px)", margin: "12px 0 32px" }}
      >
        Porositë e mia
      </h1>

      {!orders?.length ? (
        <div
          style={{
            padding: 32,
            background: "var(--surface)",
            border: "1px dashed var(--border)",
            color: "var(--muted)",
            textAlign: "center",
          }}
        >
          Nuk keni asnjë porosi ende.{" "}
          <Link href="/shop" style={{ color: "var(--gold)" }}>
            Shko në dyqan →
          </Link>
        </div>
      ) : (
        <table
          className="r-table"
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "var(--surface)",
            fontSize: 14,
          }}
        >
          <thead>
            <tr>
              <Th>Nr.</Th>
              <Th>Data</Th>
              <Th>Statusi</Th>
              <Th>Totali</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <Td style={{ fontFamily: "var(--font-jetbrains)" }}>
                  {o.id.slice(0, 8)}
                </Td>
                <Td>{new Date(o.created_at).toLocaleDateString("sq-AL")}</Td>
                <Td>
                  <span
                    style={{
                      padding: "2px 8px",
                      background: "var(--elevated)",
                      border: "1px solid var(--border)",
                      fontSize: 10,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "var(--text-2)",
                      fontFamily: "var(--font-jetbrains)",
                    }}
                  >
                    {o.status}
                  </span>
                </Td>
                <Td style={{ color: "var(--gold)" }}>
                  {Number(o.total).toFixed(2)} €
                </Td>
                <Td style={{ textAlign: "right" }}>
                  <Link
                    href={`/account/orders/${o.id}`}
                    style={{
                      fontSize: 12,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: "var(--gold)",
                      textDecoration: "none",
                    }}
                  >
                    Detajet →
                  </Link>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: "12px 14px",
        fontSize: 10,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: "var(--muted)",
        borderBottom: "1px solid var(--border)",
        fontWeight: 500,
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <td
      style={{
        padding: "14px 14px",
        borderBottom: "1px solid var(--border-soft)",
        ...style,
      }}
    >
      {children}
    </td>
  );
}
