"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useTransition } from "react";

type Cat = { name: string; slug: string };

export function CategoryDropdown({
  categories,
  activeCat,
  query,
}: {
  categories: Cat[];
  activeCat: string;
  query: string; // existing query string (without cat param)
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  const all = [{ name: "Të gjitha", slug: "" }, ...categories];
  const selected = all.find((c) => c.slug === activeCat) ?? all[0];

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function select(slug: string) {
    setOpen(false);
    startTransition(() => {
      const params = new URLSearchParams(query);
      if (slug) params.set("cat", slug);
      else params.delete("cat");
      const qs = params.toString();
      router.push(`/shop${qs ? `?${qs}` : ""}`);
    });
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="shop-dd-trigger"
        aria-expanded={open}
        disabled={pending}
        style={{ opacity: pending ? 0.6 : 1 }}
      >
        <span>{pending ? "Duke filtruar…" : selected.name}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            flexShrink: 0,
          }}
        >
          <path d="M2 4l4 4 4-4" />
        </svg>
      </button>

      {/* Panel */}
      {open && (
        <div className="shop-dd-panel">
          {all.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => select(c.slug)}
              className={`shop-dd-option${c.slug === activeCat ? " active" : ""}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
