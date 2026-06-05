"use client";

// Catches errors thrown in the root layout itself. Must render its own
// <html>/<body> because it replaces the entire document.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="sq">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: 16,
          background: "#0a0908",
          color: "#f5f1ea",
          fontFamily: "system-ui, sans-serif",
          padding: 24,
        }}
      >
        <h1 style={{ fontSize: 32, margin: 0 }}>HM Home</h1>
        <p style={{ color: "#9a8f80", maxWidth: 420, lineHeight: 1.6 }}>
          Diçka shkoi keq. Provoni përsëri.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: 8,
            padding: "12px 22px",
            background: "#c2a875",
            color: "#0a0908",
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Provo përsëri
        </button>
      </body>
    </html>
  );
}
