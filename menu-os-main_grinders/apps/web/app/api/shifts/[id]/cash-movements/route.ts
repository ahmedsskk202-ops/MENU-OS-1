import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { writeOutboxEvent } from "@/lib/outbox";
import { writeAuditLog } from "@/lib/audit";
import { checkBranchAccess } from "@/lib/branch-access";

const bodySchema = z.object({ type: z.enum(["CASH_IN", "CASH_OUT"]), amount: z.number().positive(), reason: z.string().min(1).max(300) });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.CASH_MOVEMENTS_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const shift = await prisma.shift.findUnique({ where: { id: params.id }, include: { branch: { include: { brand: true } } } });
  if (!shift) return NextResponse.json({ error: "Shift not found" }, { status: 404 });
  const denied = await checkBranchAccess(user, shift.branchId);
  if (denied) return denied;
  if (shift.status !== "OPEN") return NextResponse.json({ error: "Shift is already closed" }, { status: 409 });

  const movement = await prisma.$transaction(async (tx) => {
    const created = await tx.cashMovement.create({
      data: { shiftId: shift.id, branchId: shift.branchId, type: parsed.data.type, amount: parsed.data.amount, reason: parsed.data.reason, recordedById: user.id },
    });

    await writeOutboxEvent(tx, {
      branchId: shift.branchId,
      aggregateType: "CashMovement",
      aggregateId: created.id,
      eventType: "cash_movement.recorded",
      payload: { shiftId: shift.id, type: created.type, amount: created.amount.toNumber() },
    });

    await writeAuditLog(tx, {
      tenantId: shift.branch.brand.tenantId,
      branchId: shift.branchId,
      userId: user.id,
      shiftId: shift.id,
      action: "cash_movement.recorded",
      entityType: "CashMovement",
      entityId: created.id,
      after: { type: created.type, amount: created.amount.toNumber(), reason: created.reason },
    });

    return created;
  });

  return NextResponse.json({ movement }, { status: 201 });
}
