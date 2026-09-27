import { describe, it, expect } from "vitest";
import { BOARD_SECTIONS } from "@/lib/kitchen-board";
import { canTransition } from "@/lib/orders";

describe("order status machine", () => {
  it("allows the standard forward flow", () => {
    expect(canTransition("CREATED", "CONFIRMED")).toBe(true);
    expect(canTransition("CONFIRMED", "PREPARING")).toBe(true);
    expect(canTransition("PREPARING", "READY")).toBe(true);
    expect(canTransition("READY", "DELIVERED")).toBe(true);
    expect(canTransition("DELIVERED", "PAID")).toBe(true);
    expect(canTransition("PAID", "CLOSED")).toBe(true);
  });

  it("rejects skipping straight from CREATED to READY", () => {
    expect(canTransition("CREATED", "READY")).toBe(false);
  });

  it("rejects moving backwards", () => {
    expect(canTransition("PREPARING", "CREATED")).toBe(false);
  });

  it("rejects transitions out of a closed order", () => {
    expect(canTransition("CLOSED", "PAID")).toBe(false);
  });

  it("includes a PAID kitchen board section", () => {
    expect(BOARD_SECTIONS.map((section) => section.status)).toContain("PAID");
  });

  it("keeps ready orders visible after the kitchen handover completes their tickets", () => {
    const readySection = BOARD_SECTIONS.find((section) => section.status === "READY");
    expect(readySection?.visibleTicketStatuses).toContain("READY");
    expect(readySection?.visibleTicketStatuses).toContain("COMPLETED");
  });
});
