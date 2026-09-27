import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyCustomerSession, CUSTOMER_SESSION_COOKIE } from "@/lib/customer-session";
import { emitToBranch } from "@/lib/realtime";
import { writeOutboxEvent } from "@/lib/outbox";
import { notify } from "@/lib/notifications";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { checkBranchAccess } from "@/lib/branch-access";

const bodySchema = z.object({
  type: z.enum(["ASSISTANCE", "WATER", "ORDER", "BILL", "QUESTION", "OTHER"]),
  note: z.string().max(300).optional(),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const claims = verifyCustomerSession(req.cookies.get(CUSTOMER_SESSION_COOKIE)?.value);
  if (!claims) return NextResponse.json({ error: "No active table session" }, { status: 401 });

  const table = await prisma.restaurantTable.findUniqueOrThrow({ where: { id: claims.tableId }, include: { branch: { include: { brand: true } } } });

  const request_ = await prisma.$transaction(async (tx) => {
    const created = await tx.waiterRequest.create({
      data: { tableSessionId: claims.tableSessionId, type: parsed.data.type, note: parsed.data.note },
    });
    await writeOutboxEvent(tx, {
      branchId: claims.branchId,
      aggregateType: "WaiterRequest",
      aggregateId: created.id,
      eventType: "waiter_request.created",
      payload: { type: created.type, status: created.status, createdAt: created.createdAt.toISOString() },
    });
    await notify(tx, {
      tenantId: table.branch.brand.tenantId,
      branchId: claims.branchId,
      type: "WAITER_REQUEST",
      // "Table 12 is calling a waiter" is the sentence the guest's own button implies,
      // and the table number leads it because the whole point of the alert is that a
      // waiter now has to walk somewhere specific. "Needs a waiter" reads like a
      // system complaint about staffing; this reads like the table talking.
      title: `Table ${table.label} is calling a waiter`,
      body: parsed.data.note ?? parsed.data.type,
      data: { waiterRequestId: created.id, tableSessionId: claims.tableSessionId, tableLabel: table.label },
    });
    return created;
  });

  emitToBranch(claims.branchId, { type: "waiter_request.created", branchId: claims.branchId, request: request_ });

  return NextResponse.json({ request: request_ }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const branchId = req.nextUrl.searchParams.get("branchId");
  if (!branchId) return NextResponse.json({ error: "branchId is required" }, { status: 400 });
  const denied = await checkBranchAccess(user, branchId);
  if (denied) return denied;

  const requests = await prisma.waiterRequest.findMany({
    where: { tableSession: { table: { branchId } }, status: { not: "COMPLETED" } },
    orderBy: { createdAt: "asc" },
    include: { tableSession: { include: { table: true } }, assignedTo: true },
  });

  return NextResponse.json({ requests });
}
