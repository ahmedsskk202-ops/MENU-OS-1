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
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const branchId = req.nextUrl.searchParams.get("branchId");
  if (!branchId) return NextResponse.json({ error: "branchId is required" }, { status: 400 });
  const denied = await checkBranchAccess(user, branchId);
  if (denied) return denied;

  const zones = await prisma.deliveryZone.findMany({ where: { branchId }, orderBy: { name: "asc" } });
  // Same Decimal-serializes-as-a-string footgun fixed in the public zones endpoint —
  // avoided here too so nothing that later does arithmetic on these client-side breaks.
  return NextResponse.json({
    zones: zones.map((z) => ({ ...z, feeAmount: z.feeAmount.toNumber(), minOrderAmount: z.minOrderAmount.toNumber() })),
  });
}

const createSchema = z.object({
  branchId: z.string(),
  name: z.string().min(1).max(100),
  feeAmount: z.number().min(0),
  minOrderAmount: z.number().min(0).default(0),
  estimatedMinutes: z.number().int().min(5).max(240).default(30),
});

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

  const zone = await prisma.deliveryZone.create({ data: parsed.data });
  return NextResponse.json({ zone }, { status: 201 });
}
