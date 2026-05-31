"use client";

import { useEffect, useRef } from "react";

const VALUES = [
  { number: "12+", label: "Vite eksperiencë", sub: "Që nga viti 2014" },
  { number: "100%", label: "Cilësi europiane", sub: "Direkt nga prodhuesi" },
  { number: "3", label: "Sallone", sub: "Në të gjithë Shqipërinë" },
];

export function ValuesStrip() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    el.style.opacity = "0";
    el.style.transform = "translateY(56px)";
    el.style.willChange = "transform, opacity";

    let raf: number;
    let y = 56, targetY = 56;
    let op = 0, targetOp = 0;

    function onScroll() {
      const top = el!.getBoundingClientRect().top;
      const wh = window.innerHeight;
      const p = Math.max(0, Math.min(1, (wh - top) / (wh * 0.72)));
      targetY = (1 - p) * 56;
      targetOp = Math.min(1, p * 1.6);
    }

    function animate() {
      y += (targetY - y) * 0.07;
      op += (targetOp - op) * 0.07;
      el!.style.transform = `translateY(${y.toFixed(1)}px)`;
      el!.style.opacity = op.toFixed(3);
      raf = requestAnimationFrame(animate);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(animate);
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        borderTop: "1px solid var(--border-soft)",
        borderBottom: "1px solid var(--border-soft)",
        background: "var(--bg-2)",
      }}
    >
      <div
        className="r-px values-grid"
        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}
      >
        {VALUES.map((v, i) => (
          <div
            key={v.label}
            style={{
              padding: "clamp(36px, 6vw, 64px) clamp(20px, 4vw, 48px)",
              borderLeft: i > 0 ? "1px solid var(--border-soft)" : "none",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div
              className="serif"
              style={{ fontSize: "clamp(44px, 6vw, 72px)", color: "var(--gold)", lineHeight: 1 }}
            >
              {v.number}
            </div>
            <div
              style={{ fontSize: 13, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text)" }}
            >
              {v.label}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", letterSpacing: "0.04em" }}>
              {v.sub}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
