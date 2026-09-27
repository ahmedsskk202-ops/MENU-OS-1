import { PERMISSIONS, type PermissionKey } from "./rbac";

/**
 * Which permission unlocks which staff-console screen.
 *
 * The sidebar already hides nav rows a user cannot use, but hiding a link is not a
 * guard: anyone can type a URL. This map is the single list of what that link is
 * allowed to lead to, consumed by the layout guard so a direct URL entry lands on
 * "not for your role" rather than on a screen that then 403s on every fetch.
 *
 * A route that is absent from the map is not restricted beyond "signed in" — which
 * is correct for pages whose data is already permission-checked per API call.
 *
 * The permission here is the *entry* permission (the one the nav row is gated on),
 * not a list of everything the page can do. A screen that is genuinely useful to
 * several roles should be reachable by each of them; the API routes remain the
 * authority on what can actually be done inside it.
 */
export const ROUTE_PERMISSIONS: Record<string, PermissionKey> = {
  "/admin": PERMISSIONS.DASHBOARD_VIEW,
  "/admin/waiter": PERMISSIONS.ORDERS_SERVE,
  // Same gate as the sidebar link. Every control on this screen (advance, cancel, take
  // payment, discount) needs orders.manage or more, so a waiter who typed the URL used
  // to land on a page of buttons that all failed; the floor screen is theirs instead.
  "/admin/orders": PERMISSIONS.ORDERS_MANAGE,
  "/admin/pos": PERMISSIONS.ORDERS_MANAGE,
  "/admin/kitchen": PERMISSIONS.KITCHEN_VIEW,
  "/admin/tables": PERMISSIONS.TABLES_MANAGE,
  "/admin/waiter-requests": PERMISSIONS.WAITER_REQUESTS_VIEW,
  "/admin/reservations": PERMISSIONS.RESERVATIONS_MANAGE,
  "/admin/delivery": PERMISSIONS.DELIVERY_MANAGE,
  "/admin/menu": PERMISSIONS.MENU_MANAGE,
  // View is enough to open it; receiving, counts and costs are gated inside by manage.
  "/admin/inventory": PERMISSIONS.INVENTORY_VIEW,
  "/admin/staff": PERMISSIONS.STAFF_MANAGE,
  "/admin/hr": PERMISSIONS.HR_MANAGE,
  "/admin/hr/kiosk": PERMISSIONS.ATTENDANCE_KIOSK,
  "/admin/promotions": PERMISSIONS.PROMOTIONS_MANAGE,
  "/admin/combos": PERMISSIONS.PROMOTIONS_MANAGE,
  "/admin/coupons": PERMISSIONS.PROMOTIONS_MANAGE,
  "/admin/shifts": PERMISSIONS.SHIFTS_MANAGE,
  "/admin/expenses": PERMISSIONS.EXPENSES_MANAGE,
  "/admin/reports": PERMISSIONS.REPORTS_VIEW,
  "/admin/analytics": PERMISSIONS.ANALYTICS_VIEW,
  "/admin/audit-log": PERMISSIONS.AUDIT_LOG_VIEW,
  "/admin/qr": PERMISSIONS.QR_MANAGE,
};

/**
 * The permission required by the longest matching prefix of `pathname`, or null if
 * the path is unrestricted.
 *
 * Longest-prefix rather than exact match so a nested route (`/admin/menu/something`)
 * inherits its parent's gate. Sorted longest-first so `/admin/waiter` is not shadowed
 * by a shorter entry that happens to share its prefix.
 */
export function requiredPermissionFor(pathname: string): PermissionKey | null {
  const paths = Object.keys(ROUTE_PERMISSIONS).sort((a, b) => b.length - a.length);
  const match = paths.find((p) => pathname === p || pathname.startsWith(p === "/admin" ? "/admin/" : `${p}/`));
  return match ? ROUTE_PERMISSIONS[match] : null;
}

/**
 * The screen each role belongs on, keyed by the permission that puts it there.
 *
 * `/admin` is the command centre. A waiter has no business on a revenue dashboard —
 * there is nothing on it they can act on — but they are a real member of staff with a
 * real job, and a refusal page whose only link is back to the page that just refused
 * them is a dead end. So this table answers "where does this person actually work",
 * and it is consulted both when a sign-in lands on `/admin` and when a guard is about
 * to refuse someone.
 *
 * Keyed by permission, not by role name: a role list goes stale the moment somebody is
 * given a permission outside their role, and the question that matters is not "which
 * role is this" but "which screen is this person allowed to be on".
 *
 * ORDER IS THE RULE, and the first match wins. `dashboard.view` is first on purpose:
 * a Cashier and a Branch Manager both hold `orders.serve` as well, and they are desk
 * staff — sending a cashier who typed a URL they cannot use to the waiter's floor
 * would be a confusing answer to a question they did not ask. The floor-specific jobs
 * come after it, so only the roles that genuinely have no command centre get forwarded.
 *
 * Every role in ROLE_PERMISSIONS appears here. That is the invariant worth keeping:
 * a role with no home is a role whose only possible experience of the staff console is
 * the refusal screen.
 */
const ROLE_HOMES: Array<{ permission: PermissionKey; path: string }> = [
  { permission: PERMISSIONS.DASHBOARD_VIEW, path: "/admin" },
  { permission: PERMISSIONS.ORDERS_SERVE, path: "/admin/waiter" },
  { permission: PERMISSIONS.KITCHEN_VIEW, path: "/admin/kitchen" },
  { permission: PERMISSIONS.DELIVERY_MANAGE, path: "/admin/delivery" },
  { permission: PERMISSIONS.REPORTS_VIEW, path: "/admin/reports" },
  { permission: PERMISSIONS.PROMOTIONS_MANAGE, path: "/admin/promotions" },
];

/**
 * The screen `permissions` should be sent to instead of being refused, or null if they
 * have no screen of their own — in which case a refusal is the whole honest answer and
 * a "back to" link would have nowhere to go.
 *
 * Deliberately not keyed on the path: the same question ("you cannot be here, but you
 * do have somewhere to be") is asked by the layout guard and by the dashboard page, and
 * two copies of that rule is how they end up disagreeing.
 */
export function homeFor(permissions: Set<string>): string | null {
  for (const home of ROLE_HOMES) {
    if (permissions.has(home.permission)) return home.path;
  }
  return null;
}
