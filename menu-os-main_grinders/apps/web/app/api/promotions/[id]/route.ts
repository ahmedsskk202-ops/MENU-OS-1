import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { writeAuditLog } from "@/lib/audit";
import { checkBrandAccess } from "@/lib/brand-access";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.PROMOTIONS_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const promotion = await prisma.promotion.findUnique({ where: { id: params.id }, include: { coupons: true } });
  if (!promotion) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const denied = await checkBrandAccess(user, promotion.brandId);
  if (denied) return denied;
  return NextResponse.json({ promotion });
}

// Partial edit + status transitions (pause/resume/archive are just `status` values —
// no separate endpoints needed, matching "don't duplicate the engine").
const patchSchema = z.object({
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "ARCHIVED"]).optional(),
  name: z.string().min(2).max(80).optional(),
  priority: z.number().int().optional(),
  endsAt: z.string().datetime().nullable().optional(),
  maxUsesTotal: z.number().int().positive().nullable().optional(),
  maxUsesPerCustomer: z.number().int().positive().nullable().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.PROMOTIONS_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const existing = await prisma.promotion.findUnique({ where: { id: params.id }, include: { brand: true } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const denied = await checkBrandAccess(user, existing.brandId);
  if (denied) return denied;

  const data: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.endsAt !== undefined) data.endsAt = parsed.data.endsAt ? new Date(parsed.data.endsAt) : null;
  if (parsed.data.status) data.isActive = parsed.data.status === "ACTIVE"; // legacy mirror stays in sync

  const promotion = await prisma.$transaction(async (tx) => {
    const updated = await tx.promotion.update({ where: { id: params.id }, data });
    await writeAuditLog(tx, {
      tenantId: existing.brand.tenantId,
      userId: user.id,
      action: parsed.data.status ? `promotion.${parsed.data.status.toLowerCase()}` : "promotion.updated",
      entityType: "Promotion",
      entityId: updated.id,
      before: { status: existing.status, name: existing.name, priority: existing.priority },
      after: { status: updated.status, name: updated.name, priority: updated.priority },
    });
    return updated;
  });

  return NextResponse.json({ promotion });
}
