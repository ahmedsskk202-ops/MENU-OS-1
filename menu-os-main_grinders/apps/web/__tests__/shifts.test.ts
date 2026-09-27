import { describe, it, expect } from "vitest";
import { computeExpectedCash, computeVariance } from "@/lib/shifts";

describe("computeExpectedCash", () => {
  it("adds opening cash and cash sales and cash-in, subtracts cash-out and refunds", () => {
    const expected = computeExpectedCash({ openingCash: 100000, cashSales: 250000, cashIn: 20000, cashOut: 15000, cashRefunds: 5000 });
    expect(expected).toBe(100000 + 250000 + 20000 - 15000 - 5000);
  });

  it("handles a shift with no activity at all", () => {
    expect(computeExpectedCash({ openingCash: 50000, cashSales: 0, cashIn: 0, cashOut: 0, cashRefunds: 0 })).toBe(50000);
  });
});

describe("computeVariance", () => {
  it("is zero when counted cash matches expected exactly", () => {
    expect(computeVariance(300000, 300000)).toBe(0);
  });

  it("is negative when the till is short", () => {
    expect(computeVariance(295000, 300000)).toBe(-5000);
  });

  it("is positive when the till has more than expected", () => {
    expect(computeVariance(303000, 300000)).toBe(3000);
  });

  it("rounds to 2 decimal places", () => {
    expect(computeVariance(100.017, 100)).toBeCloseTo(0.02, 2);
  });
});
