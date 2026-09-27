import { describe, it, expect } from "vitest";
import { dayRange, hoursBetween, isTime, localDate, monthRange } from "@/lib/hr";
import { PERMISSIONS, ROLE_PERMISSIONS } from "@/lib/rbac";

describe("HR dates (Baghdad, UTC+3)", () => {
  it("uses the cafe's calendar day, not the server's UTC day", () => {
    // 22:30 UTC on the 27th is already 01:30 on the 28th in Baghdad.
    expect(localDate(new Date("2026-09-27T22:30:00Z"))).toBe("2026-09-28");
  });
  it("month range covers exactly the local month", () => {
    const { from, to } = monthRange("2026-12");
    expect(from.toISOString()).toBe("2026-11-30T21:00:00.000Z");
    expect(to.toISOString()).toBe("2026-12-31T21:00:00.000Z");
  });
  it("day range is 24h from local midnight", () => {
    const { from, to } = dayRange("2026-09-27");
    expect(to.getTime() - from.getTime()).toBe(86_400_000);
  });
  it("hours and time format", () => {
    expect(hoursBetween(new Date("2026-09-27T05:00:00Z"), new Date("2026-09-27T13:30:00Z"))).toBe(8.5);
    expect(isTime("08:00")).toBe(true);
    expect(isTime("24:00")).toBe(false);
  });
});

describe("HR permissions", () => {
  it("keeps salaries away from reception and floor staff", () => {
    for (const role of ["Cashier", "Waiter", "Kitchen", "Bar"]) expect(ROLE_PERMISSIONS[role]).not.toContain(PERMISSIONS.HR_MANAGE);
    expect(ROLE_PERMISSIONS.Cashier).toContain(PERMISSIONS.ATTENDANCE_KIOSK);
    expect(ROLE_PERMISSIONS.Owner).toContain(PERMISSIONS.HR_MANAGE);
  });
});
