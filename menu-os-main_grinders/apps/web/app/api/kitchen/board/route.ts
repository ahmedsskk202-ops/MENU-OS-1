import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PERMISSIONS } from "@/lib/rbac";
import { authenticate } from "@/lib/api-guard";
import { checkBranchAccess } from "@/lib/branch-access";
import { prisma } from "@/lib/db";
import { advanceBoardCard, getKitchenBoard } from "@/lib/kitchen-board";

/**
 * GET  /api/kitchen/board?branchId=…[&stationId=…]  — the whole board in one round trip
 * POST /api/kitchen/board  { orderId, stationId? }     — press the card's one button
 *
 * Separate from `/api/kitchen/orders`, which stays as the raw per-station ticket view.
 * The board is order-centric and therefore cannot be assembled from that shape without
 * re-grouping the same rows on the client, and the kitchen screen should not depend on
 * a second screen's data contract.
 */
export async function GET(req: NextRequest) {
  const auth = await authenticate(PERMISSIONS.KITCHEN_VIEW);
  if (auth.error) return auth.error;

  const branchId = req.nextUrl.searchParams.get("branchId");
  if (!branchId) return NextResponse.json({ error: "branchId is required" }, { status: 400 });
  const outOfReach = await checkBranchAccess(auth.user, branchId);
  if (outOfReach) return outOfReach;

  const stationId = req.nextUrl.searchParams.get("stationId");
  return NextResponse.json(await getKitchenBoard({ branchId, stationId }));
}

const advanceSchema = z.object({
  orderId: z.string(),
  /** Omitted = the unfiltered board, which advances every station on the order. */
  stationId: z.string().nullish(),
});

export async function POST(req: NextRequest) {
  const auth = await authenticate(PERMISSIONS.KITCHEN_MANAGE);
  if (auth.error) return auth.error;

  const parsed = advanceSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id: parsed.data.orderId }, select: { branchId: true } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  const outOfReach = await checkBranchAccess(auth.user, order.branchId);
  if (outOfReach) return outOfReach;

  try {
    return NextResponse.json(await advanceBoardCard({ orderId: parsed.data.orderId, stationId: parsed.data.stationId ?? null }));
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not advance that order" }, { status: 422 });
  }
}
