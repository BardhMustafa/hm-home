// Shared honeypot field name. Rendered as a visually-hidden input that real
// users never see or fill, but naive bots auto-populate. Imported by both the
// form (client) and the server action, so the name can't drift between them.
// Kept dependency-free so it's safe to import from client components.
export const HONEYPOT_FIELD = "company";

export function isHoneypotTripped(formData: FormData): boolean {
  const v = formData.get(HONEYPOT_FIELD);
  return typeof v === "string" && v.trim().length > 0;
}
