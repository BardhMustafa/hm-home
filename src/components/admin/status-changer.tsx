"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { updateOrderStatus } from "@/app/admin/orders/actions";
import { STATUS_META } from "./orders-filter";

// The normal lifecycle of an order, in order. `cancelled` sits outside this
// flow as a terminal/destructive state.
const FLOW = ["pending", "confirmed", "processing", "shipped", "delivered"] as const;
const ALL_STATUSES = [...FLOW, "cancelled"] as const;

export function StatusChanger({
  orderId,
  current,
}: {
  orderId: string;
  current: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close the dropdown when clicking outside or pressing Escape.
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function change(status: string) {
    setOpen(false);
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

  const currentMeta = STATUS_META[current] ?? {
    label: current,
    color: "var(--muted)",
    bg: "var(--surface)",
  };

  // Suggest the next logical step in the lifecycle (one-click advance).
  const flowIndex = FLOW.indexOf(current as (typeof FLOW)[number]);
  const next =
    flowIndex !== -1 && flowIndex < FLOW.length - 1 ? FLOW[flowIndex + 1] : null;
  const nextMeta = next ? STATUS_META[next] : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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

      {/* Dropdown */}
      <div ref={ref} style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          disabled={isPending}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 14px",
            background: "var(--elevated)",
            border: `1px solid ${open ? currentMeta.color : "var(--border)"}`,
            cursor: isPending ? "default" : "pointer",
            transition: "border-color 0.15s",
            textAlign: "left",
          }}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <Dot color={currentMeta.color} />
          <span
            style={{
              flex: 1,
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontFamily: "var(--font-mono), ui-monospace, monospace",
              color: currentMeta.color,
            }}
          >
            {currentMeta.label}
          </span>
          <span
            style={{
              color: "var(--muted)",
              fontSize: 10,
              transform: open ? "rotate(180deg)" : "none",
              transition: "transform 0.15s",
            }}
          >
            ▾
          </span>
        </button>

        {open && (
          <div
            role="listbox"
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              right: 0,
              zIndex: 50,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
              padding: 4,
            }}
          >
            {ALL_STATUSES.map((s, i) => {
              const meta = STATUS_META[s];
              const active = s === current;
              const isCancel = s === "cancelled";
              return (
                <div key={s}>
                  {isCancel && (
                    <div
                      style={{
                        height: 1,
                        background: "var(--border)",
                        margin: "4px 6px",
                      }}
                    />
                  )}
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => change(s)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      background: active ? meta.bg : "transparent",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={(e) => {
                      if (!active)
                        e.currentTarget.style.background = "var(--elevated)";
                    }}
                    onMouseLeave={(e) => {
                      if (!active) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <Dot color={meta.color} />
                    <span
                      style={{
                        flex: 1,
                        fontSize: 12,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        fontFamily: "var(--font-mono), ui-monospace, monospace",
                        color: active ? meta.color : "var(--text-2)",
                      }}
                    >
                      {!isCancel && (
                        <span style={{ color: "var(--muted-2)", marginRight: 8 }}>
                          {i + 1}.
                        </span>
                      )}
                      {meta.label}
                    </span>
                    {active && (
                      <span style={{ color: meta.color, fontSize: 12 }}>✓</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* One-click advance to the next step in the flow */}
      {next && nextMeta && (
        <button
          type="button"
          onClick={() => change(next)}
          disabled={isPending}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "11px 16px",
            fontSize: 11,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            fontFamily: "var(--font-mono), ui-monospace, monospace",
            background: nextMeta.bg,
            color: nextMeta.color,
            border: `1px solid ${nextMeta.color}`,
            cursor: isPending ? "default" : "pointer",
            transition: "opacity 0.15s",
          }}
        >
          Shëno si “{nextMeta.label}” →
        </button>
      )}

      {error && <div style={{ color: "#ef4444", fontSize: 12 }}>{error}</div>}
    </div>
  );
}

function Dot({ color }: { color: string }) {
  return (
    <span
      style={{
        width: 9,
        height: 9,
        borderRadius: "50%",
        background: color,
        flexShrink: 0,
        boxShadow: `0 0 0 3px color-mix(in srgb, ${color} 18%, transparent)`,
      }}
    />
  );
}
