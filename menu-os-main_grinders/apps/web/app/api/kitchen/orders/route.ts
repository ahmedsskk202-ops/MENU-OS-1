import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { checkBranchAccess } from "@/lib/branch-access";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.KITCHEN_VIEW)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const branchId = req.nextUrl.searchParams.get("branchId");
  if (!branchId) return NextResponse.json({ error: "branchId is required" }, { status: 400 });
  const denied = await checkBranchAccess(user, branchId);
  if (denied) return denied;

  const kitchenOrders = await prisma.kitchenOrder.findMany({
    where: { station: { branchId }, status: { in: ["NEW", "PREPARING", "READY"] } },
    orderBy: { createdAt: "asc" },
    include: {
      station: true,
      order: { include: { tableSession: { include: { table: true } } } },
      items: { include: { orderItem: { include: { modifiers: true } } } },
    },
  });

  return NextResponse.json({ kitchenOrders });
}
