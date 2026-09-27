import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createOrder } from "@/lib/orders";
import { verifyCustomerSession, CUSTOMER_SESSION_COOKIE } from "@/lib/customer-session";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { checkBranchAccess } from "@/lib/branch-access";
import { STAFF_PAYMENT_SELECT } from "@/lib/payments/service";

const bodySchema = z.object({
  notes: z.string().max(500).optional(),
  clientRequestId: z.string().min(1).max(200).optional(),
  couponCode: z.string().min(1).max(40).optional(),
  lines: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().min(1).max(50),
        notes: z.string().max(300).optional(),
        modifierOptionIds: z.array(z.string()).default([]),
      })
    )
    .min(1),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const token = req.cookies.get(CUSTOMER_SESSION_COOKIE)?.value;
  const claims = verifyCustomerSession(token);
  if (!claims) return NextResponse.json({ error: "No active table session" }, { status: 401 });

  const tableSession = await prisma.tableSession.findUnique({ where: { id: claims.tableSessionId } });
  if (!tableSession || tableSession.status !== "ACTIVE") {
    return NextResponse.json({ error: "This table session has ended" }, { status: 410 });
  }

  try {
    const order = await createOrder({
      branchId: claims.branchId,
      tableSessionId: claims.tableSessionId,
      customerSessionId: claims.customerSessionId,
      type: "DINE_IN",
      lines: parsed.data.lines,
      notes: parsed.data.notes,
      clientRequestId: parsed.data.clientRequestId,
      couponCode: parsed.data.couponCode,
    });
    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not place order" }, { status: 422 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const branchId = req.nextUrl.searchParams.get("branchId");
  if (!branchId) return NextResponse.json({ error: "branchId is required" }, { status: 400 });
  const denied = await checkBranchAccess(user, branchId);
  if (denied) return denied;

  const status = req.nextUrl.searchParams.get("status");

  const orders = await prisma.order.findMany({
    where: { branchId, ...(status ? { status: status as never } : {}) },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      items: { include: { modifiers: true } },
      // branch → brand comes along for the receipt header: a printed slip has to say
      // which cafe and which address it is from, and the Orders screen is one of the
      // two places staff can print one from. Same rows, one extra join.
      tableSession: { include: { table: { include: { branch: { include: { brand: true } } } } } },
      payments: { select: STAFF_PAYMENT_SELECT },
      discounts: true,
    },
  });

  return NextResponse.json({ orders });
}
