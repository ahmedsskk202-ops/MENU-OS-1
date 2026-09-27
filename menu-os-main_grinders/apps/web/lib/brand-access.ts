import { NextResponse } from "next/server";
import { prisma } from "./db";
import type { SessionUser } from "./auth";
import { getAccessibleBranchIds } from "./branch-access";

/**
 * The brand-scoped counterpart to lib/branch-access.ts, for the entities governed by
 * `brandId` rather than `branchId` (Coupon, Promotion, ComboDeal, Ingredient, Recipe —
 * all shared across a brand's branches, not owned by one). A caller has access to a
 * brand if they have access to at least one branch of it — derived from the exact same
 * branch grant every other check in this codebase already uses, not a separate model.
 */
export async function getAccessibleBrandIds(user: SessionUser): Promise<string[]> {
  const branchIds = await getAccessibleBranchIds(user);
  if (branchIds.length === 0) return [];
  const branches = await prisma.branch.findMany({ where: { id: { in: branchIds } }, select: { brandId: true } });
  return [...new Set(branches.map((b) => b.brandId))];
}

/** True only if this brand belongs to the caller's own tenant AND their role grants
 *  access to at least one branch of it. */
export async function hasBrandAccess(user: SessionUser, brandId: string): Promise<boolean> {
  const accessible = await getAccessibleBrandIds(user);
  return accessible.includes(brandId);
}

/** Same call-site pattern as checkBranchAccess:
 *    const denied = await checkBrandAccess(user, brandId);
 *    if (denied) return denied; */
export async function checkBrandAccess(user: SessionUser, brandId: string): Promise<NextResponse | null> {
  const ok = await hasBrandAccess(user, brandId);
  if (!ok) return NextResponse.json({ error: "Forbidden — you don't have access to this brand" }, { status: 403 });
  return null;
}
