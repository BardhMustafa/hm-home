"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

const PERIODS = [
  { value: "all",   label: "Të gjitha" },
  { value: "today", label: "Sot"       },
  { value: "week",  label: "Kjo Javë"  },
  { value: "month", label: "Ky Muaj"   },
] as const;

export const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending:    { label: "Në pritje",    color: "#d4960a", bg: "rgba(212,150,10,0.12)"  },
  confirmed:  { label: "Konfirmuar",   color: "#3b82f6", bg: "rgba(59,130,246,0.12)"  },
  processing: { label: "Në procesim",  color: "#8b5cf6", bg: "rgba(139,92,246,0.12)"  },
  shipped:    { label: "Dërguar",      color: "#06b6d4", bg: "rgba(6,182,212,0.12)"   },
  delivered:  { label: "Dorëzuar",     color: "#10b981", bg: "rgba(16,185,129,0.12)"  },
  cancelled:  { label: "Anuluar",      color: "#ef4444", bg: "rgba(239,68,68,0.12)"   },
};

export function OrdersFilterBar({
  currentPeriod,
  currentStatus,
  currentDateFrom,
  currentDateTo,
}: {
  currentPeriod: string;
  currentStatus: string;
  currentDateFrom: string;
  currentDateTo: string;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();

  // Local date state — pre-filled from URL so inputs survive navigation
  const [dateFrom, setDateFrom] = useState(currentDateFrom);
  const [dateTo, setDateTo]     = useState(currentDateTo);

  const hasCustomRange = Boolean(currentDateFrom || currentDateTo);

  function navigatePeriod(value: string) {
    setDateFrom("");
    setDateTo("");
    startTransition(() => {
      const params = new URLSearchParams(sp.toString());
      params.delete("dateFrom");
      params.delete("dateTo");
      if (value === "all") params.delete("period");
      else params.set("period", value);
      router.push(`/admin/orders?${params.toString()}`);
    });
  }

  function navigateStatus(value: string) {
    startTransition(() => {
      const params = new URLSearchParams(sp.toString());
      if (value === "") params.delete("status");
      else params.set("status", value);
      router.push(`/admin/orders?${params.toString()}`);
    });
  }

  function applyCustomRange() {
    startTransition(() => {
      const params = new URLSearchParams(sp.toString());
      params.delete("period");
      if (dateFrom) params.set("dateFrom", dateFrom);
      else params.delete("dateFrom");
      if (dateTo) params.set("dateTo", dateTo);
      else params.delete("dateTo");
      router.push(`/admin/orders?${params.toString()}`);
    });
  }

  function clearCustomRange() {
    setDateFrom("");
    setDateTo("");
    startTransition(() => {
      const params = new URLSearchParams(sp.toString());
      params.delete("dateFrom");
      params.delete("dateTo");
      router.push(`/admin/orders?${params.toString()}`);
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24, opacity: pending ? 0.6 : 1, pointerEvents: pending ? "none" : "auto", transition: "opacity 0.2s" }}>
      {/* Row 1: period chips + custom date range */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {/* Period chips — dimmed when custom range is active */}
        {PERIODS.map((p) => {
          const active = !hasCustomRange && currentPeriod === p.value;
          return (
            <button
              key={p.value}
              onClick={() => navigatePeriod(p.value)}
              style={{
                padding: "7px 18px",
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontFamily: "var(--font-jetbrains), ui-monospace, monospace",
                background: active ? "var(--gold)" : "var(--surface)",
                color: active ? "var(--bg)" : hasCustomRange ? "var(--muted-2)" : "var(--muted)",
                border: active ? "1px solid var(--gold)" : "1px solid var(--border)",
                cursor: "pointer",
                opacity: hasCustomRange && !active ? 0.5 : 1,
                transition: "background 0.15s, color 0.15s, border-color 0.15s, opacity 0.15s",
              }}
            >
              {p.label}
            </button>
          );
        })}

        {/* Divider */}
        <div style={{ width: 1, height: 28, background: "var(--border)", margin: "0 4px", flexShrink: 0 }} />

        {/* Custom date inputs */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            style={dateInputStyle}
            placeholder="Nga"
          />
          <span style={{ fontSize: 11, color: "var(--muted)", flexShrink: 0 }}>—</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            style={dateInputStyle}
            placeholder="Deri"
          />

          <button
            onClick={applyCustomRange}
            disabled={!dateFrom && !dateTo}
            style={{
              padding: "7px 16px",
              fontSize: 11,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              fontFamily: "var(--font-jetbrains), ui-monospace, monospace",
              background: hasCustomRange ? "var(--gold)" : "var(--surface)",
              color: hasCustomRange ? "var(--bg)" : "var(--muted)",
              border: hasCustomRange ? "1px solid var(--gold)" : "1px solid var(--border)",
              cursor: !dateFrom && !dateTo ? "not-allowed" : "pointer",
              opacity: !dateFrom && !dateTo ? 0.4 : 1,
              transition: "background 0.15s, color 0.15s",
              flexShrink: 0,
            }}
          >
            Apliko
          </button>

          {hasCustomRange && (
            <button
              onClick={clearCustomRange}
              style={{
                padding: "7px 12px",
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontFamily: "var(--font-jetbrains), ui-monospace, monospace",
                background: "transparent",
                color: "var(--muted)",
                border: "1px solid var(--border)",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              ✕ Pastro
            </button>
          )}
        </div>
      </div>

      {/* Active custom range label */}
      {hasCustomRange && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "5px 12px",
            background: "rgba(194,168,117,0.08)",
            border: "1px solid var(--gold-deep)",
            fontSize: 11,
            letterSpacing: "0.12em",
            color: "var(--gold)",
            alignSelf: "flex-start",
          }}
        >
          <span style={{ color: "var(--muted)" }}>Periudha:</span>
          {currentDateFrom && <span>{currentDateFrom}</span>}
          {currentDateFrom && currentDateTo && <span style={{ color: "var(--muted)" }}>→</span>}
          {currentDateTo && <span>{currentDateTo}</span>}
          {!currentDateFrom && currentDateTo && <span style={{ color: "var(--muted)" }}>deri më</span>}
          {currentDateFrom && !currentDateTo && <span style={{ color: "var(--muted)" }}>nga</span>}
        </div>
      )}

      {/* Row 2: Status chips */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button
          onClick={() => navigateStatus("")}
          style={{
            padding: "5px 14px",
            fontSize: 10,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            fontFamily: "var(--font-jetbrains), ui-monospace, monospace",
            background: currentStatus === "" ? "var(--elevated)" : "transparent",
            color: currentStatus === "" ? "var(--text)" : "var(--muted)",
            border: "1px solid var(--border)",
            cursor: "pointer",
          }}
        >
          Të gjitha statuset
        </button>
        {Object.entries(STATUS_META).map(([key, meta]) => {
          const active = currentStatus === key;
          return (
            <button
              key={key}
              onClick={() => navigateStatus(key)}
              style={{
                padding: "5px 14px",
                fontSize: 10,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                fontFamily: "var(--font-jetbrains), ui-monospace, monospace",
                background: active ? meta.bg : "transparent",
                color: active ? meta.color : "var(--muted)",
                border: `1px solid ${active ? meta.color : "var(--border)"}`,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {meta.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const dateInputStyle: React.CSSProperties = {
  padding: "7px 10px",
  background: "var(--bg)",
  border: "1px solid var(--border)",
  color: "var(--text)",
  fontSize: 12,
  fontFamily: "var(--font-jetbrains), ui-monospace, monospace",
  letterSpacing: "0.04em",
  colorScheme: "dark",
  outline: "none",
  width: 136,
};

export function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { label: status, color: "var(--muted)", bg: "var(--surface)" };
  return (
    <span
      style={{
        padding: "4px 10px",
        background: meta.bg,
        border: `1px solid ${meta.color}`,
        fontSize: 10,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        fontFamily: "var(--font-jetbrains), ui-monospace, monospace",
        color: meta.color,
        display: "inline-block",
      }}
    >
      {meta.label}
    </span>
  );
}
