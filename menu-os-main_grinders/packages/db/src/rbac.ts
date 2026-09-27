/**
 * The permission registry and the role→permission map.
 *
 * This lives in the database package, beside the schema it describes, and that is
 * deliberate. A role definition is *data*: `Role` and `RolePermission` rows are what
 * the auth callback actually reads into the session JWT, and the seed is what writes
 * them. The web app's gates are only a consumer of that data.
 *
 * The drift that put this file here is the reason to keep it here. Two hand-maintained
 * lists — this one and the one in the seed — disagreed about whether a Waiter could see
 * the dashboard, and nothing complained: TypeScript was clean on both sides, because
 * each list was internally consistent. The only symptom was a logged-in waiter whose
 * permissions did not match what the UI expected. One list cannot drift from itself.
 *
 * Import it from `@menu-os/db` in application code, or from `../src/rbac` in the seed
 * (which runs under ts-node without the workspace build).
 */

// Central permission registry. Every gate in the admin app checks one of these
// keys — never a role name directly — so permissions stay decoupled from titles.
export const PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard.view",
  REVENUE_VIEW: "revenue.view",
  MENU_MANAGE: "menu.manage",
  AVAILABILITY_MANAGE: "availability.manage",
  ORDERS_VIEW: "orders.view",
  ORDERS_MANAGE: "orders.manage",
  // Deliberately narrower than ORDERS_MANAGE. "Serve" is the single action a
  // waiter takes on a READY order (mark it delivered to the table) — it cannot
  // cancel, refund, re-open or otherwise touch the order lifecycle, pricing or
  // payments. Splitting it out is what lets a Waiter have a real, useful screen
  // without inheriting cashier powers.
  ORDERS_SERVE: "orders.serve",
  KITCHEN_VIEW: "kitchen.view",
  KITCHEN_MANAGE: "kitchen.manage",
  TABLES_MANAGE: "tables.manage",
  WAITER_REQUESTS_VIEW: "waiter_requests.view",
  WAITER_REQUESTS_MANAGE: "waiter_requests.manage",
  PAYMENTS_MANAGE: "payments.manage",
  REFUNDS_MANAGE: "refunds.manage",
  DELIVERY_MANAGE: "delivery.manage",
  PROMOTIONS_MANAGE: "promotions.manage",
  STAFF_MANAGE: "staff.manage",
  QR_MANAGE: "qr.manage",
  AUDIT_LOG_VIEW: "audit_log.view",
  ANALYTICS_VIEW: "analytics.view",
  SETTINGS_MANAGE: "settings.manage",
  SHIFTS_MANAGE: "shifts.manage",
  CASH_MOVEMENTS_MANAGE: "cash_movements.manage",
  EXPENSES_MANAGE: "expenses.manage",
  REPORTS_VIEW: "reports.view",
  REPORTS_EXPORT: "reports.export",
  DISCOUNTS_APPLY: "discounts.apply",
  DISCOUNTS_APPROVE: "discounts.approve",
  RESERVATIONS_MANAGE: "reservations.manage",
  // Inventory is split by job. VIEW: see stock levels, expiry and alerts (the kitchen
  // needs this to know what is running out). WASTE: record spoiled/dropped stock, which
  // is a kitchen action. MANAGE: receive deliveries, stock counts, transfers, item setup,
  // recipes and anything that shows cost — a purchasing/manager job.
  INVENTORY_VIEW: "inventory.view",
  INVENTORY_WASTE: "inventory.waste",
  INVENTORY_MANAGE: "inventory.manage",
  // HR: employees, salaries, payroll, shifts, daily notes, attendance records.
  HR_MANAGE: "hr.manage",
  // The attendance tablet: lets staff punch in/out with their code on this device.
  ATTENDANCE_KIOSK: "attendance.kiosk",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** Every permission, in registry order. The seed turns this into `Permission` rows. */
export const ALL_PERMISSIONS: PermissionKey[] = Object.values(PERMISSIONS);

