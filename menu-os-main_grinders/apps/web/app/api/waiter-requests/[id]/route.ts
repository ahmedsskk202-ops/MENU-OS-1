import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { emitToBranch } from "@/lib/realtime";
import { writeOutboxEvent } from "@/lib/outbox";
import { checkBranchAccess } from "@/lib/branch-access";

const bodySchema = z.object({ status: z.enum(["ASSIGNED", "COMPLETED"]) });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.WAITER_REQUESTS_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const existing = await prisma.waiterRequest.findUnique({
    where: { id: params.id },
    include: { tableSession: { include: { table: true } } },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const branchId = existing.tableSession.table.branchId;
  const denied = await checkBranchAccess(user, branchId);
  if (denied) return denied;

  const now = new Date();
  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.waiterRequest.update({
      where: { id: params.id },
      data: {
        status: parsed.data.status,
        assignedToId: parsed.data.status === "ASSIGNED" ? user.id : existing.assignedToId,
        assignedAt: parsed.data.status === "ASSIGNED" ? now : existing.assignedAt,
        completedAt: parsed.data.status === "COMPLETED" ? now : existing.completedAt,
      },
    });
    await writeOutboxEvent(tx, {
      branchId,
      aggregateType: "WaiterRequest",
      aggregateId: u.id,
      eventType: "waiter_request.updated",
      payload: {
        type: u.type,
        status: u.status,
        createdAt: u.createdAt.toISOString(),
        completedAt: u.completedAt?.toISOString() ?? null,
      },
    });
    return u;
  });

  emitToBranch(existing.tableSession.table.branchId, {
    type: "waiter_request.updated",
    branchId: existing.tableSession.table.branchId,
    request: updated,
  });

  return NextResponse.json({ request: updated });
}
