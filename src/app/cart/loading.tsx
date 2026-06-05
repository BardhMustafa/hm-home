import { Header } from "@/components/home/header";

export default function CartLoading() {
  return (
    <>
      <Header />
      <main
        className="r-px"
        style={{ paddingTop: 60, paddingBottom: "clamp(72px, 10vw, 120px)", minHeight: "60vh" }}
      >
        <div className="skeleton" style={{ height: 11, width: 70, marginBottom: 14 }} />
        <div className="skeleton" style={{ height: 42, width: 240, marginBottom: 36 }} />

        <div className="r-split r-split--cart">
          {/* Line items skeleton */}
          <section style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "100px 1fr auto",
                  gap: 20,
                  padding: 20,
                  background: "var(--surface)",
                  alignItems: "center",
                }}
              >
                <div className="skeleton" style={{ aspectRatio: "1 / 1", width: 100 }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div className="skeleton" style={{ height: 20, width: "70%" }} />
                  <div className="skeleton" style={{ height: 14, width: 60 }} />
                  <div className="skeleton" style={{ height: 32, width: 110 }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-end" }}>
                  <div className="skeleton" style={{ height: 20, width: 70 }} />
                  <div className="skeleton" style={{ height: 28, width: 28 }} />
                </div>
              </div>
            ))}
          </section>

          {/* Summary sidebar skeleton */}
          <aside
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              padding: 28,
              position: "sticky",
              top: 24,
            }}
          >
            <div className="skeleton" style={{ height: 11, width: 100, marginBottom: 18 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div className="skeleton" style={{ height: 14, width: 120 }} />
                <div className="skeleton" style={{ height: 14, width: 60 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div className="skeleton" style={{ height: 14, width: 80 }} />
                <div className="skeleton" style={{ height: 14, width: 140 }} />
              </div>
            </div>
            <div style={{ height: 1, background: "var(--border)", marginBottom: 16 }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
              <div className="skeleton" style={{ height: 26, width: 60 }} />
              <div className="skeleton" style={{ height: 26, width: 80 }} />
            </div>
            <div className="skeleton" style={{ height: 48, width: "100%" }} />
          </aside>
        </div>
      </main>
    </>
  );
}
