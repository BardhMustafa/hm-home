import { Header } from "@/components/home/header";

export default function CheckoutLoading() {
  return (
    <>
      <Header />
      <main
        className="r-px"
        style={{ paddingTop: 60, paddingBottom: "clamp(72px, 10vw, 120px)", minHeight: "60vh" }}
      >
        <div className="skeleton" style={{ height: 11, width: 70, marginBottom: 14 }} />
        <div className="skeleton" style={{ height: 42, width: 280, marginBottom: 40 }} />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 380px",
            gap: "clamp(32px, 5vw, 64px)",
            alignItems: "start",
          }}
        >
          {/* Form skeleton */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="skeleton" style={{ height: 11, width: 130, marginBottom: 4 }} />
            {[0, 1].map((i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="skeleton" style={{ height: 48 }} />
                <div className="skeleton" style={{ height: 48 }} />
              </div>
            ))}
            <div className="skeleton" style={{ height: 48 }} />
            <div className="skeleton" style={{ height: 48 }} />
            <div className="skeleton" style={{ height: 80 }} />
            <div className="skeleton" style={{ height: 52, width: "100%", marginTop: 8 }} />
          </div>

          {/* Order summary sidebar skeleton */}
          <aside
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              padding: 24,
              position: "sticky",
              top: 24,
            }}
          >
            <div className="skeleton" style={{ height: 11, width: 120, marginBottom: 20 }} />
            {[0, 1].map((i) => (
              <div key={i} style={{ display: "flex", gap: 14, marginBottom: 16 }}>
                <div className="skeleton" style={{ width: 56, height: 56, flexShrink: 0 }} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div className="skeleton" style={{ height: 14, width: "80%" }} />
                  <div className="skeleton" style={{ height: 12, width: 50 }} />
                </div>
              </div>
            ))}
            <div style={{ height: 1, background: "var(--border)", margin: "16px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div className="skeleton" style={{ height: 20, width: 60 }} />
              <div className="skeleton" style={{ height: 20, width: 80 }} />
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
