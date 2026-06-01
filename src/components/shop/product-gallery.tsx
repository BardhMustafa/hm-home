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
      <div className="product-gallery-wrapper">
        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="gallery-thumbs">
            {images.map((img, i) => (
              <div
                key={img.image_url}
                onClick={() => setActive(i)}
                className={`gallery-thumb${i === active ? " active" : ""}`}
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
          className="gallery-main"
          onClick={() => current && setLightbox(active)}
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
