import { NextResponse } from "next/server";
import { authenticate } from "@/lib/api-guard";
import { PERMISSIONS } from "@/lib/rbac";
import { freeAttendanceCode } from "@/lib/hr";

/** A 4-digit clock-in code no other employee of this tenant uses, for the manager to hand out. */
export async function GET() {
  const auth = await authenticate();
  if (auth.error) return auth.error;
  const perms = auth.user.permissions;
  if (!perms.includes(PERMISSIONS.STAFF_MANAGE) && !perms.includes(PERMISSIONS.HR_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ code: await freeAttendanceCode(auth.user.tenantId) });
}
