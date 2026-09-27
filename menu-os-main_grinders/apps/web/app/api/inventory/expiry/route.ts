import { NextRequest, NextResponse } from "next/server";
import { processExpiredStock } from "@/lib/inventory";
import { inventoryAccess, MANAGE_ONLY } from "@/lib/inventory-access";

// Runs the expiry pass for one branch now, instead of waiting for the half-hourly one.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const access = await inventoryAccess(MANAGE_ONLY, body?.branchId);
  if ("error" in access) return access.error;
  const result = await processExpiredStock(access.branch.id);
  return NextResponse.json(result);
}
