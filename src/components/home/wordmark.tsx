// Editorial HM HOME wordmark with the Italian-flag underline.
// Used in the header and footer.

export function Wordmark({ size = 22 }: { size?: number }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 6,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: size,
          letterSpacing: "0.42em",
          color: "var(--text)",
          fontWeight: 500,
          lineHeight: 1,
          paddingLeft: "0.42em",
        }}
      >
        HM&nbsp;HOME
      </div>
      <div
        className="flag-rule"
        style={{ width: size * 2.6, marginLeft: 2 }}
      >
        <span className="g" />
        <span className="w" />
        <span className="r" />
      </div>
    </div>
  );
}
