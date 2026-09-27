import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyCustomerSession, CUSTOMER_SESSION_COOKIE } from "@/lib/customer-session";
import { answerAnyGame } from "@/lib/games/dispatch";

// max(600) — generous enough for a CATEGORY_SPRINT round's comma-separated list of
// items, which every other round kind's much shorter answer easily fits inside too.
const bodySchema = z.object({ gameRoundId: z.string(), gamePlayerId: z.string(), answer: z.string().min(1).max(600) });

export async function POST(req: NextRequest) {
  const claims = verifyCustomerSession(req.cookies.get(CUSTOMER_SESSION_COOKIE)?.value);
  if (!claims) return NextResponse.json({ error: "No active table session" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const result = await answerAnyGame(parsed.data.gameRoundId, parsed.data.gamePlayerId, parsed.data.answer);
    return NextResponse.json({ result });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not submit answer" }, { status: 422 });
  }
}
