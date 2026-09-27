import { describe, it, expect } from "vitest";
import { PERMISSIONS, ROLE_PERMISSIONS } from "@/lib/rbac";
import { requiredPermissionFor } from "@/lib/admin-routes";
import { convertQuantity } from "@/lib/inventory";
import { pickLanAddress, qrOrigin } from "@/lib/server-origin";

describe("roles by job", () => {
  it("lets the kitchen see stock and record waste, but not receive, count or see cost", () => {
    const k = ROLE_PERMISSIONS.Kitchen;
    expect(k).toContain(PERMISSIONS.INVENTORY_VIEW);
    expect(k).toContain(PERMISSIONS.INVENTORY_WASTE);
    expect(k).not.toContain(PERMISSIONS.INVENTORY_MANAGE);
  });

  it("gives reception the floor map and table calls", () => {
    expect(ROLE_PERMISSIONS.Cashier).toContain(PERMISSIONS.TABLES_MANAGE);
    expect(ROLE_PERMISSIONS.Cashier).toContain(PERMISSIONS.WAITER_REQUESTS_VIEW);
    // …but not adding tables to the floor plan, which needs qr.manage as well.
    expect(ROLE_PERMISSIONS.Cashier).not.toContain(PERMISSIONS.QR_MANAGE);
  });

  it("keeps staff management away from floor, kitchen and cash roles", () => {
    for (const role of ["Cashier", "Waiter", "Kitchen", "Bar", "Delivery", "Accountant", "Marketing"]) {
      expect(ROLE_PERMISSIONS[role]).not.toContain(PERMISSIONS.STAFF_MANAGE);
    }
    expect(ROLE_PERMISSIONS.Owner).toContain(PERMISSIONS.STAFF_MANAGE);
  });

  it("opens the inventory screen on view and the staff screen on staff.manage", () => {
    expect(requiredPermissionFor("/admin/inventory")).toBe(PERMISSIONS.INVENTORY_VIEW);
    expect(requiredPermissionFor("/admin/staff")).toBe(PERMISSIONS.STAFF_MANAGE);
  });
});

describe("unit conversion for recipe deduction", () => {
  it("converts within a family", () => {
    expect(convertQuantity(18, "g", "kg")).toBeCloseTo(0.018);
    expect(convertQuantity(0.25, "l", "ml")).toBe(250);
    expect(convertQuantity(2, "كغ", "غ")).toBe(2000);
  });
  it("takes incompatible units at face value", () => {
    expect(convertQuantity(3, "pcs", "g")).toBe(3);
  });
});

describe("QR address", () => {
  it("prefers the Wi-Fi over VirtualBox and Hyper-V adapters", () => {
    expect(
      pickLanAddress([
        { name: "Ethernet 2", address: "192.168.56.1" },
        { name: "wlan0", address: "192.168.0.215" },
        { name: "vEthernet (Default Switch)", address: "172.24.112.1" },
      ])
    ).toBe("192.168.0.215");
  });

  it("uses the address the manager opened the console on, unless it is localhost", () => {
    expect(qrOrigin(new Headers({ host: "10.0.0.5:3100" }), {})).toBe("http://10.0.0.5:3100");
    expect(qrOrigin(new Headers({ host: "localhost:3100" }), { LOCAL_ORIGIN: "http://10.0.0.9:3100" })).toBe("http://10.0.0.9:3100");
    expect(qrOrigin(new Headers({ host: "10.0.0.5:3100" }), { QR_BASE_URL: "https://menu.example.com/" })).toBe("https://menu.example.com");
  });
});
