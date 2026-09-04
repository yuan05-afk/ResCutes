const EM_DASH = "\u2014";
const EN_DASH = "\u2013";

/** Remove em/en dashes from user-facing copy. */
export function stripEmDashes(text: string): string {
  return text
    .replaceAll(EM_DASH, " - ")
    .replaceAll(EN_DASH, "-")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function stripEmDashesOptional(
  text: string | null | undefined,
): string | undefined {
  if (text == null) return undefined;
  const next = stripEmDashes(text);
  return next || undefined;
}
