"use client";

import Link from "next/link";
import { LockKeyhole, Gamepad2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useLocale } from "@/lib/LocaleContext";
import { useGuestMenu } from "@/lib/useGuestMenu";
import { GAME_REGISTRY } from "@/lib/games/registry";

const GAME_CARDS = Object.values(GAME_REGISTRY).map((def) => ({
  key: def.key,
  nameKey: def.nameKey,
  descriptionKey: def.descriptionKey,
  minPlayers: def.minPlayers,
}));

export default function GuestPlayPage({ params }: { params: { branchId: string } }) {
  const { t } = useLocale();
  const { menu } = useGuestMenu(params.branchId);

  return (
    <div className="mx-auto max-w-lg px-5 pt-8">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent-ink/30 bg-accent/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-accent-ink">
          <Gamepad2 className="h-3.5 w-3.5" />
          {t("games.hub.title")}
        </div>
        <h1 className="font-display text-2xl font-semibold">{menu?.brand.name ?? "The Grinders"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("games.hub.subtitle")}</p>
      </header>

      <div className="rounded-2xl border border-dashed border-border bg-surface-raised/70 p-4 text-sm text-muted-foreground">
        <div className="mb-3 flex items-center gap-2 text-accent-ink">
          <LockKeyhole className="h-4 w-4" />
          <span className="font-semibold">Live table games</span>
        </div>
        <p>
          The full mini-game lobby unlocks when a guest scans a table QR code and starts a table session.
          This branch flow keeps the menu and ordering flow separate, but the same games are available at the table.
        </p>
      </div>

      <div className="mt-6 space-y-2.5">
        {GAME_CARDS.map((game) => (
          <div
            key={game.key}
            className="rounded-2xl border border-border bg-card/50 p-4 opacity-80"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-display text-lg font-semibold">{t(game.nameKey)}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t(game.descriptionKey)}</p>
              </div>
              <span className="rounded-full border border-border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {game.minPlayers <= 1 ? t("games.playersSolo") : t("games.playersMin", { n: game.minPlayers })}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Link
          href={`/m/${params.branchId}`}
          className="inline-flex items-center rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground"
        >
          Back to the menu
        </Link>
      </div>
    </div>
  );
}
