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
import { decodeComboDeal } from "@/lib/combos";

const slotSchema = z.object({
  label: z.string().min(1).max(60),
  productIds: z.array(z.string()).default([]),
  categoryIds: z.array(z.string()).default([]),
  quantity: z.number().int().min(1).default(1),
});

const createSchema = z.object({
  brandId: z.string(),
  name: z.string().min(2).max(80),
  description: z.string().max(300).optional(),
  fixedPrice: z.number().positive(),
  priority: z.number().int().default(0),
  allowMultiplePerOrder: z.boolean().default(true),
  slots: z.array(slotSchema).min(2), // a "combo" needs at least 2 slots — one slot alone is just a discounted product
  branchIds: z.array(z.string()).default([]),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).default([]),
  startTimeMinutes: z.number().int().min(0).max(1439).optional(),
  endTimeMinutes: z.number().int().min(0).max(1439).optional(),
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
  const denied = await checkBrandAccess(user, parsed.data.brandId);
  if (denied) return denied;
  const d = parsed.data;

  for (const slot of d.slots) {
    if (slot.productIds.length === 0 && slot.categoryIds.length === 0) {
      return NextResponse.json({ error: `Slot "${slot.label}" needs at least one product or category` }, { status: 400 });
    }
  }

  const brand = await prisma.brand.findUniqueOrThrow({ where: { id: d.brandId } });

  const combo = await prisma.$transaction(async (tx) => {
    const created = await tx.comboDeal.create({
      data: {
        brandId: d.brandId,
        name: d.name,
        description: d.description,
        fixedPrice: d.fixedPrice,
        priority: d.priority,
        allowMultiplePerOrder: d.allowMultiplePerOrder,
        // JSON-encoded text since the move to SQLite (see the schema's encoding notes).
        branchIds: strArray(d.branchIds),
        daysOfWeek: intArray(d.daysOfWeek),
        startTimeMinutes: d.startTimeMinutes,
        endTimeMinutes: d.endTimeMinutes,
        startsAt: d.startsAt ? new Date(d.startsAt) : new Date(),
        endsAt: d.endsAt ? new Date(d.endsAt) : undefined,
        maxUsesTotal: d.maxUsesTotal,
        maxUsesPerCustomer: d.maxUsesPerCustomer,
        status: "ACTIVE",
        createdById: user.id,
        slots: {
          create: d.slots.map((s, i) => ({
            label: s.label,
            productIds: strArray(s.productIds),
            categoryIds: strArray(s.categoryIds),
            quantity: s.quantity,
            sortOrder: i,
          })),
        },
      },
      include: { slots: true },
    });

    await writeAuditLog(tx, {
      tenantId: brand.tenantId,
      userId: user.id,
      action: "combo.created",
      entityType: "ComboDeal",
      entityId: created.id,
      after: { name: created.name, fixedPrice: created.fixedPrice.toNumber(), slotCount: created.slots.length },
    });

    return created;
  });

  return NextResponse.json({ combo: decodeComboDeal(combo) }, { status: 201 });
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
  const rows = await prisma.comboDeal.findMany({
    where: {
      brandId,
      ...(status ? { status: status as never } : {}),
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    include: { slots: true, createdBy: true },
  });

  const combos = rows
    .filter((c) => !branchId || matchesBranchScope(c.branchIds, branchId))
    .filter((c) => !search || matchesSearch(c.name, search))
    .map(decodeComboDeal);

  return NextResponse.json({ combos });
}
