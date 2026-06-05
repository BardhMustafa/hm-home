import { Header } from "@/components/home/header";

export default function ProductLoading() {
  return (
    <>
      <Header />
      <main
        className="r-px"
        style={{
          paddingTop: "clamp(40px, 6vw, 72px)",
          paddingBottom: "clamp(72px, 10vw, 120px)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "clamp(32px, 5vw, 72px)",
            alignItems: "start",
          }}
        >
          {/* Gallery skeleton */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="skeleton" style={{ aspectRatio: "4 / 5", width: "100%" }} />
            <div style={{ display: "flex", gap: 8 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} className="skeleton" style={{ width: 64, height: 64, flexShrink: 0 }} />
              ))}
            </div>
          </div>

          {/* Info skeleton */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingTop: 8 }}>
            <div className="skeleton" style={{ height: 11, width: 100 }} />
            <div className="skeleton" style={{ height: 52, width: "85%" }} />
            <div className="skeleton" style={{ height: 1, width: 64 }} />
            <div className="skeleton" style={{ height: 28, width: 90 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="skeleton" style={{ height: 14, width: "100%" }} />
              <div className="skeleton" style={{ height: 14, width: "90%" }} />
              <div className="skeleton" style={{ height: 14, width: "75%" }} />
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <div className="skeleton" style={{ height: 48, width: 110 }} />
              <div className="skeleton" style={{ height: 48, flex: 1 }} />
              <div className="skeleton" style={{ height: 48, width: 48 }} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
