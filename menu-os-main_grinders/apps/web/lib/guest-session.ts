import { randomUUID } from "node:crypto";
import { prisma } from "./db";
import { verifyGuestSession, type GuestSessionToken } from "./customer-session";

/** Reuses an existing guest CustomerSession for this branch if the cookie still points
 *  at a live one, otherwise creates a new one. Shared by every entry point that can
 *  start a guest pickup/delivery session (the cart page's eager call, and placing an
 *  order directly as a fallback). */
export async function ensureGuestCustomerSession(branchId: string, existingCookieValue: string | undefined): Promise<string> {
  const existing = verifyGuestSession(existingCookieValue);
  if (existing?.branchId === branchId) {
    const stillExists = await prisma.customerSession.findUnique({ where: { id: existing.customerSessionId } });
    if (stillExists) return existing.customerSessionId;
  }

  const created = await prisma.customerSession.create({
    data: { branchId, displayName: "Guest", deviceToken: randomUUID() },
  });
  return created.id;
}

export type { GuestSessionToken };
