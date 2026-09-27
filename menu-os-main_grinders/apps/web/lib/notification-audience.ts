import type { NotificationType } from "@menu-os/db";
import { PERMISSIONS, type PermissionKey } from "@/lib/rbac";

/**
 * Who a branch-wide notification is for.
 *
 * Every branch notification used to reach every staff member of the branch, so the
 * kitchen's bell filled with "Table 5 is calling a waiter" and the waiter's with stock
 * alerts. A notification type is shown to a user who holds ANY of the listed
 * permissions — the same permissions that gate the screen where the alert is acted on.
 *
 * A notification addressed to one user (`userId`) is always shown to that user.
 */
export const NOTIFICATION_AUDIENCE: Record<NotificationType, PermissionKey[]> = {
  NEW_ORDER: [PERMISSIONS.KITCHEN_VIEW, PERMISSIONS.ORDERS_MANAGE],
  ORDER_READY: [PERMISSIONS.ORDERS_SERVE, PERMISSIONS.ORDERS_MANAGE],
  WAITER_REQUEST: [PERMISSIONS.WAITER_REQUESTS_VIEW],
  PAYMENT: [PERMISSIONS.PAYMENTS_MANAGE],
  DELAYED_ORDER: [PERMISSIONS.KITCHEN_VIEW, PERMISSIONS.ORDERS_MANAGE],
  // Floor staff need to know an item is gone before promising it to a guest.
  SOLD_OUT: [PERMISSIONS.AVAILABILITY_MANAGE, PERMISSIONS.MENU_MANAGE, PERMISSIONS.ORDERS_SERVE],
  LOW_STOCK: [PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_MANAGE],
  OUT_OF_STOCK: [PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_MANAGE],
  STOCK_EXPIRY: [PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_MANAGE],
  DELIVERY_UPDATE: [PERMISSIONS.DELIVERY_MANAGE],
};

/** The notification types a user with these permissions should see. */
export function visibleNotificationTypes(permissions: Iterable<string>): NotificationType[] {
  const held = new Set(permissions);
  return (Object.keys(NOTIFICATION_AUDIENCE) as NotificationType[]).filter((type) =>
    NOTIFICATION_AUDIENCE[type].some((p) => held.has(p))
  );
}
