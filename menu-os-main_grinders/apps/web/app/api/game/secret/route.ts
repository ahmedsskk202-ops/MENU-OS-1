import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyCustomerSession, CUSTOMER_SESSION_COOKIE } from "@/lib/customer-session";
import { getMySecret } from "@/lib/games/engine";

// Impostor's private role + secret word for one round. The requesting player's own
// gamePlayerId is always resolved server-side from their table-session cookie's
// customerSessionId — the client never supplies (and could never spoof) which
// player's secret it's asking for.
export async function GET(req: NextRequest) {
  const claims = verifyCustomerSession(req.cookies.get(CUSTOMER_SESSION_COOKIE)?.value);
  if (!claims) return NextResponse.json({ error: "No active table session" }, { status: 401 });

  const gameRoundId = req.nextUrl.searchParams.get("gameRoundId");
  if (!gameRoundId) return NextResponse.json({ error: "gameRoundId is required" }, { status: 400 });

  const round = await prisma.gameRound.findUnique({
    where: { id: gameRoundId },
    include: { gameSession: { include: { players: true } } },
  });
  if (!round) return NextResponse.json({ error: "Round not found" }, { status: 404 });

  const me = round.gameSession.players.find((p) => p.customerSessionId === claims.customerSessionId);
  if (!me) return NextResponse.json({ error: "You are not a player in this game" }, { status: 403 });

  const secret = await getMySecret(gameRoundId, me.id);
  return NextResponse.json({ secret });
}
