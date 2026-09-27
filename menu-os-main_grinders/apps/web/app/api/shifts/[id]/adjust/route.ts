import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { writeOutboxEvent } from "@/lib/outbox";
import { writeAuditLog } from "@/lib/audit";
import { checkBranchAccess } from "@/lib/branch-access";

const bodySchema = z.object({ correctedActualCash: z.number().nonnegative(), reason: z.string().min(1).max(500) });

// A closed shift's numbers are never edited in place — this creates a new, fully
// audited correction (old value, new value, who, why) instead. The original close
// record is untouched; only the correction is layered on top.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.SHIFTS_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const shift = await prisma.shift.findUnique({ where: { id: params.id }, include: { branch: { include: { brand: true } } } });
  if (!shift) return NextResponse.json({ error: "Shift not found" }, { status: 404 });
  const denied = await checkBranchAccess(user, shift.branchId);
  if (denied) return denied;
  if (shift.status !== "CLOSED") return NextResponse.json({ error: "Only a closed shift can be corrected" }, { status: 409 });

  const previousActualCash = shift.actualCash!.toNumber();
  const newVariance = Math.round((parsed.data.correctedActualCash - shift.expectedCash!.toNumber()) * 100) / 100;

  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.shift.update({
      where: { id: shift.id },
      data: {
        actualCash: parsed.data.correctedActualCash,
        variance: newVariance,
        varianceReason: `${shift.varianceReason ? shift.varianceReason + " | " : ""}Corrected by ${user.name}: ${parsed.data.reason}`,
      },
    });

    await writeAuditLog(tx, {
      tenantId: shift.branch.brand.tenantId,
      branchId: shift.branchId,
      userId: user.id,
      shiftId: shift.id,
      action: "shift.corrected",
      entityType: "Shift",
      entityId: shift.id,
      before: { actualCash: previousActualCash, variance: shift.variance?.toNumber() },
      after: { actualCash: parsed.data.correctedActualCash, variance: newVariance, reason: parsed.data.reason },
    });

    await writeOutboxEvent(tx, {
      branchId: shift.branchId,
      aggregateType: "Shift",
      aggregateId: shift.id,
      eventType: "shift.closed", // same projection, corrected values — LWW keeps this as the latest state
      payload: {
        status: u.status,
        openedAt: shift.openedAt.toISOString(),
        closedAt: shift.closedAt!.toISOString(),
        openingCash: u.openingCash.toNumber(),
        expectedCash: u.expectedCash!.toNumber(),
        actualCash: u.actualCash!.toNumber(),
        variance: u.variance!.toNumber(),
        varianceReason: u.varianceReason,
      },
    });

    return u;
  });

  return NextResponse.json({ shift: updated });
}
