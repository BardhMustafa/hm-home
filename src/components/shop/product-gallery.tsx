"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

type GalleryImage = { image_url: string; position: number };

export function ProductGallery({
  images,
  name,
}: {
  images: GalleryImage[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    if (lightbox === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowLeft")
        setLightbox((i) => (i !== null && i > 0 ? i - 1 : i));
      if (e.key === "ArrowRight")
        setLightbox((i) => (i !== null && i < images.length - 1 ? i + 1 : i));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, images.length]);

  useEffect(() => {
    document.body.style.overflow = lightbox !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightbox]);

  const current = images[active];

  return (
    <>
      {/* ── Gallery ─────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 10,
          position: "sticky",
          top: 24,
          alignSelf: "flex-start",
        }}
      >
        {/* Thumbnail strip — left side */}
        {images.length > 1 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              width: 72,
              flexShrink: 0,
            }}
          >
            {images.map((img, i) => (
              <div
                key={img.image_url}
                onClick={() => setActive(i)}
                style={{
                  position: "relative",
                  width: 72,
                  height: 72,
                  flexShrink: 0,
                  background: "var(--surface)",
                  overflow: "hidden",
                  cursor: "pointer",
                  outline: i === active ? "2px solid var(--gold)" : "2px solid transparent",
                  outlineOffset: 2,
                  transition: "outline-color 0.15s",
                }}
              >
                <Image
                  src={img.image_url}
                  alt=""
                  fill
                  sizes="72px"
                  style={{
                    objectFit: "contain",
                    padding: "4px",
                    opacity: i === active ? 1 : 0.45,
                    transition: "opacity 0.15s",
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Main image */}
        <div
          onClick={() => current && setLightbox(active)}
          style={{
            position: "relative",
            flex: 1,
            aspectRatio: "4 / 3",
            background: "var(--surface)",
            overflow: "hidden",
            cursor: current ? "zoom-in" : "default",
            minWidth: 0,
          }}
        >
          {current ? (
            <Image
              src={current.image_url}
              alt={name}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 50vw"
              style={{ objectFit: "contain", padding: "20px" }}
            />
          ) : (
            <div
              className="ph"
              data-label="product"
              style={{ position: "absolute", inset: 0 }}
            />
          )}
          {current && (
            <div
              style={{
                position: "absolute",
                bottom: 10,
                right: 12,
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 10,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--muted)",
                pointerEvents: "none",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
              </svg>
              Zmadhoni
            </div>
          )}
        </div>
      </div>

      {/* ── Lightbox ─────────────────────────────────────────── */}
      {lightbox !== null && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(5,4,3,0.96)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              width: 40,
              height: 40,
              background: "transparent",
              border: "1px solid var(--border)",
              color: "var(--text)",
              fontSize: 20,
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
            }}
          >
            ×
          </button>

          {lightbox > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox - 1); }}
              style={{
                position: "absolute",
                left: 20,
                width: 44,
                height: 44,
                background: "transparent",
                border: "1px solid var(--border)",
                color: "var(--text)",
                fontSize: 18,
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
              }}
            >
              ←
            </button>
          )}

          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "min(90vw, 960px)",
              height: "min(85vh, 800px)",
            }}
          >
            <Image
              src={images[lightbox].image_url}
              alt={name}
              fill
              sizes="90vw"
              style={{ objectFit: "contain" }}
            />
          </div>

          {lightbox < images.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox + 1); }}
              style={{
                position: "absolute",
                right: 20,
                width: 44,
                height: 44,
                background: "transparent",
                border: "1px solid var(--border)",
                color: "var(--text)",
                fontSize: 18,
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
              }}
            >
              →
            </button>
          )}

          {images.length > 1 && (
            <div
              style={{
                position: "absolute",
                bottom: 20,
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--muted)",
              }}
            >
              {lightbox + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}
