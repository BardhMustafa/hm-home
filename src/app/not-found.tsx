import Link from "next/link";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";

export const metadata = { title: "Faqja nuk u gjet — HM Home" };

// Branded 404. Triggered by notFound() and unmatched routes.
export default function NotFound() {
  return (
    <>
      <Header />
      <main
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: 18,
          padding: "100px 24px",
        }}
      >
        <div
          className="serif"
          style={{ fontSize: "clamp(56px, 12vw, 96px)", lineHeight: 1, color: "var(--gold)" }}
        >
          404
        </div>
        <h1 className="serif" style={{ fontSize: "clamp(24px, 4vw, 34px)", margin: 0 }}>
          Faqja nuk u gjet.
        </h1>
        <p style={{ color: "var(--muted)", maxWidth: 420, lineHeight: 1.6 }}>
          Faqja që kërkoni nuk ekziston ose është zhvendosur.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <Link href="/" className="btn btn--solid">
            Faqja kryesore
          </Link>
          <Link href="/shop" className="btn">
            Shfleto produktet
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
