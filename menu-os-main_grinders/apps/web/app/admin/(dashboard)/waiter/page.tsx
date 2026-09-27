"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { AlertCircle, BellRing, Check, ConciergeBell, HandPlatter, Printer } from "lucide-react";
import { useLocale } from "@/lib/LocaleContext";
import { useBranch } from "@/lib/BranchContext";
import { useRealtime } from "@/lib/useRealtime";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";
import { ReceiptPrint } from "@/components/customer/ReceiptPrint";
import type { FloorCall, FloorOrder } from "@/lib/waiter-floor";

/**
 * THE WAITER'S PAGE.
 *
 * Two columns, table number enormous in both, and one button each. Everything else
 * about the staff console is deliberately not here: a waiter walking the floor with
 * two plates has one question at a time — "what is ready, and who is calling?" — and
 * every other panel on a dashboard is a thing to read past.
 *
 * The receipt printer is on this screen, not behind a menu, because a waiter is the
 * person who actually hands the guest their bill and the guest is standing there.
 *
 * Everything is live: `order.status_changed` is what puts a card in the Ready column
 * the instant the kitchen presses its last button, and `waiter_request.created` is
 * what puts a table in the Calls column the instant a guest presses the button on
 * their phone. Neither needs a refresh, and neither polls.
 */
