import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { checkDelayedOrders } from "@/lib/delayed-orders";

// Same check the background interval (instrumentation.ts) runs every 60s, exposed so
// staff can trigger it on demand and so it's testable without waiting on the timer.
export async function POST() {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.ORDERS_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const flagged = await checkDelayedOrders();
  return NextResponse.json({ flagged });
}
