import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { getPromotionAnalytics } from "@/lib/promotions";
import { prisma } from "@/lib/db";
import { checkBrandAccess } from "@/lib/brand-access";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.PROMOTIONS_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const promotion = await prisma.promotion.findUnique({ where: { id: params.id }, select: { brandId: true } });
  if (!promotion) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const denied = await checkBrandAccess(user, promotion.brandId);
  if (denied) return denied;

  try {
    const analytics = await getPromotionAnalytics(params.id);
    return NextResponse.json(analytics);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