export default function WaiterPage() {
  const { branchId } = useBranch();
  const { t } = useLocale();
  const { data: session } = useSession();

  const [readyToServe, setReadyToServe] = useState<FloorOrder[]>([]);
  const [tableCalls, setTableCalls] = useState<FloorCall[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Same guard as the kitchen board: a stale response landing after a newer one would
  // put a card back in a column it just left, or resurrect a call already answered.
  const inflight = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    if (!branchId) return;
    inflight.current?.abort();
    const controller = new AbortController();
    inflight.current = controller;
    try {
      const res = await fetch(`/api/waiter/floor?branchId=${branchId}`, { signal: controller.signal });
      if (res.ok) {
        const body = await res.json();
        setReadyToServe(body.readyToServe ?? []);
        setTableCalls(body.tableCalls ?? []);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      console.error(err);
    }
  }, [branchId]);

  useEffect(() => {
    refresh();
    return () => inflight.current?.abort();
  }, [refresh]);

  useRealtime(branchId ? [`branch:${branchId}`] : [], (event) => {
    if (["order.status_changed", "order.created", "waiter_request.created", "waiter_request.updated"].includes(event.type)) refresh();
  });

  async function serve(order: FloorOrder) {
    setBusyId(order.orderId);
    setError(null);
    try {
      const res = await fetch("/api/waiter/floor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.orderId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? t("admin.waiterPage.markFailed"));
      }
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function answer(call: FloorCall) {
    setBusyId(call.requestId);
    setError(null);
    try {
      // The existing, already-working endpoint. Reusing it rather than adding a second
      // path to the same state is what keeps the Waiter Requests screen (which a
      // manager still has) in agreement with this one.
      const res = await fetch(`/api/waiter-requests/${call.requestId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "COMPLETED" }) });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? t("admin.waiterPage.markFailed"));
      }
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  const name = (session?.user as { name?: string } | undefined)?.name;

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold flex items-center gap-3">
          <ConciergeBell className="h-7 w-7 text-accent-ink" />
          {t("admin.waiterPage.title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t("admin.waiterPage.subtitle")}</p>
        {name && <p className="text-xs text-muted-foreground mt-1">{t("admin.waiterPage.signedInAs", { name })}</p>}
      </header>

      {error && (
        <div role="alert" className="mb-4 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <Column
          title={t("admin.waiterPage.readyToServe")}
          hint={t("admin.waiterPage.readyHint")}
          icon={<HandPlatter className="h-5 w-5 text-accent-ink" />}
          count={readyToServe.length}
          empty={t("admin.waiterPage.noReady")}
        >
          {readyToServe.map((order) => (
            <ReadyCard key={order.orderId} order={order} busy={busyId === order.orderId} onServe={() => serve(order)} />
          ))}
        </Column>

        <Column
          title={t("admin.waiterPage.tableCalls")}
          hint={t("admin.waiterPage.callsHint")}
          icon={<BellRing className="h-5 w-5 text-accent-ink" />}
          count={tableCalls.length}
          empty={t("admin.waiterPage.noCalls")}
          urgent
        >
          {tableCalls.map((call) => (
            <CallCard key={call.requestId} call={call} busy={busyId === call.requestId} onAnswer={() => answer(call)} />
          ))}
        </Column>
      </div>
    </div>
  );
}

function Column({ title, hint, icon, count, empty, urgent, children }: { title: string; hint: string; icon: React.ReactNode; count: number; empty: string; urgent?: boolean; children: React.ReactNode }) {
  const childrenArray = Array.isArray(children) ? children : [children];
  const isEmpty = childrenArray.length === 0 || (childrenArray.length === 1 && !childrenArray[0]);

  return (
    <section>
      <div className="flex items-center gap-2.5 mb-1">
        {icon}
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        {/* Live count, not a decorative one: a waiter glances at this to decide
            whether to walk the room or stand still. */}
        <Badge tone={count > 0 ? (urgent ? "danger" : "success") : "neutral"}>{count}</Badge>
      </div>
      <p className="text-xs text-muted-foreground mb-3">{hint}</p>

      {isEmpty ? (
        <div className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">{empty}</div>
      ) : (
        <div className="space-y-3">{children}</div>
      )}
    </section>
  );
}

/** An order the kitchen has handed over. The table number is the headline, by a mile. */
function ReadyCard({ order, busy, onServe }: { order: FloorOrder; busy: boolean; onServe: () => void }) {
  const { t } = useLocale();
  const heading = order.tableLabel ?? (order.orderType === "PICKUP" ? t("admin.kitchen.board.pickup") : t("admin.kitchen.board.delivery"));

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-4xl font-bold leading-none tracking-tight">{heading}</p>
          <p className="text-xs text-muted-foreground mt-1.5">
            {t("admin.kitchen.board.orderRef", { ref: order.orderRef })} · {t("admin.waiterPage.readyFor", { minutes: order.readyMinutesAgo })}
          </p>
        </div>
        {/* Waiting longest is the one that should go first, and it is the one a
            manager scanning over a waiter's shoulder needs to be able to see. */}
        <Badge tone={order.readyMinutesAgo >= 5 ? "danger" : "success"} className="shrink-0">
          {t("admin.waiterPage.readyFor", { minutes: order.readyMinutesAgo })}
        </Badge>
      </div>

      <ul className="mt-3 space-y-1 text-sm">
        {order.items.map((item, i) => (
          <li key={i}>
            <span className="font-semibold tabular-nums">{item.quantity}×</span> <span>{item.name}</span>
            {item.modifiers.length > 0 && <span className="text-muted-foreground"> · {item.modifiers.join(", ")}</span>}
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-border">
        <span className="text-xs text-muted-foreground">
          {t("admin.waiterPage.items", { n: order.itemCount })} · {formatMoney(order.total, order.currency)}
        </span>
        <ReceiptPrint
          label={t("admin.waiterPage.printReceipt")}
          icon={<Printer className="h-4 w-4" />}
          className="h-9 px-3 text-sm"
          receipt={{
            brandName: order.receipt.brandName,
            branchName: order.receipt.branchName,
            address: order.receipt.address ?? undefined,
            phone: order.receipt.phone ?? undefined,
            // The single most important line on a cafe slip, and the reason this
            // component exists at all: the guest is holding it at a table.
            tableLabel: order.tableLabel ?? undefined,
            orderNumber: order.orderRef,
            issuedAt: new Date().toISOString(),
            currency: order.currency,
            items: order.items.map((i) => ({ name: i.name, quantity: i.quantity, lineTotal: i.lineTotal, modifiers: i.modifiers })),
            subtotal: order.total,
            total: order.total,
          }}
        />
      </div>

      <Button size="lg" className="w-full mt-3" onClick={onServe} loading={busy}>
        <Check className="h-5 w-5" />
        {t("admin.waiterPage.serve")}
      </Button>
    </Card>
  );
}

/** A table that pressed the button on their phone. */
function CallCard({ call, busy, onAnswer }: { call: FloorCall; busy: boolean; onAnswer: () => void }) {
  const { t } = useLocale();
  const heading = call.tableLabel ?? "—";

  return (
    <Card className={cn("p-4", call.waitingMinutes >= 3 && "border-danger/50 ring-1 ring-danger/30")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-4xl font-bold leading-none tracking-tight">{heading}</p>
          <p className="text-sm font-medium mt-2">{t(`admin.waiter.type.${call.type}`)}</p>
          {call.note && <p className="text-xs text-muted-foreground mt-1">“{call.note}”</p>}
        </div>
        <Badge tone={call.waitingMinutes >= 3 ? "danger" : "warning"} className="shrink-0">
          {t("admin.waiter.waiting", { n: call.waitingMinutes })}
        </Badge>
      </div>

      <Button size="lg" className="w-full mt-4" variant="secondary" onClick={onAnswer} loading={busy}>
        <Check className="h-5 w-5" />
        {t("admin.waiter.complete")}
      </Button>
    </Card>
  );
}
