// ─────────────────────────────────────────────────────────────────────────
// SQLITE-ENCODING CODEC
//
// Since the move off PostgreSQL, the columns that were `Json` / `String[]` / `Int[]`
// are plain `TEXT` holding a JSON document. SQLite has no JSON column type and no
// array type, so every value has to be encoded on the way in and decoded on the way
// out — and a single hand-rolled `JSON.parse` at each of the ~30 call sites is
// exactly how one malformed legacy row turns into a 500 for a whole page.
//
// These helpers are the only sanctioned boundary. Every reader degrades to a safe
// empty value (`null` / `[]`) instead of throwing, because a bad row should cost you
// that one badge or filter, not the request.
//
// This module is deliberately dependency-free — no Prisma import, no client
// instance — so `prisma/seed.ts` can use it without pulling in a second
// `PrismaClient` alongside the one it constructs itself.
// ─────────────────────────────────────────────────────────────────────────

/** Encodes a value for a column that stores JSON text. `undefined`/`null` -> null. */
export function json(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  return JSON.stringify(value);
}

/** Decodes a JSON-text column. Malformed or missing text -> null. */
export function readJson<T = unknown>(value: string | null | undefined): T | null {
  if (value === null || value === undefined || value === "") return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

/** Encodes a string array for a column that stores a JSON array. */
export function strArray(value: readonly string[] | null | undefined): string {
  return JSON.stringify(value ?? []);
}

/** Decodes a JSON-array column into a string array. Malformed -> []. */
export function readStrArray(value: string | null | undefined): string[] {
  const parsed = readJson<unknown>(value);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((v): v is string => typeof v === "string");
}

/** Encodes a number array for a column that stores a JSON array. */
export function intArray(value: readonly number[] | null | undefined): string {
  return JSON.stringify(value ?? []);
}

/** Decodes a JSON-array column into a number array. Malformed -> []. */
export function readIntArray(value: string | null | undefined): number[] {
  const parsed = readJson<unknown>(value);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((v): v is number => typeof v === "number");
}
