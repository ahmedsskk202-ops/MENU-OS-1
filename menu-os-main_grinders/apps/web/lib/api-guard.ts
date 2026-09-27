import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "./auth";

/**
 * The one place a route handler resolves "who is asking, and may they".
 *
 * Both failures used to collapse into a flat 403, which is defensible but makes two
 * genuinely different situations look identical to a client. It matters on the two
 * staff boards because they are consumed by pages that are already signed in: a 401
 * there means the session expired and the user should be sent to sign in again, while
 * a 403 means the session is fine and they simply do not have this job. A client cannot
 * tell those apart if both arrive as 403.
 *
 * Returns the signed-in user, or an error response to send straight back:
 *
 *   const auth = await authenticate(PERMISSIONS.ORDERS_SERVE);
 *   if ("error" in auth) return auth.error;
 *   … auth.user …
 *
 * One call rather than two, so the session is read once and the user is guaranteed to
 * be the same person the permission was checked against.
 */
export async function authenticate(
  permission?: string
): Promise<{ user: SessionUser; error?: undefined } | { error: NextResponse; user?: undefined }> {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (permission && !user.permissions.includes(permission)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user };
}
