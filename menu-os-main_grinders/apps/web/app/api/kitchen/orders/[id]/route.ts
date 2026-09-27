import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { updateKitchenOrderStatus } from "@/lib/kitchen";
import { prisma } from "@/lib/db";
import { checkBranchAccess } from "@/lib/branch-access";

const bodySchema = z.object({ status: z.enum(["PREPARING", "READY", "COMPLETED"]) });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.KITCHEN_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const existing = await prisma.kitchenOrder.findUnique({ where: { id: params.id }, include: { order: { select: { branchId: true } } } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const denied = await checkBranchAccess(user, existing.order.branchId);
  if (denied) return denied;

  try {
    const kitchenOrder = await updateKitchenOrderStatus(params.id, parsed.data.status);
    return NextResponse.json({ kitchenOrder });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not update ticket" }, { status: 422 });
  }
}
