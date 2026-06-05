import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Pagination } from "@/components/admin/pagination";
import { VisitStatusControl } from "@/components/admin/visit-status";

export const metadata = { title: "Vizitat — Admin" };

const PAGE_SIZE = 50;

export default async function AdminVisitsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const from = (page - 1) * PAGE_SIZE;

  const supabase = await createClient();
  const { data: visits, count } = await supabase
    .from("visit_requests")
    .select(
      "id, full_name, phone, email, preferred_date, preferred_time, notes, status, created_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <>
      <AdminPageHeader eyebrow="Vizitat" title="Kërkesat për vizitë" />

      {!visits?.length ? (
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
          Asnjë kërkesë për vizitë ende.
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
              <Th>Kontakti</Th>
              <Th>Preferenca</Th>
              <Th>Shënime</Th>
              <Th>Statusi</Th>
              <Th>Dërguar</Th>
            </tr>
          </thead>
          <tbody>
            {visits.map((v) => (
              <tr key={v.id}>
                <Td>
                  <div style={{ color: "var(--text)", fontWeight: 500 }}>
                    {v.full_name}
                  </div>
                </Td>
                <Td>
                  <a
                    href={`tel:${v.phone}`}
                    style={{ color: "var(--text-2)", fontSize: 12, textDecoration: "none" }}
                  >
                    {v.phone}
                  </a>
                  {v.email && (
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                      {v.email}
                    </div>
                  )}
                </Td>
                <Td style={{ color: "var(--text-2)" }}>
                  {v.preferred_date
                    ? new Date(v.preferred_date).toLocaleDateString("sq-AL")
                    : "—"}
                  {v.preferred_time && (
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                      {v.preferred_time}
                    </div>
                  )}
                </Td>
                <Td style={{ color: "var(--muted)", maxWidth: 220 }}>
                  {v.notes
                    ? v.notes.length > 60
                      ? v.notes.slice(0, 60) + "…"
                      : v.notes
                    : "—"}
                </Td>
                <Td>
                  <VisitStatusControl id={v.id} current={v.status} />
                </Td>
                <Td>
                  <div style={{ color: "var(--text-2)", fontSize: 12 }}>
                    {new Date(v.created_at).toLocaleDateString("sq-AL")}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Pagination page={page} totalPages={totalPages} pathname="/admin/visits" />
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
