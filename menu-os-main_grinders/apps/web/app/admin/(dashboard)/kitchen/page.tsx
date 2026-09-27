"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlarmClock, ArrowRight, Check, ChefHat, UtensilsCrossed } from "lucide-react";
import { useLocale } from "@/lib/LocaleContext";
import { useBranch } from "@/lib/BranchContext";
import { useRealtime } from "@/lib/useRealtime";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import type { BoardCard } from "@/lib/kitchen-board";

/**
 * THE KITCHEN BOARD.
 *
 *   STATUS = SECTION      four columns, one per order status the kitchen owns
 *   ORDER  = CARD         one card per order, headed by its TABLE NUMBER
 *   ONE   = BUTTON        the next thing that has to happen, nothing else to decide
 *
 * The old screen listed one card per station ticket, so a four-item order spanning
 * Grill and Hot Kitchen appeared as two cards with no shared identity, and the table
 * number was small grey text in a corner. A cook cannot work from that: the unit of
 * work is the order, and the thing they say out loud is the table number.
 *
 * Movement between columns is the server's job — pressing the button changes the
 * order's status, and the board refetches. Nothing is animated between columns here
 * because there is no local state to animate: a card is either in the data or it is
 * not. The refetch is triggered by the same realtime events the old screen already
 * listened to, plus the order events, so a card moves the instant its status changes
 * from anywhere in the app (a manager cancelling, a guest re-ordering) and not only
 * when the kitchen itself presses the button.
 */

type Section = { status: string; cards: BoardCard[] };

interface BoardPayload {
  sections: Section[];
  stations: Array<{ id: string; name: string }>;
}

const SECTION_META: Record<string, { title: string; hint: string; action: string; tone: string }> = {
  // One working column: every order lands here already received; the only button is "ready".
  CONFIRMED: { title: "admin.kitchen.board.received", hint: "admin.kitchen.board.receivedHint", action: "admin.kitchen.board.markReady", tone: "bg-amber-500/10 border-amber-500/30" },
  READY: { title: "admin.kitchen.board.ready", hint: "admin.kitchen.board.readyHint", action: "admin.kitchen.board.handOver", tone: "bg-emerald-500/10 border-emerald-500/30" },
  PAID: { title: "admin.kitchen.board.paid", hint: "admin.kitchen.board.paidHint", action: "admin.kitchen.board.paid", tone: "bg-violet-500/10 border-violet-500/30" },
};

