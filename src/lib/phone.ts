// Phone validation shared by the checkout and visit forms. The goal is to
// reject obvious junk ("aaaaa", "12") and typos while NOT rejecting any real
// customer — so it's lenient about prefixes (carriers add new ones) and only
// enforces shape + plausible length, with Kosovo-aware length checks.

export function normalizePhone(raw: string): string {
  return raw.replace(/[\s\-().]/g, "");
}

const SHAPE_RE = /^\+?\d{8,15}$/; // optional leading +, then 8–15 digits

export function isValidPhone(raw: string): boolean {
  const p = normalizePhone(raw);
  if (!SHAPE_RE.test(p)) return false;

  // Kosovo local: 9-digit numbers starting 0 (e.g. 049 741 566, 038 …).
  if (p.startsWith("0")) return p.length === 9 || p.length === 10;
  // Kosovo country code: +383 / 383 followed by 8 national digits.
  if (p.startsWith("+383")) return p.length === 12;
  if (p.startsWith("383")) return p.length === 11;
  // Any other international number: trust the generic shape check above.
  return true;
}
