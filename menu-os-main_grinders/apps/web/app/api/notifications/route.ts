import { NextRequest, NextResponse } from "next/server";
import { readJson } from "@menu-os/db";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { checkBranchAccess, getAccessibleBranchIds } from "@/lib/branch-access";
import { visibleNotificationTypes } from "@/lib/notification-audience";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const branchId = req.nextUrl.searchParams.get("branchId");
  if (branchId) {
    const denied = await checkBranchAccess(user, branchId);
    if (denied) return denied;
  }
  const isTenantWide = user.branchIds.length === 0;
  const branchFilter = branchId ? branchId : isTenantWide ? undefined : { in: await getAccessibleBranchIds(user) };

  const notifications = await prisma.notification.findMany({
    where: {
      tenantId: user.tenantId,
      // Branch-wide alerts only of the kinds this user acts on (see notification-audience);
      // anything addressed to the user personally is always theirs.
      OR: [{ branchId: branchFilter, userId: null, type: { in: visibleNotificationTypes(user.permissions) } }, { userId: user.id }],
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // `data` is JSON text since the move to SQLite. The bell has always received an
  // object (that is how the ORDER_READY / WAITER_REQUEST toasts link to a table), so
  // decode here rather than making every consumer parse a string.
  return NextResponse.json({
    notifications: notifications.map((n) => ({ ...n, data: readJson(n.data) })),
    unreadCount: notifications.filter((n) => !n.isRead).length,
  });
}
