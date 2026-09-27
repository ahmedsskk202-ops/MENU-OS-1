import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PERMISSIONS } from "@/lib/rbac";
import { hrAccess, punch } from "@/lib/hr";

// The attendance tablet: an employee types their code, and is clocked in or out.
const schema = z.object({ branchId: z.string(), code: z.string().trim().regex(/^\d{3,8}$/) });

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "unknown_code" }, { status: 400 });
  const access = await hrAccess([PERMISSIONS.ATTENDANCE_KIOSK, PERMISSIONS.HR_MANAGE], parsed.data.branchId);
  if ("error" in access) return access.error;
  const result = await punch(access.user.tenantId, access.branch.id, parsed.data.code);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 404 });
  return NextResponse.json({
    name: result.employee.name,
    action: result.action,
    at: result.at,
    hours: "hours" in result ? result.hours : null,
    repeated: "repeated" in result ? true : false,
  });
}
