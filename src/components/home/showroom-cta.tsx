import Image from "next/image";
import Link from "next/link";

export function ShowroomCTA() {
  return (
    <section
      style={{
        position: "relative",
        minHeight: "clamp(460px, 65vh, 700px)",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Background */}
      <Image
        src="/assets/hero.jpg"
        alt="HM Home salloni"
        fill
        sizes="100vw"
        style={{ objectFit: "cover", objectPosition: "center 30%" }}
      />

      {/* Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(100deg, rgba(8,7,6,0.92) 0%, rgba(8,7,6,0.7) 45%, rgba(8,7,6,0.3) 100%)",
        }}
      />

      {/* Content */}
      <div
        className="r-px"
        style={{ position: "relative", zIndex: 1, maxWidth: 640 }}
      >
        <div className="eyebrow" style={{ marginBottom: 20 }}>Vizitoni sallonin</div>
        <h2
          className="serif"
          style={{
            fontSize: "clamp(36px, 6vw, 72px)",
            lineHeight: 1,
            margin: "0 0 16px",
            letterSpacing: "-0.015em",
            color: "var(--text)",
          }}
        >
          Ndijeni cilësinë
          <br />
          <em style={{ color: "var(--gold)", fontStyle: "italic" }}>me duart tuaja.</em>
        </h2>
        <p style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.6, margin: "0 0 32px", maxWidth: 420 }}>
          Kosovë · Hënë–Shtunë 9–20<br />
          Konsulencë falas me specialistët tanë të dizajnit.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/caktoni-viziten" className="btn btn--solid" style={{ padding: "14px 32px" }}>
            Caktoni vizitën
          </Link>
          <Link href="/shop" className="btn btn--ghost" style={{ padding: "14px 32px" }}>
            Shfletoni online
          </Link>
        </div>
      </div>
    </section>
  );
}
