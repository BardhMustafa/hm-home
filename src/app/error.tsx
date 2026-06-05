"use client";

import Link from "next/link";
import { useEffect } from "react";

// Segment error boundary. Catches render/data errors in any route under the
// root layout and shows a branded recovery screen instead of Next's default.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 18,
        padding: "80px 24px",
      }}
    >
      <div
        className="eyebrow"
        style={{ color: "var(--gold)", letterSpacing: "0.3em" }}
      >
        Gabim
      </div>
      <h1 className="serif" style={{ fontSize: "clamp(28px, 5vw, 40px)", margin: 0 }}>
        Diçka shkoi keq.
      </h1>
      <p style={{ color: "var(--muted)", maxWidth: 420, lineHeight: 1.6 }}>
        Na vjen keq — ndodhi një gabim i papritur. Provoni përsëri ose kthehuni
        në faqen kryesore.
      </p>
      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <button onClick={reset} className="btn btn--solid">
          Provo përsëri
        </button>
        <Link href="/" className="btn">
          Faqja kryesore
        </Link>
      </div>
    </main>
  );
}
