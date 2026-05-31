"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import Link from "next/link";

export function Hero() {
  const heroRef    = useRef<HTMLElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // ── Curtain animation — play once on mount ────────────────────
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    hero.classList.remove("hero-play");
    void hero.offsetWidth; // force reflow
    hero.classList.add("hero-play");
  }, []);

  // ── Scroll: parallax image drift + content fade-out ──────────
  useEffect(() => {
    const hero    = heroRef.current;
    const parallax = parallaxRef.current;
    const content  = contentRef.current;
    if (!hero || !parallax || !content) return;

    function onScroll() {
      const y = window.scrollY;
      const h = hero!.offsetHeight;
      parallax!.style.transform = `translateY(${y * 0.25}px)`;
      const fadeP = Math.max(0, Math.min(y / (h * 0.6), 1));
      content!.style.opacity  = String(1 - fadeP);
      content!.style.transform = `translateY(${fadeP * -20}px)`;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      ref={heroRef}
      className="hero-curtain"
      style={{ position: "relative", height: "100svh", width: "100%", overflow: "hidden", background: "var(--bg)" }}
    >
      {/* Parallax wrapper — oversized vertically for drift room */}
      <div
        ref={parallaxRef}
        style={{ position: "absolute", top: "-25%", left: 0, right: 0, bottom: "-25%", willChange: "transform" }}
      >
        {/* Ken Burns target — CSS animates scale on this wrapper */}
        <div className="hero-bg-inner" style={{ position: "absolute", inset: 0 }}>
          <Image
            src="/assets/hero.jpg"
            alt="HM Home — hapësirë e brendshme"
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: "60% center" }}
          />
        </div>
      </div>

      {/* Radial scrim for text legibility */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(120% 90% at 50% 50%, rgba(8,7,6,.15) 0%, rgba(8,7,6,.72) 78%)",
          pointerEvents: "none",
        }}
      />

      {/* Curtain panels (cover image, then split apart) */}
      <div className="hero-panel hero-panel-top" />
      <div className="hero-panel hero-panel-bot" />


      {/* Centered copy */}
      <div
        ref={contentRef}
        className="hero-center"
        style={{ willChange: "opacity, transform" }}
      >
        <div className="hero-kick">Koleksioni Verë &lsquo;26</div>

        <h1
          className="serif"
          style={{
            fontWeight: 400,
            fontSize: "clamp(54px, 8vw, 132px)",
            lineHeight: 0.92,
            letterSpacing: "0.02em",
            margin: 0,
            color: "var(--text)",
          }}
        >
          Jeto me{" "}
          <em style={{ fontStyle: "italic", color: "var(--gold)" }}>stil.</em>
        </h1>

        <p className="hero-sub">
          Çdo pjesë, një kryevepër. Zbulo mobiljet që e kthejnë shtëpinë në shtëpi.
        </p>

        <div className="hero-btn-row">
          <Link href="/shop" className="btn btn--solid" style={{ padding: "15px 28px", fontSize: 11, letterSpacing: "0.22em" }}>
            Zbulo koleksionin
          </Link>
          <Link href="#" className="btn btn--ghost" style={{ padding: "15px 28px", fontSize: 11, letterSpacing: "0.22em" }}>
            Pikat tona
          </Link>
        </div>
      </div>
    </section>
  );
}
