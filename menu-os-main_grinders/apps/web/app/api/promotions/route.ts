import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { intArray, strArray } from "@menu-os/db";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { writeAuditLog } from "@/lib/audit";
import { checkBrandAccess } from "@/lib/brand-access";
import { matchesBranchScope, matchesSearch } from "@/lib/promo-scheduling";
import { decodePromotion } from "@/lib/promotions";

const createSchema = z.object({
  brandId: z.string(),
  name: z.string().min(2).max(80),
  priority: z.number().int().default(0),
  eligibleProductIds: z.array(z.string()).default([]),
  eligibleCategoryIds: z.array(z.string()).default([]),
  eligibleMinQuantity: z.number().int().min(1).default(1),
  minOrderAmount: z.number().nonnegative().optional(),
  branchIds: z.array(z.string()).default([]),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).default([]),
  startTimeMinutes: z.number().int().min(0).max(1439).optional(),
  endTimeMinutes: z.number().int().min(0).max(1439).optional(),
  firstOrderOnly: z.boolean().default(false),
  requiresCouponCode: z.boolean().default(false),
  couponCode: z.string().min(2).max(40).optional(), // required if requiresCouponCode
  benefitType: z.enum(["PERCENTAGE_OFF", "FIXED_OFF", "FREE_ITEM", "DISCOUNTED_ITEM"]),
  benefitProductIds: z.array(z.string()).default([]),
  benefitCategoryIds: z.array(z.string()).default([]),
  benefitQuantity: z.number().int().min(1).default(1),
  benefitValue: z.number().nonnegative().optional(),
  maxDiscountAmount: z.number().positive().optional(),
  allowMultiplePerOrder: z.boolean().default(true),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  maxUsesTotal: z.number().int().positive().optional(),
  maxUsesPerCustomer: z.number().int().positive().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.PROMOTIONS_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const d = parsed.data;
  const denied = await checkBrandAccess(user, d.brandId);
  if (denied) return denied;

  if ((d.benefitType === "PERCENTAGE_OFF" || d.benefitType === "FIXED_OFF" || d.benefitType === "DISCOUNTED_ITEM") && !d.benefitValue) {
    return NextResponse.json({ error: "benefitValue is required for this benefit type" }, { status: 400 });
  }
  if (d.benefitType === "PERCENTAGE_OFF" && d.benefitValue && d.benefitValue > 100) {
    return NextResponse.json({ error: "A percentage benefit cannot exceed 100" }, { status: 400 });
  }
  if ((d.benefitType === "FREE_ITEM" || d.benefitType === "DISCOUNTED_ITEM") && d.eligibleProductIds.length === 0 && d.eligibleCategoryIds.length === 0) {
    return NextResponse.json({ error: "A FREE_ITEM or DISCOUNTED_ITEM offer needs at least one eligible product or category" }, { status: 400 });
  }
  if (d.requiresCouponCode && !d.couponCode) {
    return NextResponse.json({ error: "couponCode is required when requiresCouponCode is true" }, { status: 400 });
  }

  const brand = await prisma.brand.findUniqueOrThrow({ where: { id: d.brandId } });

  const promotion = await prisma.$transaction(async (tx) => {
    const created = await tx.promotion.create({
      data: {
        brandId: d.brandId,
        name: d.name,
        type: "DISCOUNT",
        priority: d.priority,
        // JSON-encoded text since the move to SQLite (see the schema's encoding notes).
        eligibleProductIds: strArray(d.eligibleProductIds),
        eligibleCategoryIds: strArray(d.eligibleCategoryIds),
        eligibleMinQuantity: d.eligibleMinQuantity,
        minOrderAmount: d.minOrderAmount,
        branchIds: strArray(d.branchIds),
        daysOfWeek: intArray(d.daysOfWeek),
        startTimeMinutes: d.startTimeMinutes,
        endTimeMinutes: d.endTimeMinutes,
        firstOrderOnly: d.firstOrderOnly,
        requiresCouponCode: d.requiresCouponCode,
        benefitType: d.benefitType,
        benefitProductIds: strArray(d.benefitProductIds),
        benefitCategoryIds: strArray(d.benefitCategoryIds),
        benefitQuantity: d.benefitQuantity,
        benefitValue: d.benefitValue,
        maxDiscountAmount: d.maxDiscountAmount,
        allowMultiplePerOrder: d.allowMultiplePerOrder,
        startsAt: d.startsAt ? new Date(d.startsAt) : new Date(),
        endsAt: d.endsAt ? new Date(d.endsAt) : undefined,
        maxUsesTotal: d.maxUsesTotal,
        maxUsesPerCustomer: d.maxUsesPerCustomer,
        status: "ACTIVE",
        createdById: user.id,
      },
    });

    if (d.requiresCouponCode && d.couponCode) {
      const code = d.couponCode.trim().toUpperCase();
      const existingCoupon = await tx.coupon.findUnique({ where: { brandId_code: { brandId: d.brandId, code } } });
      if (existingCoupon) throw new Error("DUPLICATE_CODE");
      await tx.coupon.create({
        data: {
          brandId: d.brandId,
          code,
          promotionId: created.id,
          discountType: d.benefitType === "FREE_ITEM" ? "FREE_ITEM" : d.benefitType === "PERCENTAGE_OFF" ? "PERCENTAGE" : "FIXED",
          value: d.benefitValue ?? 0,
          createdById: user.id,
        },
      });
    }

    await writeAuditLog(tx, {
      tenantId: brand.tenantId,
      userId: user.id,
      action: "promotion.created",
      entityType: "Promotion",
      entityId: created.id,
      after: { name: created.name, benefitType: created.benefitType, priority: created.priority, requiresCouponCode: created.requiresCouponCode },
    });

    return created;
  }).catch((err) => {
    if (err instanceof Error && err.message === "DUPLICATE_CODE") return null;
    throw err;
  });

  if (!promotion) return NextResponse.json({ error: "A coupon with this code already exists" }, { status: 409 });

  return NextResponse.json({ promotion: decodePromotion(promotion) }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.PROMOTIONS_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const brandId = req.nextUrl.searchParams.get("brandId");
  if (!brandId) return NextResponse.json({ error: "brandId is required" }, { status: 400 });
  const brandDenied = await checkBrandAccess(user, brandId);
  if (brandDenied) return brandDenied;
  const status = req.nextUrl.searchParams.get("status");
  const branchId = req.nextUrl.searchParams.get("branchId");
  const search = req.nextUrl.searchParams.get("search");

  // `branchIds` and the case-insensitive name search are applied in JS — both were
  // PostgreSQL-only query features. See matchesBranchScope / matchesSearch.
  const rows = await prisma.promotion.findMany({
    where: {
      brandId,
      ...(status ? { status: status as never } : {}),
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    include: { coupons: true, createdBy: true },
  });

  const promotions = rows
    .filter((p) => !branchId || matchesBranchScope(p.branchIds, branchId))
    .filter((p) => !search || matchesSearch(p.name, search))
    .map((p) => ({ ...p, ...decodePromotion(p) }));

  return NextResponse.json({ promotions });
}
