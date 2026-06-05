"use client";

import { useTransition } from "react";
import { updateVisitStatus } from "@/app/admin/visits/actions";

const OPTIONS: { value: string; label: string }[] = [
  { value: "new", label: "I ri" },
  { value: "confirmed", label: "Konfirmuar" },
  { value: "done", label: "Përfunduar" },
  { value: "cancelled", label: "Anuluar" },
];

const COLOR: Record<string, string> = {
  new: "var(--gold)",
  confirmed: "#4a9e6a",
  done: "var(--muted)",
  cancelled: "#ef4444",
};

export function VisitStatusControl({
  id,
  current,
}: {
  id: string;
  current: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={current}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value;
        startTransition(() => updateVisitStatus(id, next));
      }}
      style={{
        background: "var(--bg)",
        border: `1px solid ${COLOR[current] ?? "var(--border)"}`,
        color: COLOR[current] ?? "var(--text)",
        fontSize: 11,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        padding: "6px 10px",
        cursor: pending ? "wait" : "pointer",
        opacity: pending ? 0.6 : 1,
      }}
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
