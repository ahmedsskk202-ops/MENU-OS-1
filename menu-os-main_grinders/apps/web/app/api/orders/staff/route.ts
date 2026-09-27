import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createOrder } from "@/lib/orders";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { checkBranchAccess } from "@/lib/branch-access";

// Staff-entered orders — phone-in pickup/delivery, or a walk-in with no table session.
// Reuses the exact same pricing/kitchen-routing/outbox path as guest self-service
// orders (lib/orders.ts createOrder); the only difference is who's placing it.
const bodySchema = z.object({
  branchId: z.string(),
  type: z.enum(["PICKUP", "DELIVERY", "DINE_IN"]),
  // Dine-in at the counter can name the table; the order joins that table's open session
  // (or opens one) so it shows on the floor and the table's bill like a QR order.
  tableId: z.string().optional(),
  clientRequestId: z.string().min(1).max(200).optional(),
  notes: z.string().max(500).optional(),
  lines: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().min(1).max(50),
        notes: z.string().max(300).optional(),
        modifierOptionIds: z.array(z.string()).default([]),
      })
    )
    .min(1),
  delivery: z
    .object({
      customerName: z.string().min(1).max(120),
      phone: z.string().min(3).max(30),
      address: z.string().min(1).max(300),
      zoneId: z.string().optional(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.ORDERS_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;
  const denied = await checkBranchAccess(user, data.branchId);
  if (denied) return denied;

  if (data.type === "DELIVERY" && !data.delivery) {
    return NextResponse.json({ error: "Delivery orders require customer name, phone and address" }, { status: 400 });
  }

  let tableSessionId: string | undefined;
  if (data.type === "DINE_IN" && data.tableId) {
    const table = await prisma.restaurantTable.findFirst({ where: { id: data.tableId, branchId: data.branchId } });
    if (!table) return NextResponse.json({ error: "Table not found" }, { status: 404 });
    const open = await prisma.tableSession.findFirst({ where: { tableId: table.id, status: "ACTIVE" }, orderBy: { openedAt: "desc" } });
    if (open) tableSessionId = open.id;
    else {
      const last = await prisma.tableSession.findFirst({ where: { tableId: table.id }, orderBy: { sessionNumber: "desc" } });
      const created = await prisma.tableSession.create({
        data: { tableId: table.id, sessionNumber: (last?.sessionNumber ?? 0) + 1, status: "ACTIVE", guestsCount: 1 },
      });
      await prisma.restaurantTable.update({ where: { id: table.id }, data: { status: "OCCUPIED" } });
      tableSessionId = created.id;
    }
  }

  let deliveryFee = 0;
  if (data.type === "DELIVERY" && data.delivery?.zoneId) {
    const zone = await prisma.deliveryZone.findUnique({ where: { id: data.delivery.zoneId } });
    if (zone) deliveryFee = zone.feeAmount.toNumber();
  }

  try {
    const order = await createOrder({
      branchId: data.branchId,
      tableSessionId,
      type: data.type,
      lines: data.lines,
      notes: data.notes,
      clientRequestId: data.clientRequestId,
      createdByUserId: user.id,
      delivery: data.type === "DELIVERY" && data.delivery ? { ...data.delivery, deliveryFee } : undefined,
    });
    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not create order" }, { status: 400 });
  }
}
