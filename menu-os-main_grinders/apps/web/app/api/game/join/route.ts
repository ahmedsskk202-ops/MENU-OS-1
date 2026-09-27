import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyCustomerSession, CUSTOMER_SESSION_COOKIE } from "@/lib/customer-session";
import { joinAnyGame } from "@/lib/games/dispatch";

// gameKey is optional — omitting it preserves the original page's exact contract
// (joins "thirty-second-challenge"); every new Game Platform page passes its own key.
const bodySchema = z.object({ displayName: z.string().min(1).max(40), gameKey: z.string().min(1).max(60).optional() });

export async function POST(req: NextRequest) {
  const claims = verifyCustomerSession(req.cookies.get(CUSTOMER_SESSION_COOKIE)?.value);
  if (!claims) return NextResponse.json({ error: "No active table session" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const gameSession = await joinAnyGame(parsed.data.gameKey, claims.tableSessionId, claims.customerSessionId, parsed.data.displayName);
    return NextResponse.json({ gameSession, customerSessionId: claims.customerSessionId });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not join game" }, { status: 422 });
  }
}
