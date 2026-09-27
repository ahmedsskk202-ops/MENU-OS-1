import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { checkBranchAccess } from "@/lib/branch-access";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.DELIVERY_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const branchId = req.nextUrl.searchParams.get("branchId");
  if (!branchId) return NextResponse.json({ error: "branchId is required" }, { status: 400 });
  const denied = await checkBranchAccess(user, branchId);
  if (denied) return denied;

  const deliveryOrders = await prisma.deliveryOrder.findMany({
    where: { order: { branchId } },
    orderBy: { order: { createdAt: "desc" } },
    include: { order: { select: { id: true, status: true, total: true, currency: true, createdAt: true } }, driver: true, zone: true },
    take: 100,
  });
  return NextResponse.json({ deliveryOrders });
}
