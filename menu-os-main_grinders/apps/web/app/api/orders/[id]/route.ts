import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyCustomerSession, CUSTOMER_SESSION_COOKIE } from "@/lib/customer-session";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { checkBranchAccess } from "@/lib/branch-access";
import { STAFF_PAYMENT_SELECT } from "@/lib/payments/service";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: { include: { modifiers: true } },
      statusEvents: { orderBy: { changedAt: "asc" } },
      payments: { select: STAFF_PAYMENT_SELECT },
      discounts: true,
      kitchenOrders: { include: { station: true, items: true } },
    },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const customerClaims = verifyCustomerSession(req.cookies.get(CUSTOMER_SESSION_COOKIE)?.value);
  const isOwner = customerClaims?.tableSessionId === order.tableSessionId;
  if (!isOwner) {
    // Not the guest who placed it — this must be staff with real view rights on the
    // order's own branch, not merely "logged in as someone, somewhere" (the previous
    // check here accepted any staff session at all, from any branch or tenant).
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;
    if (!user || !user.permissions.includes(PERMISSIONS.ORDERS_VIEW)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const denied = await checkBranchAccess(user, order.branchId);
    if (denied) return denied;
  }

  return NextResponse.json({ order });
}
