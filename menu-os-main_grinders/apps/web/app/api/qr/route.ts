import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { checkBranchAccess } from "@/lib/branch-access";
import { qrOrigin } from "@/lib/server-origin";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.permissions.includes(PERMISSIONS.QR_MANAGE)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const branchId = req.nextUrl.searchParams.get("branchId");
  if (!branchId) return NextResponse.json({ error: "branchId is required" }, { status: 400 });
  const denied = await checkBranchAccess(user, branchId);
  if (denied) return denied;

  const [qrCodes, tables] = await Promise.all([
    prisma.qRCode.findMany({ where: { branchId }, include: { table: true }, orderBy: { createdAt: "desc" } }),
    prisma.restaurantTable.findMany({ where: { branchId }, select: { id: true, label: true } }),
  ]);
  const withCode = new Set(qrCodes.filter((q) => q.isActive && q.tableId).map((q) => q.tableId));
  // Tables a guest cannot scan into — added before QR codes were created with the table,
  // or whose code was switched off.
  const missingTables = tables.filter((t) => !withCode.has(t.id));

  return NextResponse.json({ qrCodes, missingTables, baseUrl: qrOrigin(req.headers) });
}

const createSchema = z.object({
  branchId: z.string(),
  type: z.enum(["TABLE", "MENU", "PICKUP", "MARKETING"]),
  label: z.string().trim().min(1).max(60),
  tableId: z.string().optional(),
  // A table that already has a working code only gets a new one on purpose: the old
  // sticker is switched off at the same moment, so there is never a second live code
  // for the same table that nobody knows is out there.
  replace: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.QR_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { branchId, type, label, tableId, replace } = parsed.data;
  if (type === "TABLE" && !tableId) {
    return NextResponse.json({ error: "tableId is required for TABLE QR codes" }, { status: 400 });
  }
  const denied = await checkBranchAccess(user, branchId);
  if (denied) return denied;

  if (type === "TABLE") {
    // The table must be one of this branch's, or a code printed for branch A would seat
    // guests at a table of branch B.
    const table = await prisma.restaurantTable.findUnique({ where: { id: tableId! } });
    if (!table || table.branchId !== branchId) return NextResponse.json({ error: "unknown_table" }, { status: 400 });
    const live = await prisma.qRCode.count({ where: { tableId: table.id, isActive: true } });
    if (live > 0 && !replace) return NextResponse.json({ error: "table_has_code", label: table.label }, { status: 409 });
  }

  const qr = await prisma.$transaction(async (tx) => {
    if (type === "TABLE" && replace) {
      await tx.qRCode.updateMany({ where: { tableId: tableId!, isActive: true }, data: { isActive: false } });
    }
    return tx.qRCode.create({
      data: {
        branchId,
        type,
        label,
        tableId: type === "TABLE" ? tableId : null,
        token: randomBytes(16).toString("hex"),
      },
    });
  });

  return NextResponse.json({ qrCode: qr }, { status: 201 });
}
