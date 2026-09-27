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

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.RESERVATIONS_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const branchId = req.nextUrl.searchParams.get("branchId");
  if (!branchId) return NextResponse.json({ error: "branchId is required" }, { status: 400 });
  const denied = await checkBranchAccess(user, branchId);
  if (denied) return denied;
  const from = req.nextUrl.searchParams.get("from");
  const to = req.nextUrl.searchParams.get("to");

  const reservations = await prisma.reservation.findMany({
    where: {
      branchId,
      reservedFor: from || to ? { gte: from ? new Date(from) : undefined, lte: to ? new Date(to) : undefined } : undefined,
    },
    orderBy: { reservedFor: "asc" },
    include: { table: true },
  });

  return NextResponse.json({ reservations });
}

const createSchema = z.object({
  branchId: z.string(),
  tableId: z.string().optional(),
  guestName: z.string().min(1).max(120),
  guestPhone: z.string().min(3).max(30),
  partySize: z.number().int().min(1).max(100),
  reservedFor: z.string().datetime().or(z.string().min(1)),
  durationMinutes: z.number().int().min(15).max(480).default(90),
  notes: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.RESERVATIONS_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;
  const denied = await checkBranchAccess(user, data.branchId);
  if (denied) return denied;
  const reservedFor = new Date(data.reservedFor);
  if (Number.isNaN(reservedFor.getTime())) return NextResponse.json({ error: "Invalid reservedFor" }, { status: 400 });

  const result = await prisma.$transaction(async (tx) => {
    if (data.tableId) {
      const conflict = await findConflictingReservation(tx, { tableId: data.tableId, reservedFor, durationMinutes: data.durationMinutes });
      if (conflict) return { conflict };
    }

    const reservation = await tx.reservation.create({
      data: {
        branchId: data.branchId,
        tableId: data.tableId,
        guestName: data.guestName,
        guestPhone: data.guestPhone,
        partySize: data.partySize,
        reservedFor,
        durationMinutes: data.durationMinutes,
        notes: data.notes,
      },
    });

    await writeAuditLog(tx, {
      tenantId: user.tenantId,
      branchId: data.branchId,
      userId: user.id,
      action: "reservation.created",
      entityType: "Reservation",
      entityId: reservation.id,
      after: { guestName: reservation.guestName, reservedFor: reservation.reservedFor, partySize: reservation.partySize },
    });

    await writeOutboxEvent(tx, {
      branchId: data.branchId,
      aggregateType: "Reservation",
      aggregateId: reservation.id,
      eventType: "reservation.created",
      payload: {
        tableId: reservation.tableId,
        guestName: reservation.guestName,
        guestPhone: reservation.guestPhone,
        partySize: reservation.partySize,
        reservedFor: reservation.reservedFor.toISOString(),
        durationMinutes: reservation.durationMinutes,
        status: reservation.status,
      },
      occurredAt: reservation.createdAt,
    });

    return { reservation };
  });

  if ("conflict" in result) {
    return NextResponse.json({ error: "This table already has a reservation that overlaps this time" }, { status: 409 });
  }

  emitToBranch(data.branchId, { type: "reservation.created", branchId: data.branchId, reservation: result.reservation });

  return NextResponse.json({ reservation: result.reservation }, { status: 201 });
}
