import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "./db";
import { authenticate } from "./api-guard";
import { checkBranchAccess } from "./branch-access";
import { PERMISSIONS } from "./rbac";

/**
 * The shared front half of every inventory route: signed in, holding at least one of
 * `anyOf`, and allowed into the branch. Returns the user, the branch, and whether they
 * may see money (costs and stock value are inventory.manage only — the kitchen sees
 * quantities, not prices).
 */
export async function inventoryAccess(anyOf: string[], branchId: string | null | undefined) {
  const auth = await authenticate();
  if (auth.error) return { error: auth.error };
  const user = auth.user;
  if (!anyOf.some((p) => user.permissions.includes(p))) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  if (!branchId) return { error: NextResponse.json({ error: "branchId is required" }, { status: 400 }) };
  const denied = await checkBranchAccess(user, branchId);
  if (denied) return { error: denied };
  const branch = await prisma.branch.findUnique({ where: { id: branchId }, include: { brand: true } });
  if (!branch) return { error: NextResponse.json({ error: "Branch not found" }, { status: 404 }) };
  return { user, branch, canSeeCost: user.permissions.includes(PERMISSIONS.INVENTORY_MANAGE) };
}

/** The ingredient, only if it belongs to this branch's brand. */
export async function ingredientForBranch(ingredientId: string, brandId: string) {
  const ingredient = await prisma.ingredient.findUnique({ where: { id: ingredientId } });
  return ingredient && ingredient.brandId === brandId ? ingredient : null;
}

export const VIEW_ANY: string[] = [PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_MANAGE];
export const WASTE_ANY: string[] = [PERMISSIONS.INVENTORY_WASTE, PERMISSIONS.INVENTORY_MANAGE];
export const MANAGE_ONLY: string[] = [PERMISSIONS.INVENTORY_MANAGE];

/** The editable settings of an inventory item, shared by create and edit. */
export const ingredientFields = {
  sku: z.string().trim().max(60).optional().nullable(),
  category: z.string().trim().max(60).optional().nullable(),
  lowStockThreshold: z.number().min(0).optional().nullable(),
  reorderQuantity: z.number().min(0).optional().nullable(),
  costingMethod: z.enum(["FIFO", "FEFO"]).optional(),
  trackExpiry: z.boolean().optional(),
  shelfLifeDays: z.number().int().min(1).max(3650).optional().nullable(),
  expiryAlertDays: z.number().int().min(0).max(365).optional(),
  isActive: z.boolean().optional(),
};
