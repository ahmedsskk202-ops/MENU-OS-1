import jwt from "jsonwebtoken";

const SECRET = process.env.CUSTOMER_SESSION_SECRET ?? "dev-only-insecure-secret-change-me";
export const CUSTOMER_SESSION_COOKIE = "mos_session";

export interface CustomerSessionToken {
  tableSessionId: string;
  customerSessionId: string;
  branchId: string;
  tableId: string;
}

export function signCustomerSession(payload: CustomerSessionToken): string {
  return jwt.sign(payload, SECRET, { expiresIn: "12h" });
}

export function verifyCustomerSession(token: string | undefined | null): CustomerSessionToken | null {
  if (!token) return null;
  try {
    return jwt.verify(token, SECRET) as CustomerSessionToken;
  } catch {
    return null;
  }
}

// A separate, smaller identity for guest self-service pickup/delivery ordering — there
// is no physical table, so none of tableSessionId/tableId apply. Kept as its own type
// (rather than making the fields above optional) so every existing table-flow call site
// that destructures `claims.tableSessionId` as a guaranteed string stays exactly as-is.
export const GUEST_SESSION_COOKIE = "mos_guest_session";

export interface GuestSessionToken {
  customerSessionId: string;
  branchId: string;
}

export function signGuestSession(payload: GuestSessionToken): string {
  return jwt.sign(payload, SECRET, { expiresIn: "24h" });
}

export function verifyGuestSession(token: string | undefined | null): GuestSessionToken | null {
  if (!token) return null;
  try {
    return jwt.verify(token, SECRET) as GuestSessionToken;
  } catch {
    return null;
  }
}
