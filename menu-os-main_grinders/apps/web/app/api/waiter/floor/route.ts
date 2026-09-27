import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PERMISSIONS } from "@/lib/rbac";
import { authenticate } from "@/lib/api-guard";
import { checkBranchAccess } from "@/lib/branch-access";
import { prisma } from "@/lib/db";
import { updateOrderStatus } from "@/lib/orders";
import { getWaiterFloor } from "@/lib/waiter-floor";

/**
 * GET  /api/waiter/floor?branchId=…   — ready to serve + table calls, one round trip
 * POST /api/waiter/floor  { orderId } — "I have put this on the table" (READY → DELIVERED)
 *
 * This is the whole screen a waiter works from, so it is deliberately its own endpoint
 * rather than a filtered view over the Orders list. The Orders screen is built for a
 * manager reconciling money; this one is built for someone carrying two plates who
 * needs to know two things: what is ready, and who is calling.
 */
export async function GET(req: NextRequest) {
  // A waiter has ORDERS_SERVE, not ORDERS_MANAGE — this route is the one place that
  // distinction is enforced, and it is enforced on the server rather than by hiding a
  // nav item.
  const auth = await authenticate(PERMISSIONS.ORDERS_SERVE);
  if (auth.error) return auth.error;

  const branchId = req.nextUrl.searchParams.get("branchId");
  if (!branchId) return NextResponse.json({ error: "branchId is required" }, { status: 400 });
  const outOfReach = await checkBranchAccess(auth.user, branchId);
  if (outOfReach) return outOfReach;

  return NextResponse.json(await getWaiterFloor(branchId));
}

const bodySchema = z.object({ orderId: z.string() });

export async function POST(req: NextRequest) {
  const auth = await authenticate(PERMISSIONS.ORDERS_SERVE);
  if (auth.error) return auth.error;

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id: parsed.data.orderId }, select: { id: true, branchId: true, status: true } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  const outOfReach = await checkBranchAccess(auth.user, order.branchId);
  if (outOfReach) return outOfReach;

  // Checked here rather than left to fail inside the status machine, so the loser of a
  // two-waiters-at-once race gets a message that says why. That race is the normal case
  // on a busy floor, not an edge case.
  if (order.status !== "READY") {
    const what = order.status.toLowerCase().replace(/_/g, " ");
    return NextResponse.json({ error: `This order is ${what}, not ready to serve` }, { status: 409 });
  }

  // The kitchen's tickets are already COMPLETED — it handed the order over when the
  // board's last button was pressed. What is left is the difference between "ready" and
  // "served" on any report, which is why this is not just the board's button again.
  const updated = await updateOrderStatus(order.id, "DELIVERED", auth.user.id);

  // No notification is raised here. The order's own status_changed broadcast already
  // tells every branch screen — the kitchen board most of all — that the plates landed,
  // and a "Table 5 served" notification would only ping the staff member who just
  // pressed the button about something they did. The two notifications this workflow
  // genuinely needs are raised upstream: ORDER_READY when the kitchen plates, and
  // WAITER_REQUEST when a guest presses the button on their phone.
  return NextResponse.json({ order: updated, orderStatus: updated.status });
}
