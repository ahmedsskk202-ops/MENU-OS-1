/**
 * Orders table labels the way people count them: 1, 2, … 9, 10, 11 — not the
 * 1, 10, 2 a plain string sort gives. Non-numeric labels ("Patio A") still sort
 * sensibly among themselves.
 */
export function compareTableLabels(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}
