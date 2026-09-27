/**
 * Re-exported, not redefined.
 *
 * The registry and the role map live in `@menu-os/db` because the seed — which is
 * what actually creates the `Permission` and `RolePermission` rows the auth callback
 * reads — must use the same list. When the two lists were separate files they drifted
 * (a Waiter had `dashboard.view` in the database and not in the app), and nothing
 * caught it: both files type-checked, because each was internally consistent.
 *
 * This file stays so that the ~30 existing `from "@/lib/rbac"` imports keep working
 * and so the intent of each import site is unchanged.
 */
export {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  ALL_PERMISSIONS,
  hasPermission,
  unregisteredRolePermissions,
  type PermissionKey,
} from "@menu-os/db";
