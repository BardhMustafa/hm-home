import { Header } from "@/components/home/header";

export default function AccountLoading() {
  return (
    <>
      <Header />
      <main
        className="r-px"
        style={{
          paddingTop: "clamp(56px, 10vw, 88px)",
          paddingBottom: "clamp(72px, 10vw, 120px)",
          maxWidth: 680,
          margin: "0 auto",
        }}
      >
        <div className="skeleton" style={{ height: 11, width: 70, marginBottom: 36 }} />

        {/* Profile row skeleton */}
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 48 }}>
          <div
            className="skeleton"
            style={{ width: 72, height: 72, borderRadius: "50%", flexShrink: 0 }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="skeleton" style={{ height: 32, width: 200 }} />
            <div className="skeleton" style={{ height: 14, width: 160 }} />
          </div>
        </div>

        {/* Tiles skeleton */}
        <div style={{ borderTop: "1px solid var(--border-soft)" }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                padding: "22px 4px",
                borderBottom: "1px solid var(--border-soft)",
              }}
            >
              <div className="skeleton" style={{ width: 18, height: 18, flexShrink: 0 }} />
              <div className="skeleton" style={{ height: 13, flex: 1, maxWidth: 200 }} />
              <div className="skeleton" style={{ width: 16, height: 16 }} />
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
