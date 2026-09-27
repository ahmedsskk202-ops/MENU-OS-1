export function createRequestId(prefix = "req") {
  const cryptoApi = globalThis.crypto;

  if (typeof cryptoApi?.randomUUID === "function") {
    return `${prefix}-${cryptoApi.randomUUID()}`;
  }

  const bytes = new Uint8Array(16);
  if (typeof cryptoApi?.getRandomValues === "function") {
    cryptoApi.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  // 4 bits per nibble; ensure valid v4 UUID format for server-side validation.
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const uuid = [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-");

  return `${prefix}-${uuid}`;
}

export function formatApiError(error: unknown, fallback = "Something went wrong") {
  if (typeof error === "string") return error || fallback;
  if (error instanceof Error) return error.message || fallback;
  if (error && typeof error === "object") {
    if ("message" in error && typeof error.message === "string" && error.message.trim()) return error.message;
    if ("error" in error && typeof error.error === "string" && error.error.trim()) return error.error;
    if ("issues" in error && Array.isArray(error.issues)) {
      const firstIssue = error.issues.find((entry) => entry && typeof entry === "object" && "message" in entry && typeof entry.message === "string");
      if (firstIssue && typeof firstIssue === "object" && "message" in firstIssue && typeof firstIssue.message === "string") {
        return firstIssue.message;
      }
    }
    if ("fieldErrors" in error && typeof error.fieldErrors === "object" && error.fieldErrors) {
      const values = Object.values(error.fieldErrors as Record<string, unknown>);
      const first = values.find((v) => Array.isArray(v) && v.length > 0 && typeof v[0] === "string");
      if (first && Array.isArray(first) && typeof first[0] === "string") return first[0];
    }
    const json = JSON.stringify(error);
    if (json && json !== "{}" && json !== "[]") return json;
  }
  return fallback;
}
