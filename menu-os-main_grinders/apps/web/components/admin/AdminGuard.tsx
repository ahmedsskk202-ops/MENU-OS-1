"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { useLocale } from "@/lib/LocaleContext";
import { homeFor, requiredPermissionFor } from "@/lib/admin-routes";
import type { SessionUser } from "@/lib/auth";

/**
 * Route-level gate for the staff console.
 *
 * Hiding a nav row is not a guard — a URL is a URL, and a cashier who types
 * /admin/reports should not get a page shell with eight failing fetches behind it.
 * This wraps every dashboard screen and decides what that URL is allowed to show.
 *
 * It reads the permission list out of the session JWT, which the server already
 * signs, so nothing extra is fetched. It is a *screen* guard, not a security
 * boundary: the API routes each re-check their own permission, and that is the
 * check that actually holds. This one exists so the failure mode is a clear message
 * rather than a stack of console errors.
 *
 * Two answers, not one. Refused *and* the person has a screen of their own → send
 * them there; a waiter who typed a URL is asking "where do I work", not asking to be
 * told no. Refused with nowhere to send them → say so plainly. There is deliberately
 * no "back" link in that second case: the page refusing you is not a place to send
 * you back to, and a link that goes nowhere is worse than no link.
 *
 * While the session is still loading the children are held back rather than shown
 * and then yanked — a flash of a screen the user is about to be refused from is
 * worse than a moment of nothing.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data, status } = useSession();
  const { t } = useLocale();

  const required = requiredPermissionFor(pathname);
  const permissions = new Set((data?.user as SessionUser | undefined)?.permissions ?? []);
  const allowed = required === null || permissions.has(required);

  // Refused, but this person does have a screen of their own. Forwarding beats a dead
  // end whose only link is back to the page that just refused them.
  //
  // This has to happen here rather than only in the dashboard page's own `redirect()`,
  // because this component replaces its children: the page never reaches the client, so
  // a redirect inside it is a redirect the router never sees. The rule itself is shared
  // with that page, so there is still only one answer to "where does this role belong".
  const home = !allowed && status === "authenticated" ? homeFor(permissions) : null;

  useEffect(() => {
    if (home && pathname !== home) router.replace(home);
  }, [home, pathname, router]);

  if (status === "loading" || (home && pathname !== home)) {
    return <div className="p-10 text-sm text-muted-foreground">{t("admin.common.loading")}</div>;
  }

  if (!allowed) {
    return (
      <div className="p-10 max-w-lg">
        <div className="rounded-2xl border border-border bg-surface-raised p-8 text-center">
          <ShieldAlert className="h-9 w-9 mx-auto mb-4 text-muted-foreground" />
          <h1 className="font-display text-xl font-semibold mb-2">{t("admin.guard.deniedTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("admin.guard.deniedBody")}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
