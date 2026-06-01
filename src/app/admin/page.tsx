import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader, StatCard } from "@/components/admin/page-header";

export const metadata = { title: "Paneli — Admin" };

type RecentOrder = {
  id: string;
  full_name: string;
  total: number;
  status: string;
  created_at: string;
};

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Parallel fetches — service-role isn't needed here, the admin RLS
  // policy on profiles/orders/products lets the signed-in admin read all.
  const [
    { count: ordersTotal },
    { count: pendingTotal },
    { count: productsTotal },
    { data: revenueRows },
    { data: lowStock },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("total").neq("status", "cancelled"),
    supabase
      .from("products")
      .select("id, name, stock")
      .lt("stock", 5)
      .order("stock", { ascending: true })
      .limit(6),
    supabase
      .from("orders")
      .select("id, full_name, total, status, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const revenue = (revenueRows ?? []).reduce(
    (sum, r) => sum + Number(r.total ?? 0),
    0,
  );

  return (
    <>
      <AdminPageHeader eyebrow="Admin" title="Paneli i administrimit" />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 16,
          marginBottom: 40,
        }}
      >
        <StatCard label="Porosi gjithsej" value={ordersTotal ?? 0} />
        <StatCard
          label="Të ardhura"
          value={`€ ${revenue.toFixed(0)}`}
          hint="Porositë e konfirmuara"
        />
        <StatCard label="Në pritje" value={pendingTotal ?? 0} />
        <StatCard label="Produkte" value={productsTotal ?? 0} />
      </div>

      <div className="r-split r-split--2" style={{ gap: 24 }}>
        <section>
          <h2
            className="serif"
            style={{ fontSize: 22, margin: "0 0 16px" }}
          >
            Porositë e fundit
          </h2>
          <RecentOrdersTable rows={(recentOrders ?? []) as RecentOrder[]} />
        </section>

        <section>
          <h2
            className="serif"
            style={{ fontSize: 22, margin: "0 0 16px" }}
          >
            Stoku i ulët
          </h2>
          <LowStockList rows={lowStock ?? []} />
        </section>
      </div>
    </>
  );
}

function RecentOrdersTable({ rows }: { rows: RecentOrder[] }) {
  if (!rows.length) return <Empty>Asnjë porosi ende.</Empty>;
  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <Th>Klienti</Th>
          <Th>Totali</Th>
          <Th>Statusi</Th>
          <Th>Data</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <Td>
              <Link href={`/admin/orders/${r.id}`} style={cellLink}>
                {r.full_name}
              </Link>
            </Td>
            <Td>€ {Number(r.total).toFixed(2)}</Td>
            <Td>
              <StatusPill status={r.status} />
            </Td>
            <Td>{new Date(r.created_at).toLocaleDateString("sq-AL")}</Td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function LowStockList({
  rows,
}: {
  rows: { id: string; name: string; stock: number }[];
}) {
  if (!rows.length) return <Empty>Të gjitha produktet kanë stok.</Empty>;
  return (
    <ul
      style={{
        listStyle: "none",
        padding: 0,
        margin: 0,
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      {rows.map((p) => (
        <li
          key={p.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "12px 14px",
            background: "var(--surface)",
            fontSize: 13,
          }}
        >
          <Link href={`/admin/products/${p.id}`} style={cellLink}>
            {p.name}
          </Link>
          <span
            style={{
              color: p.stock === 0 ? "var(--sale)" : "var(--gold)",
              fontFamily: "var(--font-jetbrains)",
            }}
          >
            {p.stock}
          </span>
        </li>
      ))}
    </ul>
  );
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending:    { label: "Në pritje",   color: "#d4960a" },
  confirmed:  { label: "Konfirmuar", color: "#3b82f6" },
  processing: { label: "Në proces",  color: "#8b5cf6" },
  shipped:    { label: "Dërguar",    color: "#f59e0b" },
  delivered:  { label: "Dorëzuar",   color: "#10b981" },
  cancelled:  { label: "Anuluar",    color: "var(--muted)" },
};

function StatusPill({ status }: { status: string }) {
  const meta = STATUS_LABEL[status] ?? { label: status, color: "var(--muted)" };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        background: "var(--elevated)",
        border: `1px solid ${meta.color}`,
        fontSize: 10,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: meta.color,
        fontFamily: "var(--font-jetbrains)",
      }}
    >
      {meta.label}
    </span>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: 24,
        background: "var(--surface)",
        border: "1px dashed var(--border)",
        color: "var(--muted)",
        fontSize: 13,
        textAlign: "center",
      }}
    >
      {children}
    </div>
  );
}

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 13,
  background: "var(--surface)",
};

function Th({ children }: { children: React.ReactNode }) {
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

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td
      style={{
        padding: "12px 14px",
        borderBottom: "1px solid var(--border-soft)",
      }}
    >
      {children}
    </td>
  );
}

const cellLink: React.CSSProperties = {
  color: "var(--text)",
  textDecoration: "none",
};
