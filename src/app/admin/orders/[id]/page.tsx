import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusChanger } from "@/components/admin/status-changer";
import { StatusBadge } from "@/components/admin/orders-filter";

export const metadata = { title: "Porosi — Admin" };

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: order }, { data: items }] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).single(),
    supabase.from("order_items").select("*").eq("order_id", id).order("id"),
  ]);

  if (!order) notFound();

  return (
    <>
      <AdminPageHeader
        eyebrow={`Porosi · ${id.slice(0, 8).toUpperCase()}`}
        title={order.full_name}
      />

      {/* Back link */}
      <Link
        href="/admin/orders"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 11,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--muted)",
          textDecoration: "none",
          marginBottom: 28,
        }}
      >
        ← Kthehu te porositë
      </Link>

      {/* Current status banner */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 16px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          marginBottom: 24,
        }}
      >
        <span style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--muted)" }}>
          Statusi aktual:
        </span>
        <StatusBadge status={order.status} />
        <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--muted)" }}>
          Krijuar: {new Date(order.created_at).toLocaleString("sq-AL")}
        </span>
      </div>

      <div className="r-split r-split--2" style={{ gap: 24 }}>
        {/* Left: items table */}
        <section>
          <h2 className="serif" style={{ fontSize: 20, margin: "0 0 14px", fontWeight: 400 }}>
            Artikujt e porositur
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
                  <Td style={{ color: "var(--text)", fontWeight: 500 }}>{it.product_name}</Td>
                  <Td>{it.quantity}</Td>
                  <Td>€ {Number(it.price).toFixed(2)}</Td>
                  <Td>€ {(Number(it.price) * it.quantity).toFixed(2)}</Td>
                </tr>
              ))}
              <tr>
                <Td colSpan={3} style={{ textAlign: "right", color: "var(--muted)", fontSize: 11 }}>
                  NËN-TOTALI
                </Td>
                <Td>€ {Number(order.subtotal).toFixed(2)}</Td>
              </tr>
              <tr>
                <Td colSpan={3} style={{ textAlign: "right", color: "var(--muted)", fontSize: 11 }}>
                  TRANSPORTI
                </Td>
                <Td>€ {Number(order.shipping_cost).toFixed(2)}</Td>
              </tr>
              <tr>
                <Td colSpan={3} style={{ textAlign: "right", color: "var(--gold)", fontSize: 11, letterSpacing: "0.1em" }}>
                  TOTALI
                </Td>
                <Td>
                  <span className="serif" style={{ fontSize: 20, color: "var(--gold)" }}>
                    € {Number(order.total).toFixed(2)}
                  </span>
                </Td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Right: actions + details */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Status changer */}
          <Card title="Ndrysho statusin">
            <StatusChanger orderId={id} current={order.status} />
          </Card>

          {/* Delivery info */}
          <Card title="Informacioni i dorëzimit">
            <DetailRow label="Emri" value={order.full_name} />
            <DetailRow label="Telefoni">
              <a
                href={`tel:${order.phone}`}
                style={{ color: "var(--gold)", textDecoration: "none", fontSize: 13 }}
              >
                {order.phone}
              </a>
            </DetailRow>
            <DetailRow label="Email" value={order.guest_email ?? "—"} />
            <div
              style={{
                padding: "12px 14px",
                background: "var(--elevated)",
                border: "1px solid var(--border)",
                marginTop: 4,
              }}
            >
              <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>
                Adresa e dorëzimit
              </div>
              <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6 }}>
                {order.address}
                <br />
                {order.city}
                {order.postal_code ? ` · ${order.postal_code}` : ""}
                <br />
                {order.country}
              </div>
            </div>
            {order.notes && (
              <div
                style={{
                  padding: "10px 12px",
                  background: "rgba(212,150,10,0.06)",
                  border: "1px solid rgba(212,150,10,0.2)",
                  fontSize: 13,
                  color: "var(--text-2)",
                  lineHeight: 1.55,
                  marginTop: 4,
                }}
              >
                <span style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#d4960a", display: "block", marginBottom: 4 }}>
                  Shënime
                </span>
                {order.notes}
              </div>
            )}
          </Card>

          {/* Meta */}
          <Card title="Meta">
            <DetailRow
              label="Krijuar"
              value={new Date(order.created_at).toLocaleString("sq-AL")}
            />
            <DetailRow
              label="Lloji"
              value={order.user_id ? "Klient i regjistruar" : "Mysafir"}
            />
            <DetailRow label="ID" value={id} mono />
          </Card>
        </aside>
      </div>
    </>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        padding: 18,
      }}
    >
      <div className="eyebrow" style={{ marginBottom: 14 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {children}
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
  children,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
      <span style={{ color: "var(--muted)", flexShrink: 0 }}>{label}</span>
      {children ?? (
        <span
          style={{
            color: "var(--text)",
            textAlign: "right",
            fontFamily: mono ? "var(--font-jetbrains), ui-monospace, monospace" : undefined,
            fontSize: mono ? 11 : 13,
          }}
        >
          {value}
        </span>
      )}
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: "10px 14px",
        fontSize: 10,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: "var(--muted)",
        borderBottom: "1px solid var(--border)",
        fontWeight: 500,
        background: "var(--elevated)",
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
        color: "var(--text-2)",
        ...style,
      }}
    >
      {children}
    </td>
  );
}
