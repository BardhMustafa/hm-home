import { Wordmark } from "./wordmark";

const COLUMNS = [
  {
    h: "Dyqani",
    l: ["Kuzhina", "Divane", "Dhoma Gjumi", "Dekor", "Të rejat"],
  },
  {
    h: "Shërbimet",
    l: ["Konsulencë falas", "Dorëzimi & Montimi", "Garancia", "Riparime"],
  },
  {
    h: "Kontakt",
    l: [
      "Rr. Sami Frashëri 14, Tiranë",
      "+355 69 200 1234",
      "hello@hmhome.al",
      "Hënë – Shtunë, 9 – 20",
    ],
  },
];

export function Footer() {
  return (
    <footer
      className="r-px r-grid-footer"
      style={{
        background: "var(--bg-2)",
        borderTop: "1px solid var(--border-soft)",
        paddingTop: "clamp(56px, 8vw, 80px)",
        paddingBottom: 36,
      }}
    >
      <div>
        <Wordmark size={20} />
        <p
          style={{
            marginTop: 24,
            fontSize: 14,
            color: "var(--text-2)",
            lineHeight: 1.6,
            maxWidth: 320,
          }}
        >
          Mobilje me stil. Jetë me komoditet.
          <br />
          HM Home sjell në Shqipëri më të mirat e dizajnit italian që nga viti
          2014.
        </p>
      </div>

      {COLUMNS.map((col) => (
        <div key={col.h}>
          <div className="eyebrow" style={{ marginBottom: 18 }}>
            {col.h}
          </div>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {col.l.map((i) => (
              <li
                key={i}
                style={{ fontSize: 14, color: "var(--text-2)" }}
              >
                {i}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div
        className="r-stack-sm"
        style={{
          gridColumn: "1 / -1",
          paddingTop: 32,
          marginTop: 16,
          borderTop: "1px solid var(--border-soft)",
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          fontSize: 12,
          color: "var(--muted)",
        }}
      >
        <span>
          © 2026 HM Home — Të gjitha të drejtat e rezervuara.
        </span>
        <span style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
          <a style={{ cursor: "pointer" }}>Kushtet</a>
          <a style={{ cursor: "pointer" }}>Privatësia</a>
          <a style={{ cursor: "pointer" }}>Instagram</a>
          <a style={{ cursor: "pointer" }}>Facebook</a>
        </span>
      </div>
    </footer>
  );
}
