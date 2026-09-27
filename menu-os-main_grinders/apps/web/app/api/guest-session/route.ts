import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { signGuestSession, GUEST_SESSION_COOKIE } from "@/lib/customer-session";
import { ensureGuestCustomerSession } from "@/lib/guest-session";

const bodySchema = z.object({ branchId: z.string() });

// Establishes (or reuses) the guest identity a table-less pickup/delivery visitor
// needs before checkout — e.g. so the cart's automatic-offer preview
// (POST /api/coupons/validate) has a session to price against before the first order
// is actually placed. POST /api/orders/guest also creates one lazily as a fallback,
// so this call is a convenience, not a hard requirement.
export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const branch = await prisma.branch.findUnique({ where: { id: parsed.data.branchId } });
  if (!branch) return NextResponse.json({ error: "Branch not found" }, { status: 404 });

  const customerSessionId = await ensureGuestCustomerSession(parsed.data.branchId, req.cookies.get(GUEST_SESSION_COOKIE)?.value);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(GUEST_SESSION_COOKIE, signGuestSession({ customerSessionId, branchId: parsed.data.branchId }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
  return res;
}
