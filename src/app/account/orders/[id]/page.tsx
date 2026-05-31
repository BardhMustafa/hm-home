import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Detajet e porosisë — HM Home" };

export default async function MyOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: order }, { data: items }] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("order_items")
      .select("product_name, price, quantity")
      .eq("order_id", id),
  ]);

  // RLS will hide orders the user doesn't own; treat not-found and forbidden
  // the same so we don't leak existence.
  if (!order) notFound();

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
      <Link
        href="/account/orders"
        style={{
          fontSize: 11,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--muted)",
          textDecoration: "none",
        }}
      >
        ← Të gjitha porositë
      </Link>
      <h1
        className="serif"
        style={{ fontSize: 42, margin: "12px 0 8px", lineHeight: 1 }}
      >
        Porosia #{id.slice(0, 8)}
      </h1>
      <div style={{ color: "var(--text-2)", fontSize: 13, marginBottom: 32 }}>
        {new Date(order.created_at).toLocaleString("sq-AL")} ·{" "}
        <span style={{ color: "var(--gold)" }}>{order.status}</span>
      </div>

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
            <Th>Produkti</Th>
            <Th>Sasia</Th>
            <Th>Çmimi</Th>
          </tr>
        </thead>
        <tbody>
          {items?.map((it, i) => (
            <tr key={i}>
              <Td>{it.product_name}</Td>
              <Td>{it.quantity}</Td>
              <Td>{(Number(it.price) * it.quantity).toFixed(2)} €</Td>
            </tr>
          ))}
          <tr>
            <Td colSpan={2} style={{ textAlign: "right", color: "var(--muted)" }}>
              Nën-totali
            </Td>
            <Td>{Number(order.subtotal).toFixed(2)} €</Td>
          </tr>
          <tr>
            <Td colSpan={2} style={{ textAlign: "right", color: "var(--muted)" }}>
              Transporti
            </Td>
            <Td>{Number(order.shipping_cost).toFixed(2)} €</Td>
          </tr>
          <tr>
            <Td colSpan={2} style={{ textAlign: "right", color: "var(--gold)" }}>
              Totali
            </Td>
            <Td style={{ color: "var(--gold)" }}>
              {Number(order.total).toFixed(2)} €
            </Td>
          </tr>
        </tbody>
      </table>
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
  colSpan,
  style,
}: {
  children?: React.ReactNode;
  colSpan?: number;
  style?: React.CSSProperties;
}) {
  return (
    <td
      colSpan={colSpan}
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
