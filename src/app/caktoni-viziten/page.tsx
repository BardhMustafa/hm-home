import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { VisitForm } from "./form";

export const metadata = {
  title: "Caktoni vizitën — HM Home",
  description:
    "Rezervoni një vizitë në sallonin tonë në Tiranë. Konsulencë falas me specialistët tanë të dizajnit.",
};

const INFO = [
  { label: "Adresa", value: "Rr. Sami Frashëri 14, Tiranë" },
  { label: "Orari", value: "Hënë – Shtunë, 9:00 – 20:00" },
  { label: "Telefon", value: "+355 69 200 1234", href: "tel:+355692001234" },
  { label: "Email", value: "hello@hmhome.al", href: "mailto:hello@hmhome.al" },
];

export default function CaktoniVizitenPage() {
  return (
    <>
      <Header />
      <main
        className="r-px"
        style={{
          paddingTop: "clamp(56px, 9vw, 96px)",
          paddingBottom: "clamp(72px, 11vw, 130px)",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <div style={{ maxWidth: 620, marginBottom: "clamp(40px, 6vw, 64px)" }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>
            Vizitoni sallonin
          </div>
          <h1
            className="serif"
            style={{
              fontSize: "clamp(34px, 6vw, 60px)",
              lineHeight: 1.04,
              margin: "0 0 18px",
            }}
          >
            Ndijeni cilësinë{" "}
            <em style={{ fontStyle: "italic", color: "var(--gold)" }}>
              me duart tuaja.
            </em>
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: 15, lineHeight: 1.7, margin: 0 }}>
            Rezervoni një vizitë në sallonin tonë dhe merrni konsulencë falas
            me specialistët tanë të dizajnit. Plotësoni formularin dhe ne do
            t&apos;ju kontaktojmë për të konfirmuar orarin.
          </p>
        </div>

        <div
          className="r-split r-split--checkout"
          style={{ gridTemplateColumns: "1fr 1.2fr" }}
        >
          {/* Showroom info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {INFO.map((item) => (
              <div key={item.label}>
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--muted)",
                    marginBottom: 6,
                  }}
                >
                  {item.label}
                </div>
                {item.href ? (
                  <a
                    href={item.href}
                    style={{ color: "var(--text)", fontSize: 15, textDecoration: "none" }}
                  >
                    {item.value}
                  </a>
                ) : (
                  <div style={{ color: "var(--text)", fontSize: 15 }}>
                    {item.value}
                  </div>
                )}
              </div>
            ))}

            <div className="flag-rule" style={{ marginTop: 8 }}>
              <span className="g" />
              <span className="w" />
              <span className="r" />
            </div>
          </div>

          {/* Booking form */}
          <div>
            <VisitForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
