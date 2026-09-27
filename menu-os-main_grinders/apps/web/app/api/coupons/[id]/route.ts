import { decodeCoupon } from "@/lib/discounts";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { writeAuditLog } from "@/lib/audit";
import { checkBrandAccess } from "@/lib/brand-access";

const bodySchema = z.object({ isActive: z.boolean() });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.PROMOTIONS_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const existing = await prisma.coupon.findUnique({ where: { id: params.id }, include: { brand: true } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const denied = await checkBrandAccess(user, existing.brandId);
  if (denied) return denied;

  const coupon = await prisma.$transaction(async (tx) => {
    const updated = await tx.coupon.update({ where: { id: params.id }, data: { isActive: parsed.data.isActive } });
    await writeAuditLog(tx, {
      tenantId: existing.brand.tenantId,
      userId: user.id,
      action: parsed.data.isActive ? "coupon.activated" : "coupon.cancelled",
      entityType: "Coupon",
      entityId: updated.id,
      before: { isActive: existing.isActive },
      after: { isActive: updated.isActive },
    });
    return updated;
  });

  return NextResponse.json({ coupon: decodeCoupon(coupon) });
}
