import { describe, it, expect } from "vitest";
import { createRequestId } from "@/lib/request-id";

describe("request id fallback", () => {
  it("creates a valid UUID-like request id even when browser crypto.randomUUID is unavailable", () => {
    const originalCrypto = globalThis.crypto;
    Object.defineProperty(globalThis, "crypto", { value: undefined, configurable: true, writable: true });

    try {
      const id = createRequestId();
      expect(id).toMatch(/^req-[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      expect(id.length).toBeGreaterThan(10);
    } finally {
      Object.defineProperty(globalThis, "crypto", {
        value: originalCrypto,
        configurable: true,
        writable: true,
      });
    }
  });
});
