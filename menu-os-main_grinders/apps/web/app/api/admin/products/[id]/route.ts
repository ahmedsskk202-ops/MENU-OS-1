import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { writeAuditLog } from "@/lib/audit";

const bodySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  imageUrl: z.string().min(1).nullable().optional(),
  basePrice: z.number().nonnegative().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isPopular: z.boolean().optional(),
  isNew: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.MENU_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const existing = await prisma.product.findUniqueOrThrow({
    where: { id: params.id },
    include: { category: { include: { menu: { include: { brand: true } } } } },
  });

  const product = await prisma.$transaction(async (tx) => {
    const updated = await tx.product.update({ where: { id: params.id }, data: parsed.data });

    // A price change is the one product edit that's actually financial history —
    // audit it specifically rather than every cosmetic field change.
    if (parsed.data.basePrice !== undefined && parsed.data.basePrice !== existing.basePrice.toNumber()) {
      await writeAuditLog(tx, {
        tenantId: existing.category.menu.brand.tenantId,
        userId: user.id,
        action: "product.price_changed",
        entityType: "Product",
        entityId: updated.id,
        before: { basePrice: existing.basePrice.toNumber() },
        after: { basePrice: parsed.data.basePrice },
      });
    }

    return updated;
  });

  return NextResponse.json({ product });
}
