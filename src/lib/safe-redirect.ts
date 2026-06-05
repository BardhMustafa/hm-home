// Normalises a user-supplied `next` redirect target to a safe, same-origin
// relative path. Without this, `?next=https://evil.example` (or the
// protocol-relative `//evil.example`) would let an attacker bounce a freshly
// authenticated user off-site for phishing.
export function safeNextPath(next: unknown, fallback = "/account"): string {
  if (typeof next !== "string" || next.length === 0) return fallback;
  // Must be an absolute path on THIS origin: a single leading slash, and not
  // the protocol-relative "//" or the backslash variant some browsers
  // normalise to "//".
  if (!next.startsWith("/")) return fallback;
  if (next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
