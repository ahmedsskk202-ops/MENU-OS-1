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
  const combo = await prisma.comboDeal.findUnique({ where: { id: params.id }, include: { slots: true } });
  if (!combo) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const denied = await checkBrandAccess(user, combo.brandId);
  if (denied) return denied;
  return NextResponse.json({ combo });
}

// Same pattern as Promotion's PATCH: pause/resume/archive are just `status` values.
const patchSchema = z.object({
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "ARCHIVED"]).optional(),
  name: z.string().min(2).max(80).optional(),
  fixedPrice: z.number().positive().optional(),
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

  const existing = await prisma.comboDeal.findUnique({ where: { id: params.id }, include: { brand: true } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const denied = await checkBrandAccess(user, existing.brandId);
  if (denied) return denied;

  const data: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.endsAt !== undefined) data.endsAt = parsed.data.endsAt ? new Date(parsed.data.endsAt) : null;

  const combo = await prisma.$transaction(async (tx) => {
    const updated = await tx.comboDeal.update({ where: { id: params.id }, data });
    await writeAuditLog(tx, {
      tenantId: existing.brand.tenantId,
      userId: user.id,
      action: parsed.data.status ? `combo.${parsed.data.status.toLowerCase()}` : "combo.updated",
      entityType: "ComboDeal",
      entityId: updated.id,
      before: { status: existing.status, name: existing.name, fixedPrice: existing.fixedPrice.toNumber() },
      after: { status: updated.status, name: updated.name, fixedPrice: updated.fixedPrice.toNumber() },
    });
    return updated;
  });

  return NextResponse.json({ combo });
}
