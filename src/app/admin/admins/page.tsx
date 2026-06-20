import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AddAdminForm } from "@/components/admin/add-admin-form";
import { RevokeAdmin } from "@/components/admin/revoke-admin";

export const metadata = { title: "Adminët — Admin" };

export default async function AdminAdminsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Admin RLS allows reading all profiles. Emails live in auth.users, so look
  // each one up via the service-role admin API (N is small — just the admins).
  const { data: admins } = await supabase
    .from("profiles")
    .select("id, full_name, created_at")
    .eq("role", "admin")
    .order("created_at", { ascending: true });

  const adminClient = createAdminClient();
  const rows = await Promise.all(
    (admins ?? []).map(async (a) => {
      const { data } = await adminClient.auth.admin.getUserById(a.id);
      return { ...a, email: data.user?.email ?? "—" };
    }),
  );

  return (
    <>
      <AdminPageHeader
        eyebrow="Ekipi"
        title="Adminët"
      />

      <AddAdminForm />

      {!rows.length ? (
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
          Asnjë admin.
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
              <Th>Emri</Th>
              <Th>Email</Th>
              <Th>Shtuar</Th>
              <Th style={{ textAlign: "right" }}>Veprime</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id}>
                <Td>
                  <span style={{ color: "var(--text)", fontWeight: 500 }}>
                    {a.full_name || "—"}
                  </span>
                </Td>
                <Td style={{ color: "var(--text-2)" }}>{a.email}</Td>
                <Td style={{ color: "var(--muted)" }}>
                  {new Date(a.created_at).toLocaleDateString("sq-AL")}
                </Td>
                <Td style={{ textAlign: "right" }}>
                  <RevokeAdmin userId={a.id} isSelf={a.id === user?.id} />
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

function Th({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: React.CSSProperties;
}) {
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
        ...style,
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
