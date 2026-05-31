"use client";

import { useState } from "react";

const SECTIONS = [
  {
    key: "dimensions",
    label: "Dimensionet",
    content:
      "Dimensionet e sakta ndryshojnë sipas konfigurimit. Kontaktoni dyqanin tonë ose ekipin e shërbimit dhe do t'ju dërgojmë fletën teknike të produktit brenda 24 orëve.",
  },
  {
    key: "materials",
    label: "Materialet & Kujdesi",
    content:
      "Produktet tona janë të prodhuara me materiale të cilësisë së lartë të zgjedhura nga fabrikantë të certifikuar. Pastrojeni sipërfaqen me leckë të lagur dhe lëngjeve neutrale. Shmangni ekspozimin e zgjatur ndaj rrezeve direkte të diellit.",
  },
  {
    key: "delivery",
    label: "Dorëzimi & Montimi",
    content:
      "Dorëzim falas për porosi mbi €500 brenda Tiranës; rreth Shqipërisë me çmim të rënë dakord. Shërbimi i montimit është i disponueshëm si shtesë. Koha e dorëzimit: 3–7 ditë pune për artikujt në stok.",
  },
  {
    key: "returns",
    label: "Kthimi & Garancia",
    content:
      "Garanci 2 vjet për defekte prodhimi. Produktet mund të kthehen brenda 14 ditëve nëse janë të papërdorura dhe në paketimin origjinal. Produktet me porosi speciale nuk mund të kthehen.",
  },
];

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transition: "transform 0.25s ease",
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
        flexShrink: 0,
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function ProductAccordion() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div>
      {SECTIONS.map((s) => {
        const isOpen = open === s.key;
        return (
          <div
            key={s.key}
            style={{ borderTop: "1px solid var(--border-soft)" }}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : s.key)}
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "15px 0",
                background: "none",
                border: "none",
                color: isOpen ? "var(--text)" : "var(--text-2)",
                cursor: "pointer",
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                textAlign: "left",
                transition: "color 0.2s",
              }}
            >
              <span>{s.label}</span>
              <ChevronIcon open={isOpen} />
            </button>

            <div
              style={{
                overflow: "hidden",
                maxHeight: isOpen ? 200 : 0,
                transition: "max-height 0.3s ease",
              }}
            >
              <p
                style={{
                  margin: 0,
                  paddingBottom: 18,
                  fontSize: 14,
                  color: "var(--text-2)",
                  lineHeight: 1.75,
                }}
              >
                {s.content}
              </p>
            </div>
          </div>
        );
      })}
      <div style={{ borderTop: "1px solid var(--border-soft)" }} />
    </div>
  );
}
