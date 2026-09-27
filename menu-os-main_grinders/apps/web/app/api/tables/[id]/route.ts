import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { emitToBranch, emitToTableSession } from "@/lib/realtime";
import { checkBranchAccess } from "@/lib/branch-access";

const bodySchema = z.object({ status: z.enum(["AVAILABLE", "OCCUPIED", "ORDERING", "WAITING", "RESERVED", "CLEANING"]) });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.TABLES_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const existing = await prisma.restaurantTable.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const denied = await checkBranchAccess(user, existing.branchId);
  if (denied) return denied;

  const table = await prisma.restaurantTable.update({ where: { id: params.id }, data: { status: parsed.data.status } });

  if (parsed.data.status === "AVAILABLE") {
    // Freeing the table up closes any lingering active session.
    const closingSessions = await prisma.tableSession.findMany({ where: { tableId: table.id, status: "ACTIVE" }, select: { id: true } });
    await prisma.tableSession.updateMany({
      where: { tableId: table.id, status: "ACTIVE" },
      data: { status: "CLOSED", closedAt: new Date() },
    });
    // Push proactively so a guest still browsing finds out immediately, instead of only
    // on their next fetch/order attempt (which already 410s correctly, but silently).
    for (const s of closingSessions) emitToTableSession(s.id, { type: "table_session.closed", tableSessionId: s.id });
  }

  emitToBranch(table.branchId, { type: "table.status_changed", branchId: table.branchId, tableId: table.id, status: table.status });

  return NextResponse.json({ table });
}
