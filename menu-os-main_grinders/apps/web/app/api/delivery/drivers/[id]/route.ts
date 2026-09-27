import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { checkBranchAccess } from "@/lib/branch-access";

const patchSchema = z.object({ status: z.enum(["OFFLINE", "ONLINE"]).optional(), name: z.string().min(1).max(100).optional(), phone: z.string().min(3).max(30).optional() });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.DELIVERY_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const existing = await prisma.driver.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const denied = await checkBranchAccess(user, existing.branchId);
  if (denied) return denied;

  const driver = await prisma.driver.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json({ driver });
}
