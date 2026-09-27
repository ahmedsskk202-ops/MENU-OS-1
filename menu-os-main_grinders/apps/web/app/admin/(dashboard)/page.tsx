import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { homeFor } from "@/lib/admin-routes";
import { CommandCenter } from "./dashboard-client";

/**
 * Where the staff console sends you when you sign in.
 *
 * A waiter has no dashboard.view — a revenue dashboard is not something a waiter can act
 * on — but they do have orders.serve, and the floor screen is the entire job. Rather than
 * refusing them, they are sent to the screen that is theirs.
 *
 * This is the server half of that decision, and it runs *before* the command centre is
 * rendered, so it is the half that actually holds: the layout guard is a client
 * component that replaces its children, so a role refused by the dashboard would never
 * see this redirect. The rule itself lives in `homeFor`, shared with the guard, because
 * two copies of "where does this role belong" is how they start disagreeing.
 *
 * A user with neither dashboard.view nor a home of their own is left to render the
 * command centre, which the guard will refuse with something better than a redirect
 * loop. Sending them somewhere on a guess would be worse.
 */
export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const permissions = new Set((session?.user as SessionUser | undefined)?.permissions ?? []);

  if (!permissions.has(PERMISSIONS.DASHBOARD_VIEW)) {
    const home = homeFor(permissions);
    if (home) redirect(home);
  }

  return <CommandCenter />;
}
