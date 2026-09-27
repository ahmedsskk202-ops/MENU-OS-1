import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { checkBranchAccess } from "@/lib/branch-access";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.DASHBOARD_VIEW)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const branchId = req.nextUrl.searchParams.get("branchId");
  if (!branchId) return NextResponse.json({ error: "branchId is required" }, { status: 400 });
  const denied = await checkBranchAccess(user, branchId);
  if (denied) return denied;

  const [pending, syncing, failed, synced, lastSynced] = await Promise.all([
    prisma.outboxEvent.count({ where: { branchId, syncStatus: "PENDING" } }),
    prisma.outboxEvent.count({ where: { branchId, syncStatus: "SYNCING" } }),
    prisma.outboxEvent.count({ where: { branchId, syncStatus: "FAILED" } }),
    prisma.outboxEvent.count({ where: { branchId, syncStatus: "SYNCED" } }),
    prisma.outboxEvent.findFirst({ where: { branchId, syncStatus: "SYNCED" }, orderBy: { syncedAt: "desc" } }),
  ]);

  const cloudConfigured = Boolean(process.env.CLOUD_SYNC_URL);

  return NextResponse.json({
    cloudConfigured,
    pending,
    syncing,
    failed,
    synced,
    lastSyncedAt: lastSynced?.syncedAt ?? null,
    status: !cloudConfigured ? "LOCAL_ONLY" : pending + syncing + failed === 0 ? "UP_TO_DATE" : failed > 0 ? "RETRYING" : "SYNCING",
  });
}
