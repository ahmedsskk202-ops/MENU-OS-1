import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { emitToBranch } from "@/lib/realtime";
import { writeOutboxEvent } from "@/lib/outbox";
import { notify } from "@/lib/notifications";
import { checkBranchAccess } from "@/lib/branch-access";

const bodySchema = z.object({
  branchId: z.string(),
  status: z.enum(["AVAILABLE", "LOW_STOCK", "SOLD_OUT", "SCHEDULED"]),
  // Optional: when the change actually took effect, if different from "now" (e.g. a
  // backfilled correction). Defaults to now — used by the offline-sync conflict test
  // to construct out-of-order events deterministically.
  occurredAt: z.string().datetime().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { productId: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.AVAILABILITY_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const denied = await checkBranchAccess(user, parsed.data.branchId);
  if (denied) return denied;

  const occurredAt = parsed.data.occurredAt ? new Date(parsed.data.occurredAt) : new Date();

  const availability = await prisma.$transaction(async (tx) => {
    const a = await tx.productAvailability.upsert({
      where: { productId_branchId: { productId: params.productId, branchId: parsed.data.branchId } },
      create: { productId: params.productId, branchId: parsed.data.branchId, status: parsed.data.status, updatedById: user.id },
      update: { status: parsed.data.status, updatedById: user.id },
    });
    await writeOutboxEvent(tx, {
      branchId: parsed.data.branchId,
      aggregateType: "ProductAvailability",
      aggregateId: params.productId,
      eventType: "product.availability_changed",
      payload: { productId: params.productId, status: parsed.data.status },
      occurredAt,
    });
    if (parsed.data.status === "SOLD_OUT") {
      const branch = await tx.branch.findUniqueOrThrow({ where: { id: parsed.data.branchId }, include: { brand: true } });
      const product = await tx.product.findUnique({ where: { id: params.productId } });
      await notify(tx, {
        tenantId: branch.brand.tenantId,
        branchId: parsed.data.branchId,
        type: "SOLD_OUT",
        title: `${product?.name ?? "A menu item"} is sold out`,
        data: { productId: params.productId },
      });
    }
    return a;
  });

  // A sold-out toggle must reach every customer already browsing this branch's menu instantly (spec §7).
  emitToBranch(parsed.data.branchId, {
    type: "product.availability_changed",
    branchId: parsed.data.branchId,
    productId: params.productId,
    status: parsed.data.status,
  });

  return NextResponse.json({ availability });
}
