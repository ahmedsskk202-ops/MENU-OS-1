import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { writeAuditLog } from "@/lib/audit";
import { checkBrandAccess } from "@/lib/brand-access";
import { decodePromotion } from "@/lib/promotions";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.PROMOTIONS_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const original = await prisma.promotion.findUnique({ where: { id: params.id }, include: { brand: true } });
  if (!original) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const denied = await checkBrandAccess(user, original.brandId);
  if (denied) return denied;

  const duplicate = await prisma.$transaction(async (tx) => {
    const created = await tx.promotion.create({
      data: {
        // The JSON-encoded columns (eligibleProductIds, branchIds, daysOfWeek, …) are
        // copied through as raw text on purpose: reading the row and writing it straight
        // back is exactly a byte-for-byte copy, and re-encoding would only risk changing
        // the stored representation. They are decoded on the way out, below.
        brandId: original.brandId,
        name: `${original.name} (copy)`,
        type: original.type,
        config: original.config ?? undefined,
        status: "DRAFT", // duplicates start paused-off so they don't silently go live
        priority: original.priority,
        eligibleProductIds: original.eligibleProductIds,
        eligibleCategoryIds: original.eligibleCategoryIds,
        eligibleMinQuantity: original.eligibleMinQuantity,
        minOrderAmount: original.minOrderAmount ?? undefined,
        branchIds: original.branchIds,
        daysOfWeek: original.daysOfWeek,
        startTimeMinutes: original.startTimeMinutes,
        endTimeMinutes: original.endTimeMinutes,
        firstOrderOnly: original.firstOrderOnly,
        requiresCouponCode: false, // a duplicated coupon-code offer would collide on the code — admin sets a new one if needed
        benefitType: original.benefitType,
        benefitProductIds: original.benefitProductIds,
        benefitCategoryIds: original.benefitCategoryIds,
        benefitQuantity: original.benefitQuantity,
        benefitValue: original.benefitValue ?? undefined,
        maxDiscountAmount: original.maxDiscountAmount ?? undefined,
        allowMultiplePerOrder: original.allowMultiplePerOrder,
        startsAt: new Date(),
        endsAt: original.endsAt ?? undefined,
        maxUsesTotal: original.maxUsesTotal ?? undefined,
        maxUsesPerCustomer: original.maxUsesPerCustomer ?? undefined,
        isActive: false,
        createdById: user.id,
      },
    });
    await writeAuditLog(tx, {
      tenantId: original.brand.tenantId,
      userId: user.id,
      action: "promotion.duplicated",
      entityType: "Promotion",
      entityId: created.id,
      after: { duplicatedFrom: original.id, name: created.name },
    });
    return created;
  });

  return NextResponse.json({ promotion: decodePromotion(duplicate) }, { status: 201 });
}
