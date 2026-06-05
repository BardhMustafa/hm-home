import { Header } from "@/components/home/header";

export default function ShopLoading() {
  return (
    <>
      <Header />
      <main
        className="r-px"
        style={{ paddingTop: 48, paddingBottom: "clamp(72px, 10vw, 120px)", minHeight: "60vh" }}
      >
        <div className="r-split r-split--shop" style={{ alignItems: "flex-start", gap: 0 }}>
          {/* Sidebar skeleton */}
          <aside
            className="shop-sidebar"
            style={{ position: "sticky", top: 24, paddingRight: "clamp(24px, 3vw, 48px)" }}
          >
            <div className="skeleton" style={{ height: 11, width: 80, marginBottom: 32 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[140, 120, 100, 110, 130].map((w, i) => (
                <div key={i} className="skeleton" style={{ height: 14, width: w }} />
              ))}
            </div>
            <div style={{ height: 1, background: "var(--border-soft)", margin: "28px 0" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[90, 110, 100].map((w, i) => (
                <div key={i} className="skeleton" style={{ height: 14, width: w }} />
              ))}
            </div>
            <div style={{ height: 1, background: "var(--border-soft)", margin: "28px 0" }} />
            <div style={{ display: "flex", gap: 8 }}>
              <div className="skeleton" style={{ height: 36, flex: 1 }} />
              <div className="skeleton" style={{ height: 36, flex: 1 }} />
            </div>
          </aside>

          {/* Product grid skeleton */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: 24,
              }}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i}>
                  <div className="skeleton" style={{ aspectRatio: "3 / 4", width: "100%", marginBottom: 14 }} />
                  <div className="skeleton" style={{ height: 11, width: 70, marginBottom: 10 }} />
                  <div className="skeleton" style={{ height: 20, width: "80%", marginBottom: 10 }} />
                  <div className="skeleton" style={{ height: 14, width: 60 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
