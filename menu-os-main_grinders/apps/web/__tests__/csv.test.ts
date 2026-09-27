import { describe, it, expect } from "vitest";
import { toCsv } from "@/lib/export/csv";

describe("toCsv", () => {
  it("produces a header row and one row per record, in column order", () => {
    const csv = toCsv(
      [
        { key: "name", label: "Name" },
        { key: "amount", label: "Amount" },
      ],
      [
        { name: "Coffee", amount: 5000 },
        { name: "Tea", amount: 3000 },
      ]
    );
    expect(csv).toBe("Name,Amount\r\nCoffee,5000\r\nTea,3000");
  });

  it("quotes and escapes cells containing commas, quotes, or newlines", () => {
    const csv = toCsv([{ key: "note", label: "Note" }], [{ note: 'Table 5, "VIP"\nrepeat guest' }]);
    expect(csv).toBe('Note\r\n"Table 5, ""VIP""\nrepeat guest"');
  });

  it("renders missing values as an empty cell, not the literal word undefined", () => {
    const csv = toCsv([{ key: "missing", label: "Missing" }], [{}]);
    expect(csv).toBe("Missing\r\n");
  });
});
