import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyCustomerSession, CUSTOMER_SESSION_COOKIE } from "@/lib/customer-session";
import { startAnyGame } from "@/lib/games/dispatch";

const bodySchema = z.object({ gameSessionId: z.string() });

export async function POST(req: NextRequest) {
  const claims = verifyCustomerSession(req.cookies.get(CUSTOMER_SESSION_COOKIE)?.value);
  if (!claims) return NextResponse.json({ error: "No active table session" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    await startAnyGame(parsed.data.gameSessionId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not start game" }, { status: 422 });
  }
}
