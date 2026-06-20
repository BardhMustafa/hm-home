import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { OrdersFilterBar, StatusBadge } from "@/components/admin/orders-filter";
import { Pagination } from "@/components/admin/pagination";

export const metadata = { title: "Porositë — Admin" };

const PAGE_SIZE = 50;

const STATUSES = [
  "pending", "confirmed", "processing", "shipped", "delivered", "cancelled",
] as const;

function periodStart(period: string): Date | null {
  const now = new Date();
  if (period === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  if (period === "week") {
    const d = new Date(now);
    d.setDate(d.getDate() - 6);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (period === "month") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  return null;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; status?: string; dateFrom?: string; dateTo?: string; q?: string; page?: string }>;
}) {
  const { period = "all", status = "", dateFrom = "", dateTo = "", q: qParam, page: pageParam } = await searchParams;
  const q = (qParam ?? "").trim();
  const page = Math.max(1, Number(pageParam) || 1);
  const supabase = await createClient();

  // Fetch all orders for stats (always unfiltered)
  const { data: allOrders } = await supabase
    .from("orders")
    .select("id, total, status, created_at");

  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);

  const stats = {
    total: allOrders?.length ?? 0,
    today: allOrders?.filter((o) => new Date(o.created_at) >= todayMidnight).length ?? 0,
    pending: allOrders?.filter((o) => o.status === "pending").length ?? 0,
    revenue: allOrders?.reduce((s, o) => s + Number(o.total), 0) ?? 0,
  };

  // Filtered orders for table
  let query = supabase
    .from("orders")
    .select(
      "id, full_name, guest_email, phone, total, status, created_at, city, address",
      { count: "exact" },
    )
    .order("created_at", { ascending: false });

  const hasCustomRange = Boolean(dateFrom || dateTo);

  if (hasCustomRange) {
    // Custom date range takes priority over period chips
    if (dateFrom) query = query.gte("created_at", `${dateFrom}T00:00:00.000Z`);
    if (dateTo) {
      // include the full dateTo day by going to next day midnight
      const end = new Date(`${dateTo}T00:00:00.000Z`);
      end.setDate(end.getDate() + 1);
      query = query.lt("created_at", end.toISOString());
    }
  } else {
    const from = periodStart(period);
    if (from) query = query.gte("created_at", from.toISOString());
  }

  if (status && STATUSES.includes(status as (typeof STATUSES)[number])) {
    query = query.eq("status", status);
  }

  // Free-text search across the fields an admin would recognise a customer by.
  if (q) {
    const safe = q.replace(/[%,]/g, " ");
    query = query.or(
      `full_name.ilike.%${safe}%,phone.ilike.%${safe}%,guest_email.ilike.%${safe}%`,
    );
  }

  const from = (page - 1) * PAGE_SIZE;
  query = query.range(from, from + PAGE_SIZE - 1);

  const { data: orders, count } = await query;
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  // Preserve active filters when paginating.
  const pageParams: Record<string, string> = {};
  if (period && period !== "all") pageParams.period = period;
  if (status) pageParams.status = status;
  if (dateFrom) pageParams.dateFrom = dateFrom;
  if (dateTo) pageParams.dateTo = dateTo;
  if (q) pageParams.q = q;

  return (
    <>
      <AdminPageHeader eyebrow="Porositë" title="Të gjitha porositë" />

      {/* Stats cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 1,
          marginBottom: 28,
        }}
      >
        {[
          { label: "Total porosi", value: stats.total.toString(), mono: true },
          { label: "Sot", value: stats.today.toString(), mono: true },
          { label: "Në pritje", value: stats.pending.toString(), mono: true, warn: stats.pending > 0 },
          { label: "Të ardhura", value: `€ ${stats.revenue.toFixed(2)}`, mono: false },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              padding: "18px 20px",
            }}
          >
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginBottom: 10,
              }}
            >
              {s.label}
            </div>
            <div
              className={s.mono ? "mono" : "serif"}
              style={{
                fontSize: s.mono ? 28 : 24,
                color: s.warn ? "#d4960a" : "var(--text)",
                lineHeight: 1,
              }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Search by customer — plain GET form, works without client JS. */}
      <form
        method="GET"
        action="/admin/orders"
        style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}
      >
        {/* Preserve active filters when searching. */}
        {period !== "all" && <input type="hidden" name="period" value={period} />}
        {status && <input type="hidden" name="status" value={status} />}
        {dateFrom && <input type="hidden" name="dateFrom" value={dateFrom} />}
        {dateTo && <input type="hidden" name="dateTo" value={dateTo} />}
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Kërko sipas emrit, telefonit ose email-it…"
          style={{
            flex: "1 1 280px",
            maxWidth: 420,
            padding: "10px 12px",
            background: "var(--bg)",
            border: "1px solid var(--border)",
            color: "var(--text)",
            fontSize: 13,
            outline: "none",
          }}
        />
        <button type="submit" className="btn">
          Kërko
        </button>
        {q && (
          <Link href="/admin/orders" className="btn btn--ghost" style={{ alignSelf: "center" }}>
            ✕ Pastro
          </Link>
        )}
      </form>

      {/* Filter chips */}
      <Suspense>
        <OrdersFilterBar
          currentPeriod={period}
          currentStatus={status}
          currentDateFrom={dateFrom}
          currentDateTo={dateTo}
        />
      </Suspense>

      {/* Orders count for current filter */}
      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.16em",
          color: "var(--muted)",
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        {count ?? 0} porosi{" "}
        {period !== "all" || status || q ? `(të filtruara)` : ""}
      </div>

      {!orders?.length ? (
        <div
          style={{
            padding: 40,
            background: "var(--surface)",
            border: "1px dashed var(--border)",
            color: "var(--muted)",
            textAlign: "center",
            fontSize: 14,
          }}
        >
          {q || period !== "all" || status
            ? "Asnjë porosi nuk përputhet me filtrat."
            : "Asnjë porosi ende."}
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
              <Th>Statusi</Th>
              <Th>Totali</Th>
              <Th>Data</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                {/* Customer: name, contact and destination in one scannable cell */}
                <Td>
                  <Link
                    href={`/admin/orders/${o.id}`}
                    style={{ color: "var(--text)", fontWeight: 500, textDecoration: "none" }}
                  >
                    {o.full_name}
                  </Link>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {o.phone && (
                      <a href={`tel:${o.phone}`} style={{ color: "var(--text-2)", textDecoration: "none" }}>
                        {o.phone}
                      </a>
                    )}
                    {o.city && <span>· {o.city}</span>}
                    {o.guest_email && <span>· {o.guest_email}</span>}
                  </div>
                </Td>
                <Td>
                  <StatusBadge status={o.status} />
                </Td>
                <Td>
                  <span style={{ color: "var(--gold)", fontWeight: 500 }}>
                    € {Number(o.total).toFixed(2)}
                  </span>
                </Td>
                <Td>
                  <div style={{ color: "var(--text-2)", fontSize: 12 }}>
                    {new Date(o.created_at).toLocaleDateString("sq-AL")}
                  </div>
                  <div style={{ color: "var(--muted)", fontSize: 11, marginTop: 2 }}>
                    {new Date(o.created_at).toLocaleTimeString("sq-AL", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </Td>
                <Td style={{ textAlign: "right" }}>
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="btn"
                    style={{ fontSize: 11, whiteSpace: "nowrap" }}
                  >
                    Hap →
                  </Link>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        pathname="/admin/orders"
        params={pageParams}
      />
    </>
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
