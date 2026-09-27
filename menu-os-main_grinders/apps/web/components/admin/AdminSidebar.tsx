"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  UtensilsCrossed,
  LayoutGrid,
  ClipboardList,
  ShoppingBag,
  ChefHat,
  BellRing,
  BarChart3,
  QrCode,
  LogOut,
  Wallet,
  Receipt,
  FileBarChart,
  Tag,
  Sparkles,
  Package,
  CalendarClock,
  Truck,
  ConciergeBell,
  Boxes,
  ScrollText,
  Users,
  IdCard,
  Fingerprint,
  Store,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { PERMISSIONS } from "@/lib/rbac";
import { useBranch } from "@/lib/BranchContext";
import type { SessionUser } from "@/lib/auth";
import { GrindersLogo } from "@/components/brand/GrindersLogo";
import { useLocale } from "@/lib/LocaleContext";

/** Fired by the top bar's menu button to open the sidebar drawer on a phone. */
export const OPEN_SIDEBAR_EVENT = "mos-open-sidebar";

// Grouped into the cafe's own departments, so each person sees their section at a glance.
export const ADMIN_NAV = [
  { group: "ops", href: "/admin", label: "admin.nav.dashboard", icon: LayoutDashboard, permission: PERMISSIONS.DASHBOARD_VIEW },
  // The waiter's whole job, so it sits at the top of the floor-staff nav.
  { group: "ops", href: "/admin/waiter", label: "admin.nav.waiter", icon: ConciergeBell, permission: PERMISSIONS.ORDERS_SERVE },
  // The cashier's till: the menu on screen, so a counter or phone order is entered here.
  { group: "ops", href: "/admin/pos", label: "admin.nav.pos", icon: ShoppingBag, permission: PERMISSIONS.ORDERS_MANAGE },
  { group: "ops", href: "/admin/orders", label: "admin.nav.orders", icon: ClipboardList, permission: PERMISSIONS.ORDERS_MANAGE },
  { group: "ops", href: "/admin/kitchen", label: "admin.nav.kitchen", icon: ChefHat, permission: PERMISSIONS.KITCHEN_VIEW },
  { group: "ops", href: "/admin/tables", label: "admin.nav.tables", icon: LayoutGrid, permission: PERMISSIONS.TABLES_MANAGE },
  { group: "ops", href: "/admin/waiter-requests", label: "admin.nav.waiterRequests", icon: BellRing, permission: PERMISSIONS.WAITER_REQUESTS_VIEW },
  { group: "ops", href: "/admin/reservations", label: "admin.nav.reservations", icon: CalendarClock, permission: PERMISSIONS.RESERVATIONS_MANAGE },
  { group: "ops", href: "/admin/delivery", label: "admin.nav.delivery", icon: Truck, permission: PERMISSIONS.DELIVERY_MANAGE },
  { group: "sales", href: "/admin/menu", label: "admin.nav.menu", icon: UtensilsCrossed, permission: PERMISSIONS.MENU_MANAGE },
  { group: "sales", href: "/admin/promotions", label: "admin.nav.promotions", icon: Sparkles, permission: PERMISSIONS.PROMOTIONS_MANAGE },
  { group: "sales", href: "/admin/combos", label: "admin.nav.combos", icon: Package, permission: PERMISSIONS.PROMOTIONS_MANAGE },
  { group: "sales", href: "/admin/coupons", label: "admin.nav.coupons", icon: Tag, permission: PERMISSIONS.PROMOTIONS_MANAGE },
  { group: "store", href: "/admin/inventory", label: "admin.nav.inventory", icon: Boxes, permission: PERMISSIONS.INVENTORY_VIEW },
  { group: "hr", href: "/admin/hr", label: "admin.nav.hr", icon: IdCard, permission: PERMISSIONS.HR_MANAGE },
  { group: "hr", href: "/admin/hr/kiosk", label: "admin.nav.kiosk", icon: Fingerprint, permission: PERMISSIONS.ATTENDANCE_KIOSK },
  { group: "admin", href: "/admin/expenses", label: "admin.nav.expenses", icon: Receipt, permission: PERMISSIONS.EXPENSES_MANAGE },
  { group: "admin", href: "/admin/shifts", label: "admin.nav.shifts", icon: Wallet, permission: PERMISSIONS.SHIFTS_MANAGE },
  { group: "admin", href: "/admin/reports", label: "admin.nav.reports", icon: FileBarChart, permission: PERMISSIONS.REPORTS_VIEW },
  { group: "admin", href: "/admin/analytics", label: "admin.nav.analytics", icon: BarChart3, permission: PERMISSIONS.ANALYTICS_VIEW },
  { group: "admin", href: "/admin/staff", label: "admin.nav.staff", icon: Users, permission: PERMISSIONS.STAFF_MANAGE },
  { group: "admin", href: "/admin/qr", label: "admin.nav.qr", icon: QrCode, permission: PERMISSIONS.QR_MANAGE },
  { group: "admin", href: "/admin/audit-log", label: "admin.nav.auditLog", icon: ScrollText, permission: PERMISSIONS.AUDIT_LOG_VIEW },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { data } = useSession();
  const user = data?.user as SessionUser | undefined;
  const { branches, branchId, setBranchId, loading } = useBranch();
  const { t, dir } = useLocale();
  // Below md the sidebar is an off-canvas drawer (opened from the top bar); from md up
  // it is a sticky column.
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_SIDEBAR_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_SIDEBAR_EVENT, onOpen);
  }, []);

  const visible = ADMIN_NAV.filter((item) => user?.permissions.includes(item.permission));
  // Longest matching link wins, so /admin/hr/kiosk does not also light up /admin/hr.
  const activeHref = visible
    .map((i) => i.href)
    .filter((h) => pathname === h || (h !== "/admin" && pathname.startsWith(`${h}/`)))
    .sort((a, b) => b.length - a.length)[0];
  const groups = [...new Set(visible.map((i) => i.group))];
  const initial = user?.name?.trim().charAt(0).toUpperCase() ?? "";

  return (
    <>
      {open && <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)} />}
      <aside
        className={cn(
          "w-72 shrink-0 border-e border-border bg-surface flex flex-col h-screen fixed top-0 start-0 z-50 transition-transform md:sticky md:z-auto md:translate-x-0",
          open ? "translate-x-0" : dir === "rtl" ? "translate-x-full" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="h-16 px-5 border-b border-border flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <GrindersLogo className="h-9 w-9 shrink-0" />
            <div className="min-w-0">
              <p className="font-display text-base font-semibold leading-tight truncate">The Grinders</p>
              <p className="text-[11px] text-muted-foreground truncate">{t("admin.sidebar.subtitle")}</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} aria-label={t("admin.common.closeMenu")} className="md:hidden h-9 w-9 flex items-center justify-center rounded-full hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Branch */}
        {!loading && branches.length > 0 && (
          <div className="px-4 pt-4 pb-2 shrink-0">
            <label className="relative block">
              <Store className="h-4 w-4 absolute top-1/2 -translate-y-1/2 start-3 text-muted-foreground pointer-events-none" />
              <select
                value={branchId ?? ""}
                onChange={(e) => setBranchId(e.target.value)}
                aria-label={t("admin.staff.branch")}
                className="w-full rounded-xl border border-border bg-surface-raised ps-9 pe-3 py-2.5 text-sm font-medium"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.brandName} · {b.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {/* Navigation, one block per department */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
          {groups.map((group) => (
            <div key={group}>
              {groups.length > 1 && (
                <p className="px-3 pb-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground/80">{t(`admin.navGroup.${group}`)}</p>
              )}
              <div className="space-y-0.5">
                {visible
                  .filter((i) => i.group === group)
                  .map(({ href, label, icon: Icon }) => {
                    const active = href === activeHref;
                    return (
                      <Link
                        key={href}
                        href={href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                          active ? "bg-accent/15 text-accent-ink" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        {active && <span className="absolute inset-y-2 start-0 w-1 rounded-full bg-accent" />}
                        <Icon className="h-[18px] w-[18px] shrink-0" />
                        <span className="truncate">{t(label)}</span>
                      </Link>
                    );
                  })}
              </div>
            </div>
          ))}
        </nav>

        {/* Signed-in person */}
        <div className="p-4 border-t border-border shrink-0 space-y-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="h-10 w-10 shrink-0 rounded-full bg-accent/15 text-accent-ink flex items-center justify-center font-semibold">{initial}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p dir="ltr" className="text-[11px] text-muted-foreground truncate text-start">{user?.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              title={t("admin.sidebar.signOut")}
              aria-label={t("admin.sidebar.signOut")}
              className="h-9 w-9 shrink-0 flex items-center justify-center rounded-full text-muted-foreground hover:bg-danger/10 hover:text-danger transition-colors"
            >
              <LogOut className="h-4 w-4 rtl:rotate-180" />
            </button>
          </div>
          <p dir="ltr" className="text-[11px] tracking-wide text-muted-foreground text-center">
            Powered by <span className="font-semibold text-accent-ink">ORVYQ CO.</span>
          </p>
        </div>
      </aside>
    </>
  );
}