export const ROLE_PERMISSIONS: Record<string, PermissionKey[]> = {
  // One account runs the restaurant: owner and branch manager used to be separate roles
  // (plus a General Manager) and are now merged into this one. It can hire anyone into
  // any department. Roles dropped from this list are removed by role-sync.
  Owner: ALL_PERMISSIONS,
  // Reception / front desk. There is no separate "Reception" role in this app —
  // the cashier is whoever greets, seats, takes payment and closes the table, so
  // the Cashier role is the reception desk. It keeps orders.manage because seating a
  // table and taking payment both require it.
  Cashier: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_MANAGE,
    PERMISSIONS.ORDERS_SERVE,
    PERMISSIONS.PAYMENTS_MANAGE,
    PERMISSIONS.AVAILABILITY_MANAGE,
    PERMISSIONS.SHIFTS_MANAGE,
    PERMISSIONS.CASH_MOVEMENTS_MANAGE,
    PERMISSIONS.EXPENSES_MANAGE,
    PERMISSIONS.DISCOUNTS_APPLY,
    PERMISSIONS.RESERVATIONS_MANAGE,
    // Reception seats guests and frees tables, so it needs the floor map and the table
    // calls. Adding a table to the floor plan still needs qr.manage, which it lacks.
    PERMISSIONS.TABLES_MANAGE,
    PERMISSIONS.WAITER_REQUESTS_VIEW,
    // The reception tablet doubles as the staff clock-in point.
    PERMISSIONS.ATTENDANCE_KIOSK,
  ],
  // Floor staff. Intentionally a short list: serve a ready order, answer a table
  // call, and look after the room. No delivery, no kitchen, no money, no reports.
  // Serving (orders.serve) is here because handing a plate to table 12 is the
  // waiter's own job — it just must not be the same permission as "manage orders".
  //
  // No dashboard.view either: a waiter is sent straight to /admin/waiter, which is
  // the whole job, rather than to a revenue dashboard they cannot act on.
  Waiter: [
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_SERVE,
    PERMISSIONS.TABLES_MANAGE,
    PERMISSIONS.WAITER_REQUESTS_VIEW,
    PERMISSIONS.WAITER_REQUESTS_MANAGE,
    PERMISSIONS.RESERVATIONS_MANAGE,
  ],
  // Kitchen works the board: move an order between sections and mark it ready.
  // It has no orders.manage, so it cannot reach pricing, payments or cancellations,
  // and no waiter/table permissions, so the two boards cannot impersonate each other.
  //
  // Inventory: the kitchen sees stock, expiry and shortages and records its own waste,
  // but does not receive deliveries, change counts or see costs — that is inventory.manage.
  Kitchen: [
    PERMISSIONS.KITCHEN_VIEW,
    PERMISSIONS.KITCHEN_MANAGE,
    PERMISSIONS.AVAILABILITY_MANAGE,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_WASTE,
  ],
  Bar: [
    PERMISSIONS.KITCHEN_VIEW,
    PERMISSIONS.KITCHEN_MANAGE,
    PERMISSIONS.AVAILABILITY_MANAGE,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_WASTE,
  ],
  Delivery: [PERMISSIONS.DELIVERY_MANAGE, PERMISSIONS.ORDERS_VIEW],
  Accountant: [
    PERMISSIONS.REVENUE_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.REFUNDS_MANAGE,
    PERMISSIONS.AUDIT_LOG_VIEW,
    PERMISSIONS.EXPENSES_MANAGE,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.SHIFTS_MANAGE,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_MANAGE,
    PERMISSIONS.HR_MANAGE,
  ],
  Marketing: [PERMISSIONS.PROMOTIONS_MANAGE, PERMISSIONS.ANALYTICS_VIEW],
};

export function hasPermission(userPermissions: Set<string>, key: PermissionKey): boolean {
  return userPermissions.has(key);
}

/**
 * Every permission referenced by a role but missing from the registry, as a list of
 * `"Role: permission.key"` strings. Asserted empty by the seed, because a role that
 * names a permission the registry does not know about would be handed a `RolePermission`
 * row no gate in the app can ever check — a grant that looks real and does nothing.
 */
export function unregisteredRolePermissions(): string[] {
  const known = new Set<string>(ALL_PERMISSIONS);
  const missing: string[] = [];
  for (const [role, keys] of Object.entries(ROLE_PERMISSIONS)) {
    for (const key of keys) if (!known.has(key)) missing.push(`${role}: ${key}`);
  }
  return missing;
}
