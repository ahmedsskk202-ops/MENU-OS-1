"use client";

import Link from "next/link";
import { Timer, Trophy, Zap, Brain, Vote, Grid3x3, Drama, Sparkles, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useLocale } from "@/lib/LocaleContext";
import { GAME_REGISTRY } from "@/lib/games/registry";

const ICONS = { Timer, Trophy, Zap, Brain, Vote, Grid3x3, Drama, Sparkles, Users } as const;

const GAME_CARDS = [
  { href: "thirty-seconds", nameKey: "games.thirtySecond.name", descriptionKey: "games.thirtySecond.description", icon: "Timer" as const, minPlayers: 2 },
  ...Object.values(GAME_REGISTRY).map((def) => ({
    href: def.key,
    nameKey: def.nameKey,
    descriptionKey: def.descriptionKey,
    icon: def.icon,
    minPlayers: def.minPlayers,
  })),
];

export default function PlayLobby({ params }: { params: { sessionId: string } }) {
  const { t } = useLocale();

  return (
    <div className="mx-auto max-w-lg px-5 pt-8">
      <h1 className="font-display text-2xl font-semibold mb-1">{t("games.hub.title")}</h1>
      <p className="text-sm text-muted-foreground mb-6">{t("games.hub.subtitle")}</p>

      <div className="space-y-2.5">
        {GAME_CARDS.map((game) => {
          const Icon = ICONS[game.icon];
          return (
            <Link key={game.href} href={`/t/${params.sessionId}/play/${game.href}`}>
              <Card className="p-5 flex items-center gap-4 hover:border-accent-ink/40 transition-colors bg-gradient-to-br from-accent/15 to-transparent border-accent-ink/30">
                <div className="h-14 w-14 shrink-0 rounded-2xl bg-accent/20 flex items-center justify-center">
                  <Icon className="h-7 w-7 text-accent-ink" />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-lg font-semibold truncate">{t(game.nameKey)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t(game.descriptionKey)}</p>
                  <p className="text-[11px] text-accent-ink mt-1 font-semibold">{game.minPlayers <= 1 ? t("games.playersSolo") : t("games.playersMin", { n: game.minPlayers })}</p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
