import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyCustomerSession, CUSTOMER_SESSION_COOKIE } from "@/lib/customer-session";
import { getAnyFullGameSession } from "@/lib/games/dispatch";

export async function GET(req: NextRequest) {
  const claims = verifyCustomerSession(req.cookies.get(CUSTOMER_SESSION_COOKIE)?.value);
  if (!claims) return NextResponse.json({ error: "No active table session" }, { status: 401 });

  // gameKey is optional — the original page polls with no query param and gets "the
  // most recent active game for this table" exactly as before; every Game Platform page
  // passes its own key so a different game's session at this table never leaks in.
  const gameKey = req.nextUrl.searchParams.get("gameKey");

  const gameSession = await prisma.gameSession.findFirst({
    where: {
      tableSessionId: claims.tableSessionId,
      status: { in: ["LOBBY", "IN_PROGRESS"] },
      ...(gameKey ? { game: { key: gameKey } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  if (!gameSession) return NextResponse.json({ gameSession: null, customerSessionId: claims.customerSessionId });

  const full = await getAnyFullGameSession(gameSession.id);
  return NextResponse.json({ gameSession: full, customerSessionId: claims.customerSessionId });
}
