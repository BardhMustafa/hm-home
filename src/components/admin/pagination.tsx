import Link from "next/link";

// Server component. Preserves any existing filter query params and just
// swaps the `page` value, so paginating a filtered list keeps the filter.
export function Pagination({
  page,
  totalPages,
  pathname,
  params,
}: {
  page: number;
  totalPages: number;
  pathname: string;
  params?: Record<string, string>;
}) {
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const sp = new URLSearchParams(params ?? {});
    sp.set("page", String(p));
    return `${pathname}?${sp.toString()}`;
  };

  const base: React.CSSProperties = {
    fontSize: 11,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    padding: "8px 14px",
    border: "1px solid var(--border)",
    textDecoration: "none",
  };

  return (
    <nav
      style={{
        display: "flex",
        gap: 12,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 24,
      }}
    >
      {page > 1 ? (
        <Link href={href(page - 1)} style={{ ...base, color: "var(--gold)" }}>
          ← Mbrapa
        </Link>
      ) : (
        <span style={{ ...base, color: "var(--muted-2)", opacity: 0.4 }}>
          ← Mbrapa
        </span>
      )}
      <span style={{ fontSize: 12, color: "var(--muted)" }}>
        Faqja {page} / {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={href(page + 1)} style={{ ...base, color: "var(--gold)" }}>
          Para →
        </Link>
      ) : (
        <span style={{ ...base, color: "var(--muted-2)", opacity: 0.4 }}>
          Para →
        </span>
      )}
    </nav>
  );
}
