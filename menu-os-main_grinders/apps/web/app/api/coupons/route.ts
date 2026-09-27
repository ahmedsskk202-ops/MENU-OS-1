import { decodeCoupon } from "@/lib/discounts";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { strArray } from "@menu-os/db";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { writeAuditLog } from "@/lib/audit";
import { checkBrandAccess } from "@/lib/brand-access";

const createSchema = z.object({
  brandId: z.string(),
  code: z.string().min(2).max(40),
  discountType: z.enum(["PERCENTAGE", "FIXED", "FREE_ITEM"]),
  value: z.number().nonnegative().optional(),
  minOrderAmount: z.number().nonnegative().optional(),
  maxDiscountAmount: z.number().positive().optional(),
  applicableProductIds: z.array(z.string()).default([]),
  applicableCategoryIds: z.array(z.string()).default([]),
  branchIds: z.array(z.string()).default([]),
  startsAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  maxUses: z.number().int().positive().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.PROMOTIONS_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const denied = await checkBrandAccess(user, parsed.data.brandId);
  if (denied) return denied;

  if (parsed.data.discountType === "PERCENTAGE" && (!parsed.data.value || parsed.data.value <= 0 || parsed.data.value > 100)) {
    return NextResponse.json({ error: "A percentage discount must be greater than 0 and cannot exceed 100" }, { status: 400 });
  }
  if (parsed.data.discountType === "FIXED" && (!parsed.data.value || parsed.data.value <= 0)) {
    return NextResponse.json({ error: "A fixed discount must be greater than 0" }, { status: 400 });
  }
  if (parsed.data.discountType === "FREE_ITEM" && parsed.data.applicableProductIds.length === 0 && parsed.data.applicableCategoryIds.length === 0) {
    return NextResponse.json({ error: "A FREE_ITEM offer needs at least one applicable product or category — otherwise there's nothing to make free" }, { status: 400 });
  }

  const code = parsed.data.code.trim().toUpperCase();
  const existing = await prisma.coupon.findUnique({ where: { brandId_code: { brandId: parsed.data.brandId, code } } });
  if (existing) return NextResponse.json({ error: "A coupon with this code already exists" }, { status: 409 });

  const brand = await prisma.brand.findUniqueOrThrow({ where: { id: parsed.data.brandId } });

  const coupon = await prisma.$transaction(async (tx) => {
    const created = await tx.coupon.create({
      data: {
        brandId: parsed.data.brandId,
        code,
        discountType: parsed.data.discountType,
        value: parsed.data.value ?? 0,
        minOrderAmount: parsed.data.minOrderAmount,
        maxDiscountAmount: parsed.data.maxDiscountAmount,
        // JSON-encoded text since the move to SQLite (see the schema's encoding notes).
        applicableProductIds: strArray(parsed.data.applicableProductIds),
        applicableCategoryIds: strArray(parsed.data.applicableCategoryIds),
        branchIds: strArray(parsed.data.branchIds),
        startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : undefined,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
        maxUses: parsed.data.maxUses,
        createdById: user.id,
      },
    });
    await writeAuditLog(tx, {
      tenantId: brand.tenantId,
      userId: user.id,
      action: "coupon.created",
      entityType: "Coupon",
      entityId: created.id,
      after: { code: created.code, discountType: created.discountType, value: created.value.toNumber() },
    });
    return created;
  });

  return NextResponse.json({ coupon: decodeCoupon(coupon) }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.PROMOTIONS_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const brandId = req.nextUrl.searchParams.get("brandId");
  if (!brandId) return NextResponse.json({ error: "brandId is required" }, { status: 400 });
  const denied = await checkBrandAccess(user, brandId);
  if (denied) return denied;

  const coupons = await prisma.coupon.findMany({ where: { brandId }, orderBy: { createdAt: "desc" }, include: { createdBy: true } });
  return NextResponse.json({ coupons: coupons.map(decodeCoupon) });
}
