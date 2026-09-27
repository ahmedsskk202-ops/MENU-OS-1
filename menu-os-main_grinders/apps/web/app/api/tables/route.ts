import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { checkBranchAccess } from "@/lib/branch-access";
import { emitToBranch } from "@/lib/realtime";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const branchId = req.nextUrl.searchParams.get("branchId");
  if (!branchId) return NextResponse.json({ error: "branchId is required" }, { status: 400 });
  const denied = await checkBranchAccess(user, branchId);
  if (denied) return denied;

  const tables = await prisma.restaurantTable.findMany({
    where: { branchId },
    orderBy: { label: "asc" },
    include: {
      zone: true,
      sessions: {
        where: { status: "ACTIVE" },
        include: { orders: { where: { status: { notIn: ["CLOSED", "CANCELLED"] } } }, participants: true },
      },
    },
  });

  return NextResponse.json({ tables });
}

const createSchema = z.object({
  branchId: z.string(),
  label: z.string().trim().min(1).max(20),
  capacity: z.number().int().min(1).max(50).default(4),
  zoneId: z.string().optional(),
});

// Adding a table is a floor-plan change, not a shift task: it needs tables.manage AND
// qr.manage, because the table is useless to guests without the QR code created with it.
// tables.manage alone is held by waiters (they flip a table to "cleaning"), and a waiter
// must not be able to add tables to the floor plan.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.TABLES_MANAGE) || !user.permissions.includes(PERMISSIONS.QR_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "A table number is required" }, { status: 400 });
  const denied = await checkBranchAccess(user, parsed.data.branchId);
  if (denied) return denied;

  const existing = await prisma.restaurantTable.findUnique({
    where: { branchId_label: { branchId: parsed.data.branchId, label: parsed.data.label } },
  });
  if (existing) return NextResponse.json({ error: "duplicate", label: parsed.data.label }, { status: 409 });

  // The table and its QR are created together, so a new table is immediately scannable.
  const { table, qrCode } = await prisma.$transaction(async (tx) => {
    const table = await tx.restaurantTable.create({ data: parsed.data });
    const qrCode = await tx.qRCode.create({
      data: {
        branchId: parsed.data.branchId,
        type: "TABLE",
        tableId: table.id,
        label: `Table ${table.label}`,
        token: randomBytes(16).toString("hex"),
      },
    });
    return { table, qrCode };
  });

  emitToBranch(parsed.data.branchId, { type: "table.status_changed", branchId: parsed.data.branchId, tableId: table.id, status: table.status });
  return NextResponse.json({ table, qrCode }, { status: 201 });
}
