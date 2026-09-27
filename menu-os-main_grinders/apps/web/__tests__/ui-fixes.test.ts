import { describe, it, expect } from "vitest";
import { PERMISSIONS, ROLE_PERMISSIONS } from "@/lib/rbac";
import { NOTIFICATION_AUDIENCE, visibleNotificationTypes } from "@/lib/notification-audience";
import { notificationText } from "@/lib/notification-text";
import { compareTableLabels } from "@/lib/table-labels";
import { stationForGrindersProduct } from "../../../packages/db/prisma/grinders-stations";
import menu from "../../../packages/db/prisma/grinders-menu.json";

// A stand-in translator that behaves like the real one: a key it does not know comes
// back unchanged, a known key comes back as the key plus its variables — so assertions
// check which message was chosen and with what, independent of the wording.
const KNOWN = new Set(["admin.waiter.type.WATER", "admin.notif.delayed.status.CREATED"]);
const t = (key: string, vars?: Record<string, string | number>) =>
  vars ? `${key}(${Object.entries(vars).map(([k, v]) => `${k}=${v}`).join(",")})` : KNOWN.has(key) ? (key.startsWith("admin.waiter.type.") ? `type:${key.slice(18)}` : `T[${key}]`) : key;

describe("notification audience", () => {
  it("keeps waiter calls out of the kitchen and in front of the waiter", () => {
    expect(visibleNotificationTypes(ROLE_PERMISSIONS.Kitchen)).not.toContain("WAITER_REQUEST");
    expect(visibleNotificationTypes(ROLE_PERMISSIONS.Waiter)).toContain("WAITER_REQUEST");
  });

  it("tells the waiter a plate is ready, and the kitchen about new and late orders", () => {
    expect(visibleNotificationTypes(ROLE_PERMISSIONS.Waiter)).toContain("ORDER_READY");
    expect(visibleNotificationTypes(ROLE_PERMISSIONS.Kitchen)).toEqual(expect.arrayContaining(["NEW_ORDER", "DELAYED_ORDER", "LOW_STOCK"]));
    expect(visibleNotificationTypes(ROLE_PERMISSIONS.Waiter)).not.toContain("LOW_STOCK");
  });

  it("shows the owner everything", () => {
    expect(visibleNotificationTypes(ROLE_PERMISSIONS.Owner)).toHaveLength(Object.keys(NOTIFICATION_AUDIENCE).length);
  });
});

describe("notification text", () => {
  it("builds an order-ready alert from the table, not the stored English", () => {
    const text = notificationText({ type: "ORDER_READY", title: "Order ready — Table 12", data: { tableLabel: "12" } }, t);
    expect(text.title).toBe("admin.notif.orderReady.title(label=12)");
  });

  it("translates the waiter-call reason and keeps a guest's own note as written", () => {
    expect(notificationText({ type: "WAITER_REQUEST", title: "x", body: "WATER", data: { tableLabel: "5" } }, t).body).toBe("type:WATER");
    expect(notificationText({ type: "WAITER_REQUEST", title: "x", body: "extra napkins", data: { tableLabel: "5" } }, t).body).toBe("extra napkins");
  });

  it("names the table on a late order and says what it is waiting on", () => {
    const text = notificationText(
      { type: "DELAYED_ORDER", title: "x", data: { tableLabel: "3", orderNumber: "ABC123", status: "CREATED", minutes: 25 } },
      t
    );
    expect(text.title).toBe("admin.notif.delayed.table(label=3)");
    expect(text.body).toBe("admin.notif.delayed.body(minutes=25,status=T[admin.notif.delayed.status.CREATED])");
  });

  it("falls back to the stored text for older rows without structured data", () => {
    const text = notificationText({ type: "DELAYED_ORDER", title: "Order #ABC123 is running late", body: "Still created after 20 minutes", data: { orderId: "o1" } }, t);
    expect(text).toEqual({ title: "Order #ABC123 is running late", body: "Still created after 20 minutes" });
  });
});

describe("table labels", () => {
  it("sorts the way people count", () => {
    expect(["1", "10", "2", "12", "3"].sort(compareTableLabels)).toEqual(["1", "2", "3", "10", "12"]);
  });
});

describe("Grinders kitchen routing", () => {
  it("sends drinks in mixed categories to a drinks station", () => {
    expect(stationForGrindersProduct("Autumn Collection", "Pumpkin Spice Latte")).toBe("Hot Drinks");
    expect(stationForGrindersProduct("Autumn Collection", "Iced Pumpkin Spice Latte")).toBe("Iced & Cold Brew");
    expect(stationForGrindersProduct("Autumn Collection", "Pumpkin Matcha Cold Foam")).toBe("Iced & Cold Brew");
    expect(stationForGrindersProduct("Light Drinks", "Vanilla Frappe Sugar Free")).toBe("Frappe & Cream");
    expect(stationForGrindersProduct("Chillers", "Lime Raspberry")).toBe("Iced & Cold Brew");
  });

  it("keeps desserts at the bakery, pizzas in the kitchen and merchandise at the counter", () => {
    expect(stationForGrindersProduct("Autumn Collection", "Pecan Caramel Cheesecake")).toBe("Bakery & Desserts");
    expect(stationForGrindersProduct("Pastries", "Cinnamon Roll")).toBe("Bakery & Desserts");
    expect(stationForGrindersProduct("Pastries", "Margarita mini pizza")).toBe("Kitchen");
    expect(stationForGrindersProduct("Our Products", "CERAMIC MERCH 4OZ")).toBe("Coffee Bar");
  });

  it("routes every sized (drink) product in the real menu to a drinks station", () => {
    const drinkStations = new Set(["Hot Drinks", "Iced & Cold Brew", "Frappe & Cream"]);
    for (const cat of (menu as any).categories) {
      if (cat.nameEn === "Our Products") continue;
      for (const p of cat.products) {
        const sizes = ["s", "m", "l"].filter((k) => (p.prices[k] ?? 0) > 0).length;
        if (sizes >= 2) expect(drinkStations.has(stationForGrindersProduct(cat.nameEn, p.nameEn)), `${cat.nameEn}: ${p.nameEn}`).toBe(true);
      }
    }
  });
});

describe("waiter permissions", () => {
  it("lets a waiter serve orders", () => {
    expect(ROLE_PERMISSIONS.Waiter).toContain(PERMISSIONS.ORDERS_SERVE);
  });
});