export default function KitchenPage() {
  const { branchId } = useBranch();
  const { t } = useLocale();

  const [board, setBoard] = useState<BoardPayload | null>(null);
  // The station filter is kept from the previous screen — it is a real working feature
  // (each station works its own part of the menu) and it is the only way one board can
  // serve a grill and a dessert station at the same time.
  const [stationId, setStationId] = useState<string | null>(null);
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Re-fetching is the entire update mechanism, so it must not be able to interleave
  // with itself: a slow response to an older request landing after a newer one would
  // put a card back in the column it just left.
  const inflight = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    if (!branchId) return;
    inflight.current?.abort();
    const controller = new AbortController();
    inflight.current = controller;
    try {
      const qs = new URLSearchParams({ branchId });
      if (stationId) qs.set("stationId", stationId);
      const res = await fetch(`/api/kitchen/board?${qs}`, { signal: controller.signal });
      if (res.ok) setBoard(await res.json());
    } catch (err) {
      // An abort is this hook cancelling its own superseded request, not a failure.
      if (err instanceof Error && err.name === "AbortError") return;
      console.error(err);
    }
  }, [branchId, stationId]);

  useEffect(() => {
    refresh();
    return () => inflight.current?.abort();
  }, [refresh]);

  // Anything that can change what belongs on this board. `order.created` is a new
  // ticket; `order.status_changed` covers a manager cancelling and the cascade out of
  // the kitchen; `kitchen_order.updated` is this screen's own button press coming back.
  useRealtime(branchId ? [`branch:${branchId}`] : [], (event) => {
    if (["order.created", "order.status_changed", "kitchen_order.updated"].includes(event.type)) refresh();
  });

  async function advance(card: BoardCard) {
    setBusyOrderId(card.orderId);
    setError(null);
    try {
      const res = await fetch("/api/kitchen/board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: card.orderId, stationId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? t("admin.kitchen.board.advanceFailed"));
      }
      // Refetch unconditionally, including on failure: a rejected transition may still
      // have moved some of the order's tickets, and the board must show reality.
      await refresh();
    } finally {
      setBusyOrderId(null);
    }
  }

  const sections = board?.sections ?? [];
  const isEmpty = sections.every((s) => s.cards.length === 0);
  const stationName = board?.stations.find((s) => s.id === stationId)?.name;

  return (
    <div className="p-6 lg:p-8 max-w-[1800px]">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl font-semibold flex items-center gap-3">
            <ChefHat className="h-7 w-7 text-accent-ink" />
            {t("admin.kitchen.board.title")}
          </h1>
          {stationName && <p className="text-sm text-muted-foreground mt-1">{t("admin.kitchen.board.forStation", { station: stationName })}</p>}
        </div>

        <div className="flex flex-wrap gap-2">
          {/* aria-pressed, not just a colour change: the filter is a toggle group, and
              "which station am I looking at" is the one question on this screen that has
              no other answer on it. */}
          <button
            onClick={() => setStationId(null)}
            aria-pressed={!stationId}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm border transition-colors",
              !stationId ? "bg-accent text-accent-foreground border-accent-ink" : "border-border text-muted-foreground hover:bg-muted"
            )}
          >
            {t("admin.kitchen.allStations")}
          </button>
          {(board?.stations ?? []).map((s) => (
            <button
              key={s.id}
              onClick={() => setStationId(s.id === stationId ? null : s.id)}
              aria-pressed={stationId === s.id}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm border transition-colors",
                stationId === s.id ? "bg-accent text-accent-foreground border-accent-ink" : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              {s.name}
            </button>
          ))}
        </div>
      </header>

      {error && (
        <div role="alert" className="mb-4 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {isEmpty ? (
        <div className="rounded-2xl border border-dashed border-border py-20 text-center">
          <UtensilsCrossed className="h-10 w-10 mx-auto mb-4 text-muted-foreground/50" />
          <p className="font-semibold">{t("admin.kitchen.board.empty")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("admin.kitchen.board.emptyHint")}</p>
        </div>
      ) : (
        // The board shows every kitchen-owned order state, including the paid handoff.
        // Fit as many 12.5rem columns as the screen allows, so New → Queued → Cooking →
        // Ready sit side by side on a laptop too, instead of wrapping into a 2×2 grid
        // that pushed Cooking and Ready below the fold.
        <div className="grid grid-cols-[repeat(auto-fit,minmax(12.5rem,1fr))] gap-4 items-start">
          {sections.map((section) => {
            const meta = SECTION_META[section.status];
            return (
              <section key={section.status} className={cn("rounded-2xl border p-3 min-h-[12rem]", meta.tone)} aria-label={t(meta.title)}>
                <div className="flex items-baseline justify-between gap-2 px-1 pb-3">
                  <div>
                    <h2 className="font-display text-lg font-semibold leading-tight">{t(meta.title)}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{t(meta.hint)}</p>
                  </div>
                  <Badge tone={section.cards.length > 0 ? "accent" : "neutral"}>{section.cards.length}</Badge>
                </div>

                <div className="space-y-3">
                  {section.cards.map((card) => (
                    <OrderCard
                      key={card.orderId}
                      card={card}
                      actionLabel={t(meta.action)}
                      busy={busyOrderId === card.orderId}
                      onAdvance={() => advance(card)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * One order. The table number is the largest thing on the card and the only thing not
 * in a muted colour, because it is the only identifier a waiter and a cook will say
 * out loud to each other. The order ref is there for when two people need to be talking
 * about the same order on the phone.
 */
function OrderCard({ card, actionLabel, busy, onAdvance }: { card: BoardCard; actionLabel: string; busy: boolean; onAdvance: () => void }) {
  const { t } = useLocale();

  const heading = card.tableLabel ? `${t("admin.kitchen.board.table")} ${card.tableLabel}` : card.orderType === "PICKUP" ? t("admin.kitchen.board.pickup") : t("admin.kitchen.board.delivery");

  return (
    <Card className={cn("p-4 shadow-sm transition-shadow", card.delayed && "border-danger/50 ring-1 ring-danger/30")}>
      {/* The table label never breaks across lines ("Table" / "1"); on a narrow column
          the timer badge wraps under it instead. */}
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5 mb-3">
        <div className="min-w-0">
          <p className="font-display text-3xl font-bold leading-none tracking-tight whitespace-nowrap">{heading}</p>
          <p className="text-xs text-muted-foreground mt-1.5">
            {t("admin.kitchen.board.orderRef", { ref: card.orderRef })} · {t("admin.kitchen.board.placedAt", { time: new Date(card.placedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) })}
          </p>
        </div>
        <Badge tone={card.delayed ? "danger" : card.status === "READY" ? "success" : "neutral"} className="shrink-0">
          {card.delayed && <AlarmClock className="h-3 w-3" />}
          {t("admin.kitchen.minutes", { n: card.minutesWaiting })}
        </Badge>
      </div>

      <ul className="space-y-2.5 mb-3">
        {card.items.map((item) => (
          <li key={item.id} className="text-sm">
            <span className="font-semibold tabular-nums">{item.quantity}×</span> <span className="font-medium">{item.name}</span>
            {item.modifiers.length > 0 && <p className="text-xs text-muted-foreground mt-0.5 pl-5">{item.modifiers.join(" · ")}</p>}
            {item.notes && <p className="text-xs italic text-accent-ink mt-0.5 pl-5">“{item.notes}”</p>}
          </li>
        ))}
      </ul>

      {card.note && (
        <p className="text-xs bg-muted rounded-lg px-2.5 py-1.5 mb-3">
          <span className="font-semibold">{t("admin.kitchen.board.note")}: </span>
          {card.note}
        </p>
      )}

      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs text-muted-foreground truncate">
          {t("admin.kitchen.board.itemCount", { n: card.items.reduce((sum, i) => sum + i.quantity, 0) })}
          {card.stations.length > 0 && ` · ${t("admin.kitchen.board.stations")}: ${card.stations.map((s) => s.stationName).join(", ")}`}
        </span>
      </div>

      <Button size="md" className="w-full" onClick={onAdvance} loading={busy}>
        {card.status === "READY" ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
        {actionLabel}
      </Button>
    </Card>
  );
}
