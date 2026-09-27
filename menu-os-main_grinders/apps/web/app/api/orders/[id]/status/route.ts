import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { updateOrderStatus } from "@/lib/orders";
import { prisma } from "@/lib/db";
import { checkBranchAccess } from "@/lib/branch-access";

const bodySchema = z.object({ status: z.string(), note: z.string().max(500).optional() });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.ORDERS_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const existing = await prisma.order.findUnique({ where: { id: params.id }, select: { branchId: true } });
  if (!existing) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  const denied = await checkBranchAccess(user, existing.branchId);
  if (denied) return denied;

  try {
    const order = await updateOrderStatus(params.id, parsed.data.status, user.id, parsed.data.note);
    return NextResponse.json({ order });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not update order" }, { status: 422 });
  }
}
