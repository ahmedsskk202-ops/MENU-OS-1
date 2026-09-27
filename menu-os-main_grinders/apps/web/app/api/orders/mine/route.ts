import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyCustomerSession, CUSTOMER_SESSION_COOKIE } from "@/lib/customer-session";
import { CUSTOMER_PAYMENT_SELECT } from "@/lib/payments/service";

export async function GET(req: NextRequest) {
  const claims = verifyCustomerSession(req.cookies.get(CUSTOMER_SESSION_COOKIE)?.value);
  if (!claims) return NextResponse.json({ error: "No active table session" }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { tableSessionId: claims.tableSessionId },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { modifiers: { include: { modifierOption: { select: { name: true, nameAr: true, nameEn: true } } } }, product: { select: { name: true, nameAr: true, nameEn: true } } } }, statusEvents: { orderBy: { changedAt: "asc" } }, payments: { select: CUSTOMER_PAYMENT_SELECT }, discounts: true },
  });

  return NextResponse.json({ orders });
}
