import { describe, it, expect } from "vitest";
import { formatMoney, formatDuration } from "@/lib/format";

describe("formatMoney", () => {
  it("formats IQD without decimals and with thousands separators", () => {
    expect(formatMoney(13400000, "IQD")).toBe("13,400,000 IQD");
  });

  it("rounds fractional IQD amounts", () => {
    expect(formatMoney(1999.6, "IQD")).toBe("2,000 IQD");
  });
});

describe("formatDuration", () => {
  it("formats seconds as m:ss", () => {
    expect(formatDuration(65)).toBe("1:05");
    expect(formatDuration(9)).toBe("0:09");
  });
});
