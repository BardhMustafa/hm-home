"use client";

import { useState, useTransition } from "react";
import { revokeAdmin } from "@/app/admin/admins/actions";

export function RevokeAdmin({ userId, isSelf }: { userId: string; isSelf: boolean }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (isSelf) {
    return <span style={{ color: "var(--muted)", fontSize: 12 }}>Ju</span>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm("Hiqni të drejtat e adminit për këtë përdorues?")) return;
          setError(null);
          startTransition(async () => {
            const res = await revokeAdmin(userId);
            if (!res.ok) setError(res.error ?? "Veprimi dështoi.");
          });
        }}
        className="btn btn--ghost"
        style={{
          fontSize: 11,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#ef4444",
          cursor: pending ? "wait" : "pointer",
          opacity: pending ? 0.6 : 1,
        }}
      >
        {pending ? "Duke hequr…" : "Hiq"}
      </button>
      {error && <span style={{ color: "#ef4444", fontSize: 11 }}>{error}</span>}
    </div>
  );
}
