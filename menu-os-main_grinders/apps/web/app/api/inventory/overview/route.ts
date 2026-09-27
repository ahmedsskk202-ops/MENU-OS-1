import { NextRequest, NextResponse } from "next/server";
import { getInventoryOverview } from "@/lib/inventory";
import { inventoryAccess, VIEW_ANY } from "@/lib/inventory-access";

export async function GET(req: NextRequest) {
  const access = await inventoryAccess(VIEW_ANY, req.nextUrl.searchParams.get("branchId"));
  if ("error" in access) return access.error;
  const overview = await getInventoryOverview(access.branch.id, access.branch.brandId, access.canSeeCost);
  return NextResponse.json({ ...overview, canSeeCost: access.canSeeCost, currency: access.branch.brand.currency });
}
