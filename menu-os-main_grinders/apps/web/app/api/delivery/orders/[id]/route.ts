import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { emitToBranch, emitToCustomerSession } from "@/lib/realtime";
import { updateOrderStatus } from "@/lib/orders";
import { notify } from "@/lib/notifications";
import { writeOutboxEvent } from "@/lib/outbox";
import { checkBranchAccess } from "@/lib/branch-access";

const patchSchema = z.object({
  status: z.enum(["NEW", "CONFIRMED", "PREPARING", "READY", "ASSIGNED", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED"]).optional(),
  driverId: z.string().nullable().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.DELIVERY_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const existing = await prisma.deliveryOrder.findUnique({ where: { id: params.id }, include: { order: true } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const denied = await checkBranchAccess(user, existing.order.branchId);
  if (denied) return denied;

  const data = parsed.data;
  const deliveryOrder = await prisma.$transaction(async (tx) => {
    const updated = await tx.deliveryOrder.update({
      where: { id: params.id },
      data: {
        status: data.status,
        driverId: data.driverId === undefined ? undefined : data.driverId,
        assignedAt: data.driverId && !existing.assignedAt ? new Date() : undefined,
        deliveredAt: data.status === "DELIVERED" ? new Date() : undefined,
      },
      include: { driver: true, zone: true, order: true },
    });
    await writeOutboxEvent(tx, {
      branchId: existing.order.branchId,
      aggregateType: "DeliveryOrder",
      aggregateId: updated.id,
      eventType: "delivery_order.updated",
      payload: {
        orderId: updated.orderId,
        status: updated.status,
        zoneId: updated.zoneId,
        deliveryFee: updated.deliveryFee.toNumber(),
        driverId: updated.driverId,
        deliveredAt: updated.deliveredAt?.toISOString() ?? null,
      },
    });
    return updated;
  });

  // Keep the Order's own status timeline honest: reaching DELIVERED here means the
  // guest has the food in hand, same real-world event that ends dine-in's READY stage.
  if (data.status === "DELIVERED" && existing.order.status === "READY") {
    try {
      await updateOrderStatus(existing.orderId, "DELIVERED", user.id, "Delivered by rider");
    } catch {
      // status machine already elsewhere (e.g. manually advanced) — the delivery
      // leg itself is still recorded correctly above.
    }
  }

  emitToBranch(existing.order.branchId, { type: "delivery_order.updated", branchId: existing.order.branchId, deliveryOrder });
  if (existing.order.customerSessionId) {
    emitToCustomerSession(existing.order.customerSessionId, { type: "delivery_order.updated", branchId: existing.order.branchId, deliveryOrder });
  }

  if (data.status === "OUT_FOR_DELIVERY" || data.status === "DELIVERED" || data.status === "FAILED") {
    const branch = await prisma.branch.findUniqueOrThrow({ where: { id: existing.order.branchId }, include: { brand: true } });
    await notify(prisma, {
      tenantId: branch.brand.tenantId,
      branchId: existing.order.branchId,
      type: "DELIVERY_UPDATE",
      title: `${deliveryOrder.customerName}'s delivery is ${data.status.toLowerCase().replace(/_/g, " ")}`,
      data: { deliveryOrderId: deliveryOrder.id },
    });
  }

  return NextResponse.json({ deliveryOrder });
}
