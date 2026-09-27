import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { writeOutboxEvent } from "@/lib/outbox";
import { emitToBranch } from "@/lib/realtime";
import { checkBranchAccess } from "@/lib/branch-access";

const createSchema = z.object({ branchId: z.string(), openingCash: z.number().nonnegative() });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.SHIFTS_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const denied = await checkBranchAccess(user, parsed.data.branchId);
  if (denied) return denied;

  const existingOpen = await prisma.shift.findFirst({ where: { branchId: parsed.data.branchId, status: "OPEN" } });
  if (existingOpen) return NextResponse.json({ error: "A shift is already open for this branch" }, { status: 409 });

  const shift = await prisma.$transaction(async (tx) => {
    const created = await tx.shift.create({
      data: { branchId: parsed.data.branchId, openedById: user.id, openingCash: parsed.data.openingCash },
    });
    await writeOutboxEvent(tx, {
      branchId: parsed.data.branchId,
      aggregateType: "Shift",
      aggregateId: created.id,
      eventType: "shift.opened",
      payload: { status: created.status, openedAt: created.openedAt.toISOString(), openingCash: created.openingCash.toNumber() },
      occurredAt: created.openedAt,
    });
    return created;
  });

  emitToBranch(parsed.data.branchId, { type: "shift.updated", branchId: parsed.data.branchId, shift });

  return NextResponse.json({ shift }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.SHIFTS_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const branchId = req.nextUrl.searchParams.get("branchId");
  if (!branchId) return NextResponse.json({ error: "branchId is required" }, { status: 400 });
  const denied = await checkBranchAccess(user, branchId);
  if (denied) return denied;

  const shifts = await prisma.shift.findMany({
    where: { branchId },
    orderBy: { openedAt: "desc" },
    take: 50,
    include: { openedBy: true, closedBy: true },
  });

  return NextResponse.json({ shifts });
}
