import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { writeAuditLog } from "@/lib/audit";
import { checkBrandAccess } from "@/lib/brand-access";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.PROMOTIONS_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const original = await prisma.comboDeal.findUnique({ where: { id: params.id }, include: { slots: true, brand: true } });
  if (!original) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const denied = await checkBrandAccess(user, original.brandId);
  if (denied) return denied;

  const duplicate = await prisma.$transaction(async (tx) => {
    const created = await tx.comboDeal.create({
      data: {
        brandId: original.brandId,
        name: `${original.name} (copy)`,
        description: original.description,
        status: "DRAFT", // starts paused-off, matching Promotion's duplicate behavior
        fixedPrice: original.fixedPrice,
        priority: original.priority,
        allowMultiplePerOrder: original.allowMultiplePerOrder,
        branchIds: original.branchIds,
        daysOfWeek: original.daysOfWeek,
        startTimeMinutes: original.startTimeMinutes,
        endTimeMinutes: original.endTimeMinutes,
        startsAt: new Date(),
        endsAt: original.endsAt ?? undefined,
        maxUsesTotal: original.maxUsesTotal ?? undefined,
        maxUsesPerCustomer: original.maxUsesPerCustomer ?? undefined,
        createdById: user.id,
        slots: {
          create: original.slots.map((s) => ({ label: s.label, productIds: s.productIds, categoryIds: s.categoryIds, quantity: s.quantity, sortOrder: s.sortOrder })),
        },
      },
      include: { slots: true },
    });
    await writeAuditLog(tx, {
      tenantId: original.brand.tenantId,
      userId: user.id,
      action: "combo.duplicated",
      entityType: "ComboDeal",
      entityId: created.id,
      after: { duplicatedFrom: original.id, name: created.name },
    });
    return created;
  });

  return NextResponse.json({ combo: duplicate }, { status: 201 });
}
