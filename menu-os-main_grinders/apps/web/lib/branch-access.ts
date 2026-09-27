import { NextResponse } from "next/server";
import { prisma } from "./db";
import type { SessionUser } from "./auth";

/**
 * Resolves a staff user's role-scoped access into concrete branch ids within their own
 * tenant. `branchIds: []` on the session (a tenant-wide role — Owner/General Manager/
 * Accountant/Marketing, per lib/rbac.ts's seeded UserBranchRole with branchId: null)
 * expands to every branch of that tenant; a branch-scoped role's list is used as-is.
 * Tenant isolation is enforced here too — a tenant-wide user only ever gets branches
 * of their OWN tenant, never another tenant's, regardless of what branchId a request
 * might ask about.
 */
export async function getAccessibleBranchIds(user: SessionUser): Promise<string[]> {
  if (user.branchIds.length > 0) return user.branchIds;
  const branches = await prisma.branch.findMany({ where: { brand: { tenantId: user.tenantId } }, select: { id: true } });
  return branches.map((b) => b.id);
}

/** True only if this branch is both in the user's own tenant and one their role grants
 *  access to (tenant-wide or explicitly listed). */
export async function hasBranchAccess(user: SessionUser, branchId: string): Promise<boolean> {
  const accessible = await getAccessibleBranchIds(user);
  return accessible.includes(branchId);
}

/**
 * The single call-site pattern every branch-scoped route should use:
 *   const denied = await checkBranchAccess(user, branchId);
 *   if (denied) return denied;
 * Returns a 403 NextResponse (safe to `return` directly) when access isn't granted,
 * or `null` when it is. A 403 rather than 404 here is intentional and consistent with
 * every other permission failure in this codebase (see PERMISSIONS checks throughout
 * app/api/**) — this is an authorization gate, not a resource lookup.
 */
export async function checkBranchAccess(user: SessionUser, branchId: string): Promise<NextResponse | null> {
  const ok = await hasBranchAccess(user, branchId);
  if (!ok) return NextResponse.json({ error: "Forbidden — you don't have access to this branch" }, { status: 403 });
  return null;
}
