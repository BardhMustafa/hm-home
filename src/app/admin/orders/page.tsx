import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/page-header";

export const metadata = { title: "Porositë — Admin" };

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, full_name, guest_email, total, status, created_at, city")
    .order("created_at", { ascending: false });

  return (
    <>
      <AdminPageHeader eyebrow="Porositë" title="Të gjitha porositë" />

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
          Asnjë porosi ende.
        </div>
      ) : (
        <table
          className="r-table"
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "var(--surface)",
            fontSize: 13,
          }}
        >
          <thead>
            <tr>
              <Th>Klienti</Th>
              <Th>Qyteti</Th>
              <Th>Totali</Th>
              <Th>Statusi</Th>
              <Th>Data</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <Td>
                  <div style={{ color: "var(--text)" }}>{o.full_name}</div>
                  {o.guest_email && (
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>
                      {o.guest_email}
                    </div>
                  )}
                </Td>
                <Td>{o.city}</Td>
                <Td style={{ color: "var(--gold)" }}>
                  € {Number(o.total).toFixed(2)}
                </Td>
                <Td>
                  <span
                    style={{
                      padding: "2px 8px",
                      background: "var(--elevated)",
                      border: "1px solid var(--border)",
                      fontSize: 10,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      fontFamily: "var(--font-jetbrains)",
                      color: "var(--text-2)",
                    }}
                  >
                    {o.status}
                  </span>
                </Td>
                <Td>{new Date(o.created_at).toLocaleString("sq-AL")}</Td>
                <Td style={{ textAlign: "right" }}>
                  <Link
                    href={`/admin/orders/${o.id}`}
                    style={{
                      fontSize: 12,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: "var(--gold)",
                      textDecoration: "none",
                    }}
                  >
                    Shiko →
                  </Link>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
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
        padding: "12px 14px",
        borderBottom: "1px solid var(--border-soft)",
        verticalAlign: "middle",
        ...style,
      }}
    >
      {children}
    </td>
  );
}
