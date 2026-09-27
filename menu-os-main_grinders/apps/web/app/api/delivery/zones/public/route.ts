import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Unauthenticated on purpose — a guest picking a delivery zone at checkout isn't
// staff. Returns only what checkout needs to show, nothing internal.
export async function GET(req: NextRequest) {
  const branchId = req.nextUrl.searchParams.get("branchId");
  if (!branchId) return NextResponse.json({ error: "branchId is required" }, { status: 400 });

  const zones = await prisma.deliveryZone.findMany({
    where: { branchId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, feeAmount: true, minOrderAmount: true, estimatedMinutes: true },
  });

  // Prisma Decimal serializes to a JSON string, not a number — left as-is here it
  // silently turns "+deliveryFee" into string concatenation on the client (caught by
  // hand-testing checkout: 5,500 + 3,500 rendered as "55,003,500").
  return NextResponse.json({
    zones: zones.map((z) => ({ ...z, feeAmount: z.feeAmount.toNumber(), minOrderAmount: z.minOrderAmount.toNumber() })),
  });
}
