import { Header } from "@/components/home/header";

export default function WishlistLoading() {
  return (
    <>
      <Header />
      <main
        className="r-px"
        style={{ paddingTop: 60, paddingBottom: "clamp(72px, 10vw, 120px)", minHeight: "60vh" }}
      >
        <div className="skeleton" style={{ height: 11, width: 120, marginBottom: 14 }} />
        <div className="skeleton" style={{ height: 42, width: 280, marginBottom: 40 }} />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 24,
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="skeleton" style={{ aspectRatio: "3 / 4", width: "100%", marginBottom: 14 }} />
              <div className="skeleton" style={{ height: 11, width: 70, marginBottom: 10 }} />
              <div className="skeleton" style={{ height: 20, width: "80%", marginBottom: 10 }} />
              <div className="skeleton" style={{ height: 14, width: 60 }} />
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
