import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { updateOrderStatus } from "../actions";

export const metadata = { title: "Porosi — Admin" };

const STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: order }, { data: items }] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).single(),
    supabase
      .from("order_items")
      .select("*")
      .eq("order_id", id)
      .order("id"),
  ]);

  if (!order) notFound();

  const updateWithId = updateOrderStatus.bind(null, id);

  return (
    <>
      <AdminPageHeader
        eyebrow={`Porosi · ${id.slice(0, 8)}`}
        title={order.full_name}
      />

      <div className="r-split r-split--2" style={{ gap: 24 }}>
        <section>
          <h2 className="serif" style={{ fontSize: 20, margin: "0 0 14px" }}>
            Artikujt
          </h2>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "var(--surface)",
              fontSize: 13,
            }}
          >
            <thead>
              <tr>
                <Th>Produkti</Th>
                <Th>Sasia</Th>
                <Th>Çmimi</Th>
                <Th>Nën-total</Th>
              </tr>
            </thead>
            <tbody>
              {items?.map((it) => (
                <tr key={it.id}>
                  <Td>{it.product_name}</Td>
                  <Td>{it.quantity}</Td>
                  <Td>€ {Number(it.price).toFixed(2)}</Td>
                  <Td>€ {(Number(it.price) * it.quantity).toFixed(2)}</Td>
                </tr>
              ))}
              <tr>
                <Td colSpan={3} style={{ textAlign: "right", color: "var(--muted)" }}>
                  Nën-totali
                </Td>
                <Td>€ {Number(order.subtotal).toFixed(2)}</Td>
              </tr>
              <tr>
                <Td colSpan={3} style={{ textAlign: "right", color: "var(--muted)" }}>
                  Transporti
                </Td>
                <Td>€ {Number(order.shipping_cost).toFixed(2)}</Td>
              </tr>
              <tr>
                <Td
                  colSpan={3}
                  style={{ textAlign: "right", color: "var(--gold)" }}
                >
                  Totali
                </Td>
                <Td style={{ color: "var(--gold)" }}>
                  € {Number(order.total).toFixed(2)}
                </Td>
              </tr>
            </tbody>
          </table>
        </section>

        <aside style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Card title="Statusi">
            <form action={updateWithId} style={{ display: "flex", gap: 8 }}>
              <select
                name="status"
                defaultValue={order.status}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                  fontSize: 13,
                }}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button type="submit" className="btn btn--solid">
                Ruaj
              </button>
            </form>
          </Card>

          <Card title="Dorëzimi">
            <Detail label="Emri" value={order.full_name} />
            <Detail label="Telefoni" value={order.phone} />
            <Detail
              label="Email"
              value={order.guest_email ?? "—"}
            />
            <Detail
              label="Adresa"
              value={`${order.address}, ${order.city}${order.postal_code ? ` ${order.postal_code}` : ""}, ${order.country}`}
            />
            {order.notes && <Detail label="Shënime" value={order.notes} />}
          </Card>

          <Card title="Meta">
            <Detail
              label="Krijuar"
              value={new Date(order.created_at).toLocaleString("sq-AL")}
            />
            <Detail label="Lloji" value={order.user_id ? "Klient i regjistruar" : "Mysafir"} />
          </Card>
        </aside>
      </div>
    </>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        padding: 18,
      }}
    >
      <div className="eyebrow" style={{ marginBottom: 12 }}>
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {children}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ fontSize: 13 }}>
      <span style={{ color: "var(--muted)" }}>{label}: </span>
      <span style={{ color: "var(--text)" }}>{value}</span>
    </div>
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
