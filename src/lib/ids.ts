/** UUID v1–v5 shape used by Postgres uuid columns. */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value.trim());
}

/** Manual animal intake ID when no rescue case number exists. */
export function generateTemporaryId(): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const num = Math.floor(Math.random() * 900) + 100;
  return `A-${year}-${num}`;
}
