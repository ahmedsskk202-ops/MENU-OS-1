import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { writeOutboxEvent } from "@/lib/outbox";
import { writeAuditLog } from "@/lib/audit";
import { emitToBranch } from "@/lib/realtime";
import { checkBranchAccess } from "@/lib/branch-access";

const createSchema = z.object({
  branchId: z.string(),
  category: z.string().min(1).max(60),
  amount: z.number().positive(),
  description: z.string().max(500).optional(),
  shiftId: z.string().optional(),
  // The day it was spent, when recorded afterwards (YYYY-MM-DD). Defaults to now.
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.EXPENSES_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const denied = await checkBranchAccess(user, parsed.data.branchId);
  if (denied) return denied;

  const branch = await prisma.branch.findUniqueOrThrow({ where: { id: parsed.data.branchId }, include: { brand: true } });

  const expense = await prisma.$transaction(async (tx) => {
    const created = await tx.expense.create({
      data: {
        branchId: parsed.data.branchId,
        shiftId: parsed.data.shiftId,
        category: parsed.data.category,
        amount: parsed.data.amount,
        description: parsed.data.description,
        recordedById: user.id,
        ...(parsed.data.date && parsed.data.date !== new Date().toISOString().slice(0, 10) ? { createdAt: new Date(`${parsed.data.date}T12:00:00+03:00`) } : {}),
      },
    });

    await writeOutboxEvent(tx, {
      branchId: parsed.data.branchId,
      aggregateType: "Expense",
      aggregateId: created.id,
      eventType: "expense.recorded",
      payload: { shiftId: created.shiftId, category: created.category, amount: created.amount.toNumber() },
    });

    await writeAuditLog(tx, {
      tenantId: branch.brand.tenantId,
      branchId: parsed.data.branchId,
      userId: user.id,
      shiftId: parsed.data.shiftId,
      action: "expense.recorded",
      entityType: "Expense",
      entityId: created.id,
      after: { category: created.category, amount: created.amount.toNumber(), description: created.description },
    });

    return created;
  });

  emitToBranch(parsed.data.branchId, { type: "expense.recorded", branchId: parsed.data.branchId, expense });

  return NextResponse.json({ expense }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.EXPENSES_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const branchId = req.nextUrl.searchParams.get("branchId");
  if (!branchId) return NextResponse.json({ error: "branchId is required" }, { status: 400 });
  const denied = await checkBranchAccess(user, branchId);
  if (denied) return denied;
  const from = req.nextUrl.searchParams.get("from");
  const to = req.nextUrl.searchParams.get("to");

  const expenses = await prisma.expense.findMany({
    where: {
      branchId,
      ...(from || to ? { createdAt: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) } } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { recordedBy: true },
    take: 1000,
  });

  return NextResponse.json({ expenses });
}
