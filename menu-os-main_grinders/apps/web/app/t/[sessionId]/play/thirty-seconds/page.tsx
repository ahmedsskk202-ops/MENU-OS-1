"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Trophy, Users, Zap } from "lucide-react";
import { useTableSession } from "@/lib/useTableSession";
import { useRealtime } from "@/lib/useRealtime";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

type Player = { id: string; customerSessionId: string; displayName: string; score: number; isReady: boolean };
type Round = {
  id: string;
  roundNumber: number;
  kind: "TRIVIA" | "VOTE" | "REACTION" | "TAP" | "MEMORY";
  category: string;
  prompt: string;
  timeLimitSeconds: number;
  startedAt: string | null;
  endedAt: string | null;
  meta: { acceptedAnswers?: string[]; revealDelayMs?: number; sequence?: number[] } | null;
  results: { gamePlayerId: string }[];
};

const MEMORY_SYMBOLS = ["●", "■", "▲", "★"];
type GameSession = { id: string; status: "LOBBY" | "IN_PROGRESS" | "COMPLETED"; players: Player[]; rounds: Round[] };

export default function ThirtySecondsGame() {
  const { data: session } = useTableSession();
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [answer, setAnswer] = useState("");
  const [now, setNow] = useState(Date.now());
  const [tapCount, setTapCount] = useState(0);
  const [memorySelections, setMemorySelections] = useState<number[]>([]);
  const [memoryPhase, setMemoryPhase] = useState<"watch" | "input">("watch");
  const [resetForRoundId, setResetForRoundId] = useState<string | null>(null);

  // Realtime events (game_round.started, etc.) can fire refresh() several times in
  // quick succession, and dev-mode StrictMode double-invokes the mount effect too —
  // nothing here guaranteed those fetches resolve in the order they were sent. Every
  // state-setting operation bumps this generation counter and checks it still owns the
  // latest generation before applying its response, so a slow, now-stale response (e.g.
  // from right before the game started) can never clobber newer state that already
  // landed (e.g. the completed game's final results).
  const stateGen = useRef(0);

  async function refresh() {
    const gen = ++stateGen.current;
    const res = await fetch("/api/game/state");
    if (!res.ok) return;
    const json = await res.json();
    if (gen !== stateGen.current) return;
    setGameSession(json.gameSession);
    if (json.gameSession) {
      const me = json.gameSession.players.find((p: Player) => p.customerSessionId === json.customerSessionId);
      setMyPlayerId(me?.id ?? null);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  useRealtime(session ? [`table-session:${session.tableSessionId}`] : [], (event) => {
    if (event.type === "game_session.updated") {
      stateGen.current++; // invalidate any in-flight refresh()/join() response older than this
      // Apply the pushed session directly instead of re-fetching: /api/game/state only
      // ever returns an active (LOBBY/IN_PROGRESS) session, so re-fetching right after
      // the session completes would race that filter and wipe the just-finished game
      // (with its final scores) back to null, bouncing the player to the join screen
      // instead of the results screen they just earned.
      setGameSession(event.gameSession as GameSession);
    } else if (event.type === "game_round.started" || event.type === "game_round.result") {
      refresh();
    }
  });

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  const currentRound = gameSession?.rounds?.[gameSession.rounds.length - 1];
  const roundActive = currentRound && !currentRound.endedAt;
  const remaining = useMemo(() => {
    if (!currentRound?.startedAt) return currentRound?.timeLimitSeconds ?? 30;
    const elapsed = (now - new Date(currentRound.startedAt).getTime()) / 1000;
    return Math.max(0, Math.ceil(currentRound.timeLimitSeconds - elapsed));
  }, [currentRound, now]);

  const iAlreadyAnswered = !!currentRound?.results.some((r) => r.gamePlayerId === myPlayerId);

  // Fresh local state for each new round — the round id is the reset key, not a
  // dependency array timing trick, so a realtime `refresh()` that lands mid-round
  // (e.g. another player's result) never wipes what I've already tapped/selected.
  useEffect(() => {
    if (currentRound && currentRound.id !== resetForRoundId) {
      setTapCount(0);
      setMemorySelections([]);
      setMemoryPhase("watch");
      setResetForRoundId(currentRound.id);
      if (currentRound.kind === "MEMORY") {
        const watchMs = 1200 + (currentRound.meta?.sequence?.length ?? 4) * 700;
        const t = setTimeout(() => setMemoryPhase("input"), watchMs);
        return () => clearTimeout(t);
      }
    }
  }, [currentRound, resetForRoundId]);

  const reactionRevealed =
    currentRound?.kind === "REACTION" && currentRound.startedAt && currentRound.meta?.revealDelayMs != null
      ? now >= new Date(currentRound.startedAt).getTime() + currentRound.meta.revealDelayMs
      : false;

  // TAP auto-submits the final count the instant time runs out — there's no separate
  // "submit" action for this round kind, matching the one-result-per-round model.
  useEffect(() => {
    if (currentRound?.kind === "TAP" && roundActive && remaining === 0 && !iAlreadyAnswered && myPlayerId) {
      submit(String(tapCount) || "0");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRound?.kind, roundActive, remaining, iAlreadyAnswered, myPlayerId, tapCount]);

  async function join() {
    if (!displayName.trim()) return;
    const gen = ++stateGen.current;
    const res = await fetch("/api/game/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: displayName.trim() }),
    });
    const json = await res.json();
    if (gen !== stateGen.current) return;
    setGameSession(json.gameSession);
    const me = json.gameSession.players.find((p: Player) => p.customerSessionId === json.customerSessionId);
    setMyPlayerId(me?.id ?? null);
  }

  async function toggleReady() {
    if (!gameSession || !myPlayerId) return;
    const me = gameSession.players.find((p) => p.id === myPlayerId)!;
    await fetch("/api/game/ready", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameSessionId: gameSession.id, gamePlayerId: myPlayerId, isReady: !me.isReady }),
    });
  }

  async function startGame() {
    if (!gameSession) return;
    await fetch("/api/game/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameSessionId: gameSession.id }),
    });
  }

  async function submit(value: string) {
    if (!currentRound || !myPlayerId || !value.trim()) return;
    await fetch("/api/game/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameRoundId: currentRound.id, gamePlayerId: myPlayerId, answer: value.trim() }),
    });
    setAnswer("");
  }

  if (!session) return null;

  // Not joined yet.
  if (!gameSession || !myPlayerId) {
    return (
      <div className="mx-auto max-w-lg px-5 pt-8">
        <h1 className="font-display text-2xl font-semibold mb-1">30-Second Challenge</h1>
        <p className="text-sm text-muted-foreground mb-6">Enter a name everyone at the table will see.</p>
        <Card className="p-6">
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            maxLength={40}
            className="w-full rounded-xl border border-border bg-surface-raised px-4 py-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button size="lg" className="w-full" onClick={join} disabled={!displayName.trim()}>
            Join Game
          </Button>
        </Card>
      </div>
    );
  }

  // Lobby.
  if (gameSession.status === "LOBBY") {
    const me = gameSession.players.find((p) => p.id === myPlayerId)!;
    return (
      <div className="mx-auto max-w-lg px-5 pt-8">
        <h1 className="font-display text-2xl font-semibold mb-1">Game Lobby</h1>
        <p className="text-sm text-muted-foreground mb-6 flex items-center gap-1.5">
          <Users className="h-4 w-4" /> {gameSession.players.length} joined
        </p>
        <div className="space-y-2 mb-6">
          {gameSession.players.map((p) => (
            <Card key={p.id} className="p-4 flex items-center justify-between">
              <span className="font-medium text-sm">{p.displayName}</span>
              <Badge tone={p.isReady ? "success" : "neutral"}>{p.isReady ? "Ready" : "Not ready"}</Badge>
            </Card>
          ))}
        </div>
        <Button size="lg" variant={me.isReady ? "secondary" : "primary"} className="w-full mb-3" onClick={toggleReady}>
          {me.isReady ? "Not Ready" : "I'm Ready"}
        </Button>
        <Button size="lg" variant="outline" className="w-full" onClick={startGame} disabled={gameSession.players.length < 2}>
          Start Game ({gameSession.players.length}/2+)
        </Button>
      </div>
    );
  }

  // Completed.
  if (gameSession.status === "COMPLETED") {
    const ranked = [...gameSession.players].sort((a, b) => b.score - a.score);
    return (
      <div className="mx-auto max-w-lg px-5 pt-8">
        <h1 className="font-display text-2xl font-semibold mb-6 flex items-center gap-2">
          <Trophy className="h-6 w-6 text-accent-ink" /> Final Results
        </h1>
        <div className="space-y-2">
          {ranked.map((p, i) => (
            <Card key={p.id} className={cn("p-4 flex items-center justify-between", i === 0 && "border-accent-ink/50 bg-accent/10")}>
              <span className="font-semibold flex items-center gap-2">
                <span className="text-muted-foreground w-5">#{i + 1}</span>
                {p.displayName}
              </span>
              <span className="font-display font-bold">{p.score} pts</span>
            </Card>
          ))}
        </div>
        <Button size="lg" className="w-full mt-6" onClick={join}>
          Play Again
        </Button>
      </div>
    );
  }

  // In progress.
  return (
    <div className="mx-auto max-w-lg px-5 pt-8">
      <div className="flex items-center justify-between mb-6">
        <Badge tone="accent">Round {currentRound?.roundNumber} / 5</Badge>
        <div className={cn("flex items-center gap-1.5 font-display font-bold text-2xl", remaining <= 10 && "text-danger")}>
          <Zap className="h-5 w-5" /> {remaining}s
        </div>
      </div>

      <Card className="p-6 mb-5 text-center">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{currentRound?.category}</p>
        <p className="font-display text-xl font-semibold">{currentRound?.prompt}</p>
      </Card>

      {iAlreadyAnswered || !roundActive ? (
        <div className="text-center py-10 text-muted-foreground">
          <p className="font-medium">
            {roundActive ? "Answer submitted — waiting for others..." : "Round ended. Next round starting..."}
          </p>
        </div>
      ) : currentRound?.kind === "TRIVIA" ? (
        <div className="flex gap-2">
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit(answer)}
            placeholder="Type your answer"
            autoFocus
            className="flex-1 rounded-xl border border-border bg-surface-raised px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button onClick={() => submit(answer)} disabled={!answer.trim()}>
            Submit
          </Button>
        </div>
      ) : currentRound?.kind === "VOTE" ? (
        <div className="grid grid-cols-2 gap-3">
          {gameSession.players.map((p) => (
            <button
              key={p.id}
              onClick={() => submit(p.id)}
              className="rounded-xl border border-border bg-surface-raised p-4 text-sm font-semibold hover:border-accent-ink/50 active:scale-[0.97] transition-all"
            >
              {p.displayName}
            </button>
          ))}
        </div>
      ) : currentRound?.kind === "REACTION" ? (
        <button
          onClick={() => reactionRevealed && submit("tap")}
          disabled={!reactionRevealed}
          className={cn(
            "w-full h-40 rounded-2xl font-display text-2xl font-bold transition-colors active:scale-[0.98]",
            reactionRevealed ? "bg-success text-background" : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {reactionRevealed ? "TAP NOW!" : "Wait for it..."}
        </button>
      ) : currentRound?.kind === "TAP" ? (
        <div className="text-center">
          <button
            onClick={() => setTapCount((c) => c + 1)}
            className="w-full h-40 rounded-2xl bg-accent text-accent-foreground font-display text-2xl font-bold active:scale-[0.98] transition-transform select-none"
          >
            TAP!
          </button>
          <p className="mt-4 font-display text-3xl font-bold">{tapCount}</p>
        </div>
      ) : currentRound?.kind === "MEMORY" ? (
        <div>
          {memoryPhase === "watch" ? (
            <div className="flex justify-center gap-3 py-8">
              {(currentRound.meta?.sequence ?? []).map((symbolIndex, i) => (
                <div key={i} className="h-14 w-14 rounded-xl bg-accent/15 border border-accent-ink/40 flex items-center justify-center text-2xl animate-fade-up">
                  {MEMORY_SYMBOLS[symbolIndex - 1]}
                </div>
              ))}
            </div>
          ) : (
            <>
              <p className="text-center text-xs text-muted-foreground mb-3">Repeat the sequence — {memorySelections.length} / {currentRound.meta?.sequence?.length ?? 0}</p>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {MEMORY_SYMBOLS.map((symbol, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const next = [...memorySelections, i + 1];
                      setMemorySelections(next);
                      if (next.length >= (currentRound.meta?.sequence?.length ?? 0)) submit(next.join(","));
                    }}
                    className="h-16 rounded-xl border border-border bg-surface-raised text-2xl hover:border-accent-ink/50 active:scale-95 transition-all"
                  >
                    {symbol}
                  </button>
                ))}
              </div>
              <div className="flex justify-center gap-2">
                {memorySelections.map((s, i) => (
                  <span key={i} className="h-8 w-8 rounded-lg bg-accent/15 flex items-center justify-center text-sm">
                    {MEMORY_SYMBOLS[s - 1]}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      ) : null}

      <div className="mt-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Leaderboard</p>
        <div className="space-y-1.5">
          {[...gameSession.players]
            .sort((a, b) => b.score - a.score)
            .map((p) => (
              <div key={p.id} className="flex justify-between text-sm py-1">
                <span className={p.id === myPlayerId ? "font-semibold" : ""}>{p.displayName}</span>
                <span className="text-muted-foreground">{p.score} pts</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
