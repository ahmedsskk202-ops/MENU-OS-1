import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyCustomerSession, CUSTOMER_SESSION_COOKIE } from "@/lib/customer-session";
import { readyAnyGame } from "@/lib/games/dispatch";

const bodySchema = z.object({ gameSessionId: z.string(), gamePlayerId: z.string(), isReady: z.boolean() });

export async function POST(req: NextRequest) {
  const claims = verifyCustomerSession(req.cookies.get(CUSTOMER_SESSION_COOKIE)?.value);
  if (!claims) return NextResponse.json({ error: "No active table session" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const gameSession = await readyAnyGame(parsed.data.gameSessionId, parsed.data.gamePlayerId, parsed.data.isReady);
  return NextResponse.json({ gameSession });
}
