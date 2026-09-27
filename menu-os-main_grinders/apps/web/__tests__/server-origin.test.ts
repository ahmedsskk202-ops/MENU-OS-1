import { describe, it, expect } from "vitest";
import { resolveServerOrigin } from "@/lib/server-origin";

describe("server origin detection", () => {
  it("prefers an explicit LAN origin when provided", () => {
    expect(resolveServerOrigin({ env: { LOCAL_ORIGIN: "http://192.168.1.50:3000" } })).toBe("http://192.168.1.50:3000");
  });

  it("falls back to the host machine LAN IP when no explicit origin is set", () => {
    const origin = resolveServerOrigin({
      env: { HOST: "0.0.0.0" },
      interfaces: {
        lo: [{ family: "IPv4", address: "127.0.0.1", internal: true }],
        eth0: [{ family: "IPv4", address: "192.168.1.42", internal: false }],
      },
      port: 3000,
    });

    expect(origin).toBe("http://192.168.1.42:3000");
  });
});
