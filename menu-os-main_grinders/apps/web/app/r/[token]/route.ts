import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";
import { signCustomerSession, verifyCustomerSession, CUSTOMER_SESSION_COOKIE } from "@/lib/customer-session";

// The single QR entry point: scan -> resolve restaurant/branch/table/session -> land
// straight on the table's home screen. The customer never picks a restaurant or table.
export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  const qr = await prisma.qRCode.findUnique({
    where: { token: params.token },
    include: { table: true, branch: { include: { brand: true } } },
  });

  if (!qr || !qr.isActive) {
    return NextResponse.redirect(new URL("/invalid-code", req.url));
  }

  await prisma.qRCode.update({ where: { id: qr.id }, data: { scansCount: { increment: 1 } } });

  if (qr.type === "MENU" || qr.type === "MARKETING") {
    return NextResponse.redirect(new URL(`/m/${qr.branch.id}`, req.url));
  }

  if (qr.type !== "TABLE" || !qr.table) {
    return NextResponse.redirect(new URL(`/m/${qr.branch.id}`, req.url));
  }

  const table = qr.table;

  let tableSession = await prisma.tableSession.findFirst({
    where: { tableId: table.id, status: "ACTIVE" },
    orderBy: { openedAt: "desc" },
  });

  if (!tableSession) {
    const lastSession = await prisma.tableSession.findFirst({
      where: { tableId: table.id },
      orderBy: { sessionNumber: "desc" },
    });
    tableSession = await prisma.tableSession.create({
      data: {
        tableId: table.id,
        sessionNumber: (lastSession?.sessionNumber ?? 0) + 1,
        status: "ACTIVE",
        guestsCount: 1,
      },
    });
    await prisma.restaurantTable.update({ where: { id: table.id }, data: { status: "OCCUPIED" } });
  }

  // A phone that scans the same table again (a refresh, a second scan, re-opening the
  // camera) is the same guest, not a new one. Reuse its participant when the cookie it
  // already carries belongs to this very table session; only a genuinely new device, or
  // a device whose last visit was a different or closed session, joins as a new guest.
  // Without this, every re-scan added a phantom "Guest" and the home screen claimed
  // six people were sitting at a table for one.
  const previous = verifyCustomerSession(req.cookies.get(CUSTOMER_SESSION_COOKIE)?.value);
  const existingParticipant =
    previous && previous.tableSessionId === tableSession.id
      ? await prisma.customerSession.findFirst({
          where: { id: previous.customerSessionId, tableSessionId: tableSession.id, leftAt: null },
        })
      : null;

  const participant =
    existingParticipant ??
    (await prisma.customerSession.create({
      data: {
        tableSessionId: tableSession.id,
        displayName: "Guest",
        deviceToken: randomUUID(),
      },
    }));

  const token = signCustomerSession({
    tableSessionId: tableSession.id,
    customerSessionId: participant.id,
    branchId: qr.branchId,
    tableId: table.id,
  });

  const res = NextResponse.redirect(new URL(`/t/${tableSession.id}`, req.url));
  res.cookies.set(CUSTOMER_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
    path: "/",
  });
  return res;
}
