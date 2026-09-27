import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@menu-os/db";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { writeOutboxEvent } from "@/lib/outbox";
import { writeAuditLog } from "@/lib/audit";
import { emitToBranch, emitToTableSession } from "@/lib/realtime";
import { checkBranchAccess } from "@/lib/branch-access";

const bodySchema = z.object({
  type: z.enum(["PERCENTAGE", "FIXED", "FREE_ITEM"]),
  value: z.number().positive().optional(),
  productId: z.string().optional(), // required when type = FREE_ITEM: which order item becomes free
  reason: z.string().min(1).max(300),
});

// A discretionary staff discount above this share of the subtotal requires the
// discounts.approve permission, not just discounts.apply — a manager-level override,
// not a free-for-all any cashier can grant (spec: "RBAC for ... approval").
const APPROVAL_THRESHOLD_RATIO = 0.2;

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.DISCOUNTS_APPLY)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  if (parsed.data.type === "PERCENTAGE" && (!parsed.data.value || parsed.data.value > 100)) {
    return NextResponse.json({ error: "A percentage discount must be between 0 and 100" }, { status: 400 });
  }
  if (parsed.data.type === "FIXED" && !parsed.data.value) {
    return NextResponse.json({ error: "value is required for a FIXED discount" }, { status: 400 });
  }
  if (parsed.data.type === "FREE_ITEM" && !parsed.data.productId) {
    return NextResponse.json({ error: "productId is required to say which item becomes free" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { discounts: true, items: true, branch: { include: { brand: true } } },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  const denied = await checkBranchAccess(user, order.branchId);
  if (denied) return denied;
  if (["PAID", "CLOSED", "CANCELLED", "REFUNDED", "PARTIALLY_REFUNDED"].includes(order.status)) {
    return NextResponse.json({ error: "Cannot discount an order that's already been paid, closed, or cancelled — issue a refund instead" }, { status: 409 });
  }
  if (order.discounts.length > 0) {
    return NextResponse.json({ error: "This order already has a discount applied" }, { status: 409 });
  }

  const subtotal = order.subtotal;
  let freeItem: { id: string; productId: string; nameSnapshot: string; unitPriceSnapshot: Prisma.Decimal } | null = null;
  let amountApplied: Prisma.Decimal;
  if (parsed.data.type === "FREE_ITEM") {
    const item = order.items.find((i) => i.productId === parsed.data.productId);
    if (!item) return NextResponse.json({ error: "That product isn't in this order" }, { status: 400 });
    freeItem = item;
    amountApplied = item.unitPriceSnapshot.toDecimalPlaces(0);
  } else {
    amountApplied = parsed.data.type === "PERCENTAGE" ? subtotal.mul(parsed.data.value!).div(100) : new Prisma.Decimal(parsed.data.value!);
  }
  if (amountApplied.gt(subtotal)) amountApplied = subtotal;
  amountApplied = amountApplied.toDecimalPlaces(0);

  const requiresApproval = amountApplied.gt(subtotal.mul(APPROVAL_THRESHOLD_RATIO));
  if (requiresApproval && !user.permissions.includes(PERMISSIONS.DISCOUNTS_APPROVE)) {
    return NextResponse.json(
      { error: `A discount this large (${amountApplied.toString()}, over ${APPROVAL_THRESHOLD_RATIO * 100}% of the order) requires manager approval` },
      { status: 403 }
    );
  }

  const taxableBase = subtotal.sub(amountApplied);
  const taxTotal = taxableBase.mul(order.branch.taxRatePercent).div(100).toDecimalPlaces(0);
  const serviceFeeTotal = taxableBase.mul(order.branch.serviceFeeRatePercent).div(100).toDecimalPlaces(0);
  const total = taxableBase.add(taxTotal).add(serviceFeeTotal);

  const result = await prisma.$transaction(async (tx) => {
    const discount = await tx.discount.create({
      data: {
        orderId: order.id,
        type: parsed.data.type,
        value: parsed.data.value ?? amountApplied,
        amountApplied,
        reason: parsed.data.reason,
        appliedByUserId: user.id,
        approvedByUserId: requiresApproval ? user.id : null,
        freeProductId: freeItem?.productId,
        freeProductName: freeItem?.nameSnapshot,
      },
    });

    const updated = await tx.order.update({
      where: { id: order.id },
      data: { discountTotal: amountApplied, taxTotal, serviceFeeTotal, total },
    });

    await writeAuditLog(tx, {
      tenantId: order.branch.brand.tenantId,
      branchId: order.branchId,
      userId: user.id,
      action: "discount.applied",
      entityType: "Discount",
      entityId: discount.id,
      before: { discountTotal: order.discountTotal.toNumber(), total: order.total.toNumber() },
      after: {
        type: parsed.data.type,
        discountTotal: amountApplied.toNumber(),
        total: total.toNumber(),
        reason: parsed.data.reason,
        requiresApproval,
        approvedByUserId: requiresApproval ? user.id : null,
        ...(freeItem ? { freeProductId: freeItem.productId, freeProductName: freeItem.nameSnapshot, originalPrice: amountApplied.toNumber(), finalPrice: 0 } : {}),
      },
    });

    await writeOutboxEvent(tx, {
      branchId: order.branchId,
      aggregateType: "Order",
      aggregateId: order.id,
      eventType: "order.discount_applied",
      payload: {
        tenantId: order.branch.brand.tenantId,
        type: updated.type,
        status: updated.status,
        subtotal: updated.subtotal.toNumber(),
        discountTotal: updated.discountTotal.toNumber(),
        taxTotal: updated.taxTotal.toNumber(),
        serviceFeeTotal: updated.serviceFeeTotal.toNumber(),
        total: updated.total.toNumber(),
        currency: updated.currency,
        createdAt: updated.createdAt.toISOString(),
      },
    });

    return { discount, order: updated };
  });

  emitToBranch(order.branchId, { type: "order.status_changed", branchId: order.branchId, orderId: order.id, status: result.order.status, tableSessionId: order.tableSessionId });
  if (order.tableSessionId) {
    emitToTableSession(order.tableSessionId, { type: "order.status_changed", branchId: order.branchId, orderId: order.id, status: result.order.status, tableSessionId: order.tableSessionId });
  }

  return NextResponse.json({ discount: result.discount, order: result.order }, { status: 201 });
}
