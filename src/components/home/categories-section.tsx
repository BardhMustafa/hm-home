"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ProductCardData } from "./product-card";

type Cat = {
  name: string;
  slug: string;
  productCount: number;
  image_url: string | null;
};

const CAT_DESCS: Record<string, string> = {
  kuzhina: "Kuzhina moderne, të punuara me përpikëri për çdo hapësirë.",
  divane: "Divane që të përqafojnë — lëkurë e pëlhura të zgjedhura me kujdes.",
  "dhoma-gjumi": "Qetësia fillon këtu. Krevate dhe komodë me dizajn të rafinuar.",
  dekor: "Detajet që e bëjnë shtëpinë tënde. Ndriçim, tekstile dhe aksesorë.",
};

export function CategoriesSection({
  cats,
  productsByCat,
}: {
  cats: Cat[];
  productsByCat: Record<string, ProductCardData[]>;
}) {
  const N = cats.length;

  const sectionRef    = useRef<HTMLDivElement>(null);
  const trackRef      = useRef<HTMLDivElement>(null);
  const barRef        = useRef<HTMLDivElement>(null);
  const ghostRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const imgwrapRefs   = useRef<(HTMLDivElement | null)[]>([]);
  const labelBtnRefs  = useRef<(HTMLButtonElement | null)[]>([]);
  const dotRefs       = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const track   = trackRef.current;
    const bar     = barRef.current;
    if (!section || !track || !bar) return;

    let current  = 0;
    let target   = 0;
    let raf: number;
    let lastTime: number | null = null;

    function onScroll() {
      const sectionTop      = section!.offsetTop;
      const buffer          = window.innerHeight * 0.75; // 75vh dead zone at entry and exit
      const totalScrollable = section!.offsetHeight - window.innerHeight;
      const slideRange      = totalScrollable - buffer * 2;
      if (slideRange <= 0) return;
      const scrolledIn = window.scrollY - sectionTop;
      target = Math.max(0, Math.min(1, (scrolledIn - buffer) / slideRange));
    }

    function animate(time: number) {
      if (lastTime === null) lastTime = time;
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      current += (target - current) * (1 - Math.exp(-3.5 * dt));
      if (Math.abs(target - current) < 0.0001) current = target;

      const maxX = (N - 1) * window.innerWidth;
      track!.style.transform = `translateX(${-current * maxX}px)`;
      bar!.style.width = `${current * 100}%`;

      // Active label + dot — direct DOM, no React state
      const active = Math.round(current * (N - 1));
      labelBtnRefs.current.forEach((btn, i) =>
        btn?.classList.toggle("prognav-active", i === active)
      );
      dotRefs.current.forEach((dot, i) =>
        dot?.classList.toggle("active", i === active)
      );

      // Ghost word + image parallax
      if (N > 1) {
        const per = 1 / (N - 1);
        ghostRefs.current.forEach((g, i) => {
          if (!g) return;
          const local = Math.max(-1, Math.min(1, (current - i * per) / per));
          g.style.transform = `translateX(${local * 8}vw)`;
        });
        imgwrapRefs.current.forEach((w, i) => {
          if (!w) return;
          const local = Math.max(-1, Math.min(1, (current - i * per) / per));
          w.style.transform = `translateX(${local * 4}%)`;
        });
      }

      raf = requestAnimationFrame(animate as FrameRequestCallback);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(animate as FrameRequestCallback);
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [N]);

  function jumpTo(i: number) {
    const section = sectionRef.current;
    if (!section || N <= 1) return;
    const buffer          = window.innerHeight * 0.75;
    const totalScrollable = section.offsetHeight - window.innerHeight;
    const slideRange      = totalScrollable - buffer * 2;
    window.scrollTo({
      top: section.offsetTop + buffer + (i / (N - 1)) * slideRange,
      behavior: "smooth",
    });
  }

  return (
    <div ref={sectionRef} style={{ height: `${N * 100 + 150}vh` }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          background: "var(--bg)",
        }}
      >
        {/* Stage header */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "30px 7vw",
            pointerEvents: "none",
          }}
        >
          <div className="eyebrow" style={{ fontSize: 11, letterSpacing: "0.24em", pointerEvents: "auto" }}>
            Kategoritë
          </div>
        </div>

        {/* Horizontal track */}
        <div
          ref={trackRef}
          style={{ display: "flex", height: "100vh", width: `${N * 100}vw`, willChange: "transform" }}
        >
          {cats.map((cat, i) => {
            const prod   = productsByCat[cat.slug]?.[0];
            const isSale = prod?.badge === "sale";
            return (
              <div
                key={cat.slug}
                className="cat-panel"
                style={{
                  flex: "0 0 100vw",
                  height: "100vh",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  alignItems: "center",
                  padding: "92px 0 118px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Ghost word */}
                <div
                  ref={(el) => { ghostRefs.current[i] = el; }}
                  className="serif"
                  style={{
                    position: "absolute",
                    left: "-2vw",
                    bottom: "-4vh",
                    fontSize: "30vw",
                    lineHeight: 0.8,
                    color: "#fff",
                    opacity: 0.025,
                    pointerEvents: "none",
                    whiteSpace: "nowrap",
                    letterSpacing: "-0.02em",
                    willChange: "transform",
                  }}
                >
                  {cat.name}
                </div>

                {/* ── Left: copy block ── */}
                <div className="cat-copy-col" style={{ padding: "0 6vw 0 7vw", position: "relative", zIndex: 2 }}>
                  <div className="mono" style={{ fontSize: 13, letterSpacing: "0.3em", color: "var(--gold)" }}>
                    {String(i + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
                  </div>
                  <h2
                    className="serif"
                    style={{
                      fontWeight: 400,
                      fontSize: "clamp(64px, 8.5vw, 150px)",
                      lineHeight: 0.92,
                      letterSpacing: "-0.02em",
                      margin: "26px 0 0",
                      color: "var(--text)",
                    }}
                  >
                    {cat.name}
                  </h2>
                  <div style={{ height: 1, width: 64, background: "var(--gold-deep)", margin: "34px 0" }} />
                  <div style={{ fontSize: 12, letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--text-2)" }}>
                    {cat.productCount} produkte
                  </div>
                  <p style={{ margin: "18px 0 0", maxWidth: 360, fontSize: 15, lineHeight: 1.6, color: "var(--muted)" }}>
                    {CAT_DESCS[cat.slug] ?? `Koleksion ${cat.name.toLowerCase()} me stil të rafinuar.`}
                  </p>
                  <Link href={`/shop?cat=${cat.slug}`} className="cat-cta">
                    Eksploro →
                  </Link>
                </div>

                {/* ── Right: featured product card ── */}
                <div
                  className="cat-card-col"
                  style={{
                    padding: "0 7vw 0 4vw",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    zIndex: 2,
                    maxWidth: 620,
                  }}
                >
                  {prod ? (
                    <Link href={`/product/${prod.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                      <div
                        className="cat-card-frame"
                        style={{
                          position: "relative",
                          aspectRatio: "4 / 5",
                          maxHeight: "50vh",
                          overflow: "hidden",
                          background: "var(--surface)",
                        }}
                      >
                        {prod.badge && (
                          <span
                            style={{
                              position: "absolute",
                              top: 18,
                              left: 18,
                              zIndex: 3,
                              padding: "6px 11px",
                              fontFamily: "var(--font-jetbrains), ui-monospace, monospace",
                              fontSize: 10,
                              letterSpacing: "0.16em",
                              textTransform: "uppercase",
                              background: isSale ? "var(--sale)" : "transparent",
                              color: isSale ? "#15110d" : "var(--text)",
                              border: isSale ? "none" : "1px solid rgba(255,255,255,0.35)",
                            }}
                          >
                            {isSale ? "Ulje" : "I ri"}
                          </span>
                        )}
                        <div
                          ref={(el) => { imgwrapRefs.current[i] = el; }}
                          style={{ position: "absolute", inset: 0, willChange: "transform" }}
                        >
                          {prod.image ? (
                            <Image
                              src={prod.image}
                              alt={prod.name}
                              fill
                              sizes="(max-width: 768px) 100vw, 50vw"
                              style={{ objectFit: "cover", transform: "scale(1.12)" }}
                            />
                          ) : (
                            <div className="ph" data-label={prod.slug} style={{ position: "absolute", inset: 0 }} />
                          )}
                        </div>
                      </div>
                      <div style={{ paddingTop: 20 }}>
                        <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--muted)" }}>
                          {prod.category}
                        </div>
                        <div className="serif" style={{ fontSize: 28, color: "var(--text)", marginTop: 8 }}>
                          {prod.name}
                        </div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 12 }}>
                          <span style={{ color: "var(--gold)", fontSize: 17 }}>€ {prod.price.toFixed(2)}</span>
                          {prod.was && (
                            <span style={{ color: "var(--muted-2)", fontSize: 14, textDecoration: "line-through" }}>
                              € {prod.was.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className="ph" data-label={cat.slug} style={{ aspectRatio: "4 / 5", maxHeight: "50vh" }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom vignette */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 280,
            background: "linear-gradient(180deg, rgba(10,9,8,0) 0%, rgba(10,9,8,0.96) 100%)",
            pointerEvents: "none",
            zIndex: 5,
          }}
        />

        {/* Progress nav — desktop labels + mobile dots share this container */}
        <div
          style={{
            position: "absolute",
            left: "7vw",
            right: "7vw",
            bottom: 34,
            zIndex: 6,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div style={{ position: "relative", height: 1, background: "rgba(255,255,255,0.12)" }}>
            <div
              ref={barRef}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                height: 1,
                width: "0%",
                background: "var(--gold)",
                transition: "width 0.12s linear",
              }}
            />
          </div>

          {/* Desktop: category name labels */}
          <div className="cat-prognav-labels">
            {cats.map((cat, i) => (
              <button
                key={cat.slug}
                ref={(el) => { labelBtnRefs.current[i] = el; }}
                className="prognav-btn"
                onClick={() => jumpTo(i)}
              >
                <span className="prognav-n">{String(i + 1).padStart(2, "0")}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Mobile: pill dots */}
          <div className="cat-dots-mobile">
            {cats.map((cat, i) => (
              <button
                key={cat.slug}
                ref={(el) => { dotRefs.current[i] = el; }}
                aria-label={cat.name}
                onClick={() => jumpTo(i)}
                className="cat-dot"
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
