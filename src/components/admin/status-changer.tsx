"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/app/admin/orders/actions";
import { STATUS_META } from "./orders-filter";

const STATUS_ORDER = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export function StatusChanger({
  orderId,
  current,
}: {
  orderId: string;
  current: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function change(status: string) {
    if (status === current) return;
    setError(null);
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.set("status", status);
        await updateOrderStatus(orderId, fd);
      } catch {
        // Surface the failure instead of letting it bubble to an error
        // boundary (which would blank the page) or silently no-op.
        setError("Përditësimi i statusit dështoi. Provoni përsëri.");
      }
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, position: "relative" }}>
      {isPending && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10,9,8,0.8)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
            backdropFilter: "blur(4px)",
          }}
        >
          <div className="admin-spinner" />
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "var(--muted)",
            }}
          >
            Duke përditësuar statusin…
          </div>
        </div>
      )}

      {/* Pipeline row */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {STATUS_ORDER.filter((s) => s !== "cancelled").map((s) => {
          const meta = STATUS_META[s];
          const active = current === s;
          return (
            <button
              key={s}
              onClick={() => change(s)}
              disabled={isPending}
              style={{
                padding: "8px 16px",
                fontSize: 10,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                fontFamily: "var(--font-mono), ui-monospace, monospace",
                background: active ? meta.bg : "transparent",
                color: active ? meta.color : "var(--muted)",
                border: `1px solid ${active ? meta.color : "var(--border)"}`,
                cursor: active ? "default" : "pointer",
                transition: "all 0.15s",
                flex: "1 1 auto",
                textAlign: "center",
              }}
            >
              {meta.label}
            </button>
          );
        })}
      </div>

      {/* Cancel — separate / destructive */}
      <button
        onClick={() => change("cancelled")}
        disabled={isPending || current === "cancelled" || current === "delivered"}
        style={{
          padding: "8px 16px",
          fontSize: 10,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          fontFamily: "var(--font-mono), ui-monospace, monospace",
          background: current === "cancelled" ? "rgba(239,68,68,0.12)" : "transparent",
          color: current === "cancelled" ? "#ef4444" : "var(--muted-2)",
          border: `1px solid ${current === "cancelled" ? "#ef4444" : "var(--border)"}`,
          cursor:
            current === "cancelled" || current === "delivered" ? "default" : "pointer",
          opacity: current === "delivered" ? 0.4 : 1,
          transition: "all 0.15s",
          width: "100%",
        }}
      >
        {STATUS_META.cancelled.label}
      </button>

      {error && (
        <div style={{ color: "#ef4444", fontSize: 12 }}>{error}</div>
      )}
    </div>
  );
}
