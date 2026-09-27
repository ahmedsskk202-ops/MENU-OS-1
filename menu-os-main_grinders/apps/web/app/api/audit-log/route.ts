import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { checkBranchAccess, getAccessibleBranchIds } from "@/lib/branch-access";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.AUDIT_LOG_VIEW)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const branchId = req.nextUrl.searchParams.get("branchId");
  const entityType = req.nextUrl.searchParams.get("entityType") || undefined;
  const action = req.nextUrl.searchParams.get("action") || undefined;

  if (branchId) {
    const denied = await checkBranchAccess(user, branchId);
    if (denied) return denied;
  }
  // A tenant-wide role with no explicit branchId keeps seeing everything, including
  // tenant-level entries with no branchId at all — unchanged from before. A
  // branch-scoped role is now actually restricted to the branches their role grants,
  // instead of seeing every branch's logs the moment they omit the filter.
  const isTenantWide = user.branchIds.length === 0;
  const branchFilter = branchId ? branchId : isTenantWide ? undefined : { in: await getAccessibleBranchIds(user) };

  const logs = await prisma.auditLog.findMany({
    where: {
      tenantId: user.tenantId,
      branchId: branchFilter,
      entityType,
      action: action ? { contains: action } : undefined,
    },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ logs });
}
