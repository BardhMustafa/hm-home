import Image from "next/image";

const STATS = [
  { k: "12+", v: "Vite eksperiencë" },
  { k: "3", v: "Sallone në Shqipëri" },
  { k: "100%", v: "Origjinë italiane" },
];

export function Hero() {
  return (
    <section
      style={{
        position: "relative",
        minHeight: "min(880px, 100svh)",
        overflow: "hidden",
        background: "var(--bg)",
      }}
    >
      {/* Full-bleed background image */}
      <Image
        src="/assets/hero.jpg"
        alt="HM Home — hapësirë e brendshme"
        fill
        priority
        sizes="100vw"
        style={{
          objectFit: "cover",
          objectPosition: "center center",
        }}
      />

      {/* Darkening + readability scrim */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(95deg, rgba(8,7,6,0.92) 0%, rgba(8,7,6,0.78) 28%, rgba(8,7,6,0.35) 52%, rgba(8,7,6,0.12) 72%, rgba(8,7,6,0.55) 100%)",
          pointerEvents: "none",
        }}
      />
      {/* Bottom vignette */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 280,
          background:
            "linear-gradient(180deg, rgba(8,7,6,0) 0%, rgba(8,7,6,0.78) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          padding:
            "clamp(110px, 16vh, 140px) clamp(20px, 6vw, 80px) clamp(40px, 8vh, 60px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 36,
          minHeight: "min(880px, 100svh)",
          maxWidth: 880,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span className="eyebrow">Koleksioni Verë &lsquo;26</span>
            <span
              style={{
                height: 1,
                width: 56,
                background: "var(--gold-deep)",
              }}
            />
          </div>

          <h1
            className="serif"
            style={{
              fontSize: "clamp(48px, 10vw, 104px)",
              lineHeight: 0.96,
              margin: 0,
              letterSpacing: "-0.015em",
              color: "var(--text)",
              textWrap: "balance",
              textShadow: "0 2px 24px rgba(0,0,0,0.4)",
            }}
          >
            Eleganca që
            <br />
            <em
              style={{
                color: "var(--gold)",
                fontStyle: "italic",
                fontWeight: 400,
              }}
            >
              jetohet
            </em>{" "}
            çdo ditë.
          </h1>

          <p
            style={{
              fontSize: "clamp(15px, 2.2vw, 18px)",
              lineHeight: 1.6,
              color: "var(--text-2)",
              maxWidth: 480,
              margin: 0,
              textWrap: "pretty",
            }}
          >
            Mobilje të zgjedhura me dorë nga punëtoritë më të mira italiane.
            Komoditet i pakrahasueshëm, dizajn që zgjat një jetë.
          </p>

          <div
            className="r-stack-sm"
            style={{ display: "flex", gap: 14, marginTop: 4 }}
          >
            <button className="btn btn--solid">Zbulo koleksionin</button>
            <button className="btn btn--ghost">Cakto një vizitë</button>
          </div>
        </div>

        {/* Stats row */}
        <div
          className="r-hero-stats"
          style={{
            display: "flex",
            gap: "clamp(28px, 5vw, 56px)",
            paddingTop: 32,
            borderTop: "1px solid rgba(194, 168, 117, 0.18)",
          }}
        >
          {STATS.map((s) => (
            <div key={s.v}>
              <div
                className="serif"
                style={{ fontSize: 34, color: "var(--gold)", lineHeight: 1 }}
              >
                {s.k}
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 11,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--text-2)",
                }}
              >
                {s.v}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll cue */}
      <div
        className="r-hero-cue"
        style={{
          position: "absolute",
          left: 80,
          bottom: 28,
          display: "flex",
          alignItems: "center",
          gap: 12,
          color: "var(--text-2)",
          fontSize: 10,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
        }}
      >
        <span
          style={{ width: 28, height: 1, background: "var(--gold)" }}
        />
        <span>Zbulo më shumë</span>
      </div>
    </section>
  );
}
