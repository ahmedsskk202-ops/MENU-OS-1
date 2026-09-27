import { describe, it, expect } from "vitest";
import { soundForType } from "@/lib/notification-sound";
import { NOTIFICATION_AUDIENCE } from "@/lib/notification-audience";

describe("notification sounds", () => {
  it("gives waiter calls their own unmistakable sound", () => {
    expect(soundForType("WAITER_REQUEST")).toBe("call");
    expect(soundForType("NEW_ORDER")).toBe("order");
    expect(soundForType("ORDER_READY")).toBe("ready");
  });
  it("every notification type plays something", () => {
    for (const type of Object.keys(NOTIFICATION_AUDIENCE)) {
      expect(["call", "order", "ready", "alert", "info"]).toContain(soundForType(type));
    }
  });
});
