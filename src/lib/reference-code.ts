// Client-side only, purely for display — there's no backend to persist
// these against, so a reference is generated fresh each time and shown
// once in a confirmation state, matching how the rest of this app is
// upfront about being frontend-only (contact form, checkout, admin forms).
export function generateReferenceCode(prefix: "NIS" | "ORD") {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${digits}`;
}
