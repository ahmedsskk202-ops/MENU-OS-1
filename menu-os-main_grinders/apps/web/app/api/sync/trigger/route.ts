import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { runSyncCycle } from "@/lib/sync-engine";

// Manual "Sync now" — also what the offline-sync test harness uses to drain the
// outbox deterministically instead of waiting on the 5s interval.
export async function POST() {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.DASHBOARD_VIEW)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Drain fully rather than a single batch, so "Sync now" actually means "now caught up".
  // If the automatic 5-second cycle is mid-flight, wait for it instead of stopping: that
  // "attempted 0" used to end the loop at once, so "Sync now" could report success
  // having synced nothing.
  const results = [];
  const deadline = Date.now() + 15_000;
  for (let i = 0; i < 20 && Date.now() < deadline; ) {
    const result = await runSyncCycle();
    if (result.reason === "cycle already running") {
      await new Promise((r) => setTimeout(r, 150));
      continue;
    }
    results.push(result);
    i++;
    if (result.attempted === 0 || result.synced === 0) break;
  }
  return NextResponse.json({ cycles: results });
}
