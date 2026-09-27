import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { emitToBranch } from "@/lib/realtime";
import { findConflictingReservation } from "@/lib/reservations";
import { writeAuditLog } from "@/lib/audit";
import { writeOutboxEvent } from "@/lib/outbox";
import { checkBranchAccess } from "@/lib/branch-access";

const patchSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "SEATED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
  tableId: z.string().nullable().optional(),
  reservedFor: z.string().min(1).optional(),
  durationMinutes: z.number().int().min(15).max(480).optional(),
  partySize: z.number().int().min(1).max(100).optional(),
  cancelReason: z.string().max(300).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.RESERVATIONS_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;

  const existing = await prisma.reservation.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const denied = await checkBranchAccess(user, existing.branchId);
  if (denied) return denied;

  const nextTableId = data.tableId === undefined ? existing.tableId : data.tableId;
  const nextReservedFor = data.reservedFor ? new Date(data.reservedFor) : existing.reservedFor;
  const nextDuration = data.durationMinutes ?? existing.durationMinutes;

  const result = await prisma.$transaction(async (tx) => {
    if (nextTableId && (data.tableId !== undefined || data.reservedFor || data.durationMinutes)) {
      const conflict = await findConflictingReservation(tx, {
        tableId: nextTableId,
        reservedFor: nextReservedFor,
        durationMinutes: nextDuration,
        excludeReservationId: existing.id,
      });
      if (conflict) return { conflict };
    }

    const now = new Date();
    const reservation = await tx.reservation.update({
      where: { id: params.id },
      data: {
        status: data.status,
        tableId: data.tableId === undefined ? undefined : data.tableId,
        reservedFor: data.reservedFor ? nextReservedFor : undefined,
        durationMinutes: data.durationMinutes,
        partySize: data.partySize,
        cancelReason: data.cancelReason,
        confirmedAt: data.status === "CONFIRMED" ? now : undefined,
        seatedAt: data.status === "SEATED" ? now : undefined,
        cancelledAt: data.status === "CANCELLED" || data.status === "NO_SHOW" ? now : undefined,
      },
    });

    await writeAuditLog(tx, {
      tenantId: user.tenantId,
      branchId: existing.branchId,
      userId: user.id,
      action: "reservation.updated",
      entityType: "Reservation",
      entityId: reservation.id,
      before: { status: existing.status, tableId: existing.tableId },
      after: { status: reservation.status, tableId: reservation.tableId },
    });

    await writeOutboxEvent(tx, {
      branchId: existing.branchId,
      aggregateType: "Reservation",
      aggregateId: reservation.id,
      eventType: "reservation.updated",
      payload: {
        tableId: reservation.tableId,
        guestName: reservation.guestName,
        guestPhone: reservation.guestPhone,
        partySize: reservation.partySize,
        reservedFor: reservation.reservedFor.toISOString(),
        durationMinutes: reservation.durationMinutes,
        status: reservation.status,
      },
    });

    return { reservation };
  });

  if ("conflict" in result) {
    return NextResponse.json({ error: "This table already has a reservation that overlaps this time" }, { status: 409 });
  }

  emitToBranch(existing.branchId, { type: "reservation.updated", branchId: existing.branchId, reservation: result.reservation });

  return NextResponse.json({ reservation: result.reservation });
}
