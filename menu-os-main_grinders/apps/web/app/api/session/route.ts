import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyCustomerSession, CUSTOMER_SESSION_COOKIE } from "@/lib/customer-session";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(CUSTOMER_SESSION_COOKIE)?.value;
  const claims = verifyCustomerSession(token);
  if (!claims) return NextResponse.json({ error: "No active table session" }, { status: 401 });

  const tableSession = await prisma.tableSession.findUnique({
    where: { id: claims.tableSessionId },
    include: {
      table: { include: { branch: { include: { brand: true } } } },
      participants: { where: { leftAt: null } },
    },
  });

  if (!tableSession || tableSession.status !== "ACTIVE") {
    return NextResponse.json({ error: "This table session has ended" }, { status: 410 });
  }

  return NextResponse.json({
    tableSessionId: tableSession.id,
    sessionNumber: tableSession.sessionNumber,
    guestsCount: tableSession.guestsCount,
    customerSessionId: claims.customerSessionId,
    table: { id: tableSession.table.id, label: tableSession.table.label },
    participants: tableSession.participants.map((p) => ({ id: p.id, displayName: p.displayName })),
    // Flattened onto the branch/brand objects rather than nested, because the
    // receipt is the only consumer and it needs them as plain header lines.
    branch: {
      id: tableSession.table.branch.id,
      name: tableSession.table.branch.name,
      address: tableSession.table.branch.address,
      phone: tableSession.table.branch.phone,
    },
    brand: {
      id: tableSession.table.branch.brand.id,
      name: tableSession.table.branch.brand.name,
      logoUrl: tableSession.table.branch.brand.logoUrl,
      currency: tableSession.table.branch.brand.currency,
      defaultLocale: tableSession.table.branch.brand.defaultLocale,
    },
  });
}
