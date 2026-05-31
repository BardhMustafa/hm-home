"use client";

import Link from "next/link";
import { Wordmark } from "./wordmark";

const NAV = [
  {
    h: "Dyqani",
    links: [
      { label: "Kuzhina", href: "/shop?cat=kuzhina" },
      { label: "Divane", href: "/shop?cat=divane" },
      { label: "Dhoma Gjumi", href: "/shop?cat=dhoma-gjumi" },
      { label: "Dekor", href: "/shop?cat=dekor" },
      { label: "Të rejat", href: "/shop" },
    ],
  },
  {
    h: "Shërbimet",
    links: [
      { label: "Konsulencë falas", href: "#" },
      { label: "Dorëzimi & Montimi", href: "#" },
      { label: "Garancia", href: "#" },
      { label: "Riparime", href: "#" },
    ],
  },
  {
    h: "Kontakt",
    links: [
      { label: "Rr. Sami Frashëri 14, Tiranë", href: "#" },
      { label: "+355 69 200 1234", href: "tel:+35569200 1234" },
      { label: "hello@hmhome.al", href: "mailto:hello@hmhome.al" },
      { label: "Hënë – Shtunë, 9 – 20", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer
      style={{
        background: "var(--bg-2)",
        borderTop: "1px solid var(--border-soft)",
      }}
    >
      {/* Top band — newsletter */}
      <div
        className="r-px"
        style={{
          paddingTop: "clamp(40px, 6vw, 64px)",
          paddingBottom: "clamp(40px, 6vw, 64px)",
          borderBottom: "1px solid var(--border-soft)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 32,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Newsletter</div>
          <p style={{ margin: 0, fontSize: 15, color: "var(--text-2)", maxWidth: 340, lineHeight: 1.5 }}>
            Koleksionet e reja, oferta ekskluzive dhe inspirim dizajni — direkt në inbox.
          </p>
        </div>
        <form
          style={{ display: "flex", gap: 0, flexShrink: 0 }}
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            placeholder="Email-i juaj"
            style={{
              padding: "13px 18px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRight: "none",
              color: "var(--text)",
              fontSize: 13,
              outline: "none",
              width: "clamp(180px, 20vw, 260px)",
            }}
          />
          <button
            type="submit"
            className="btn btn--solid"
            style={{ padding: "13px 24px", borderLeft: "none", fontSize: 11 }}
          >
            Regjistrohu
          </button>
        </form>
      </div>

      {/* Main columns */}
      <div
        className="r-px r-grid-footer"
        style={{
          paddingTop: "clamp(48px, 7vw, 72px)",
          paddingBottom: 36,
        }}
      >
        {/* Brand column */}
        <div>
          <Wordmark size={20} />
          <p style={{ marginTop: 20, fontSize: 14, color: "var(--text-2)", lineHeight: 1.65, maxWidth: 300 }}>
            Mobilje me stil. Jetë me komoditet.
            <br />
            HM Home sjell në Shqipëri më të mirat e dizajnit europian që nga viti 2014.
          </p>
          {/* Italian flag rule */}
          <div className="flag-rule" style={{ marginTop: 24 }}>
            <span className="g" />
            <span className="w" />
            <span className="r" />
          </div>
          <div style={{ marginTop: 10, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)" }}>
            Made in Italy
          </div>
        </div>

        {/* Nav columns */}
        {NAV.map((col) => (
          <div key={col.h}>
            <div className="eyebrow" style={{ marginBottom: 18 }}>{col.h}</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {col.links.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    style={{ fontSize: 14, color: "var(--text-2)", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-2)")}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Bottom bar */}
        <div
          className="r-stack-sm"
          style={{
            gridColumn: "1 / -1",
            paddingTop: 28,
            marginTop: 12,
            borderTop: "1px solid var(--border-soft)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            fontSize: 12,
            color: "var(--muted)",
          }}
        >
          <span>© 2026 HM Home — Të gjitha të drejtat e rezervuara.</span>
          <span style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {["Kushtet", "Privatësia", "Instagram", "Facebook"].map((l) => (
              <a
                key={l}
                href="#"
                style={{ color: "inherit", textDecoration: "none", letterSpacing: "0.08em", transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
              >
                {l}
              </a>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
}
