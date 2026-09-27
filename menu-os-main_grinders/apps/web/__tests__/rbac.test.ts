import { describe, it, expect } from "vitest";
import { hasPermission, PERMISSIONS, ROLE_PERMISSIONS } from "@/lib/rbac";
import { homeFor } from "@/lib/admin-routes";

describe("rbac", () => {
  it("grants a permission a user actually has", () => {
    const perms = new Set([PERMISSIONS.ORDERS_VIEW]);
    expect(hasPermission(perms, PERMISSIONS.ORDERS_VIEW)).toBe(true);
  });

  it("denies a permission a user does not have", () => {
    const perms = new Set([PERMISSIONS.ORDERS_VIEW]);
    expect(hasPermission(perms, PERMISSIONS.REVENUE_VIEW)).toBe(false);
  });

  it("never gives Waiter access to revenue data (spec §39)", () => {
    expect(ROLE_PERMISSIONS.Waiter).not.toContain(PERMISSIONS.REVENUE_VIEW);
  });

  it("keeps the waiter on the floor rather than the dashboard", () => {
    const waiterPerms = new Set(ROLE_PERMISSIONS.Waiter);
    expect(waiterPerms.has(PERMISSIONS.DASHBOARD_VIEW)).toBe(false);
    expect(homeFor(waiterPerms)).toBe("/admin/waiter");

    const managerPerms = new Set(ROLE_PERMISSIONS.Owner);
    expect(homeFor(managerPerms)).toBe("/admin");
  });

  it("gives Owner every permission", () => {
    expect(new Set(ROLE_PERMISSIONS.Owner)).toEqual(new Set(Object.values(PERMISSIONS)));
  });
});
