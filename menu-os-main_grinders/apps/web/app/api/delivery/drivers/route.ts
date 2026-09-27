import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { checkBranchAccess } from "@/lib/branch-access";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.DELIVERY_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const branchId = req.nextUrl.searchParams.get("branchId");
  if (!branchId) return NextResponse.json({ error: "branchId is required" }, { status: 400 });
  const denied = await checkBranchAccess(user, branchId);
  if (denied) return denied;

  const drivers = await prisma.driver.findMany({
    where: { branchId },
    orderBy: { name: "asc" },
    include: { deliveryOrders: { where: { status: { in: ["ASSIGNED", "OUT_FOR_DELIVERY"] } } } },
  });
  return NextResponse.json({ drivers });
}

const createSchema = z.object({ branchId: z.string(), name: z.string().min(1).max(100), phone: z.string().min(3).max(30) });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.DELIVERY_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const denied = await checkBranchAccess(user, parsed.data.branchId);
  if (denied) return denied;

  const driver = await prisma.driver.create({ data: parsed.data });
  return NextResponse.json({ driver }, { status: 201 });
}
