// Generalized session/round/timer/realtime engine for every NEW Game Platform game.
// Deliberately parallel to (not a rewrite of) lib/game.ts, which continues to serve
// ONLY the original "thirty-second-challenge" exactly as before — this module reuses
// the same proven shape (Game/GameSession/GamePlayer/GameRound/GameResult, in-memory
// round timers, realtime broadcast via emitToTableSession) but drives it from the
// registry in lib/games/registry.ts instead of hardcoded rounds, so a brand-new game
// only ever needs a new registry entry (see lib/games/registry.ts's own header comment).
import { prisma } from "@/lib/db";
import { json, readJson } from "@menu-os/db";
import { decodeGamePayload, decodeGamePayloadList } from "../game-payload";
import { emitToTableSession } from "@/lib/realtime";
import { scoreReaction, scoreTap, scoreMemory, parseMemoryAnswer, scoreMcq, scoreCategorySprint, tallyVotes } from "@/lib/game-scoring";
import { generateMemorySequence } from "@/lib/game-questions";
import type { Locale } from "@/lib/i18n";
import { isCategorySprintItemValid } from "./content";
import { getGameDefinition, REACTION_REVEAL_RANGE, type RoundBlueprint } from "./registry";

const roundTimers = new Map<string, NodeJS.Timeout>();

/** The content language for a game session is decided once, server-side, from the
 *  table's brand — never per-viewing-device — because a single round's prompt is
 *  broadcast to and shared by every player at the table; letting each device's own
 *  locale toggle fork the content would mean two players see two different questions
 *  for what's supposed to be one shared round. */
async function resolveSessionLocale(tableSessionId: string): Promise<Locale> {
  const tableSession = await prisma.tableSession.findUniqueOrThrow({
    where: { id: tableSessionId },
    include: { table: { include: { branch: { include: { brand: true } } } } },
  });
  return tableSession.table.branch.brand.defaultLocale === "en" ? "en" : "ar";
}

async function ensureGame(gameKey: string) {
  const def = getGameDefinition(gameKey);
  if (!def) throw new Error(`Unknown game: ${gameKey}`);
  return prisma.game.upsert({
    where: { key: def.key },
    create: { key: def.key, name: def.key, isActive: true },
    update: {},
  });
}

export async function joinGame(gameKey: string, tableSessionId: string, customerSessionId: string, displayName: string) {
  const game = await ensureGame(gameKey);

  let gameSession = await prisma.gameSession.findFirst({
    where: { tableSessionId, gameId: game.id, status: "LOBBY" },
    include: { players: true },
  });

  if (!gameSession) {
    gameSession = await prisma.gameSession.create({
      data: { tableSessionId, gameId: game.id, status: "LOBBY" },
      include: { players: true },
    });
  }

  const existingPlayer = gameSession.players.find((p) => p.customerSessionId === customerSessionId);
  if (!existingPlayer) {
    await prisma.gamePlayer.create({ data: { gameSessionId: gameSession.id, customerSessionId, displayName } });
  }

  const full = await getFullGameSession(gameSession.id);
  emitToTableSession(tableSessionId, { type: "game_session.updated", tableSessionId, gameSession: full });
  return full;
}

export async function setPlayerReady(gameSessionId: string, gamePlayerId: string, isReady: boolean) {
  await prisma.gamePlayer.update({ where: { id: gamePlayerId }, data: { isReady } });
  const full = await getFullGameSession(gameSessionId);
  emitToTableSession(full.tableSessionId, { type: "game_session.updated", tableSessionId: full.tableSessionId, gameSession: full });
  return full;
}

export async function startGame(gameSessionId: string) {
  const session = await prisma.gameSession.findUniqueOrThrow({ where: { id: gameSessionId }, include: { players: true, game: true } });
  if (session.status !== "LOBBY") throw new Error("Game already started");

  const def = getGameDefinition(session.game.key);
  if (!def) throw new Error(`Unknown game: ${session.game.key}`);
  if (session.players.length < def.minPlayers) throw new Error(`Need at least ${def.minPlayers} player${def.minPlayers > 1 ? "s" : ""} to start`);

  const locale = await resolveSessionLocale(session.tableSessionId);
  const plan = def.buildRoundPlan(session.players, locale);
  await prisma.gameSession.update({
    where: { id: gameSessionId },
    data: { status: "IN_PROGRESS", startedAt: new Date(), roundPlan: json(plan) },
  });
  await startRound(gameSessionId, 1, plan);
}

async function startRound(gameSessionId: string, roundNumber: number, remainingPlan: RoundBlueprint[]) {
  const blueprint = remainingPlan[0];

  let meta: Record<string, unknown> = blueprint.meta;
  if (blueprint.kind === "REACTION") {
    meta = { revealDelayMs: REACTION_REVEAL_RANGE.min + Math.floor(Math.random() * (REACTION_REVEAL_RANGE.max - REACTION_REVEAL_RANGE.min)) };
  } else if (blueprint.kind === "MEMORY") {
    meta = { sequence: generateMemorySequence() };
  }

  const round = await prisma.gameRound.create({
    data: {
      gameSessionId,
      roundNumber,
      kind: blueprint.kind,
      category: blueprint.category,
      prompt: blueprint.prompt,
      meta: json(meta),
      timeLimitSeconds: blueprint.timeLimitSeconds,
      startedAt: new Date(),
    },
  });

  // Impostor: write each player's private role/word now that the round (and its id)
  // exists — never included in `meta`, so it's never part of the broadcast payload below.
  if (blueprint.secretsByPlayerId) {
    await prisma.gameRoundSecret.createMany({
      data: Object.entries(blueprint.secretsByPlayerId).map(([gamePlayerId, data]) => ({
        gameRoundId: round.id,
        gamePlayerId,
        data: json(data) ?? "{}",
      })),
    });
  }

  const session = await prisma.gameSession.findUniqueOrThrow({ where: { id: gameSessionId } });
  // `meta` is JSON text in the database; the broadcast and the /api/game/state
  // response have always carried an object, so decode on the way out.
  emitToTableSession(session.tableSessionId, { type: "game_round.started", tableSessionId: session.tableSessionId, round: { ...round, meta: decodeGamePayload(round.meta) } });

  const timer = setTimeout(() => {
    closeRound(round.id, remainingPlan.slice(1)).catch((err) => console.error("[games/engine] closeRound failed", err));
  }, blueprint.timeLimitSeconds * 1000);
  roundTimers.set(round.id, timer);

  return round;
}

export async function submitAnswer(gameRoundId: string, gamePlayerId: string, rawAnswer: string) {
  const round = await prisma.gameRound.findUniqueOrThrow({
    where: { id: gameRoundId },
    include: { gameSession: { include: { players: true, game: true } } },
  });
  if (round.endedAt) throw new Error("This round has already ended");

  const existing = await prisma.gameResult.findUnique({ where: { gameRoundId_gamePlayerId: { gameRoundId, gamePlayerId } } });
  if (existing) throw new Error("You already answered this round");

  let responseTimeMs = round.startedAt ? Date.now() - round.startedAt.getTime() : 0;
  let isCorrect: boolean | null = null;
  let points = 0;

  // `round.meta` is JSON text in SQLite — every branch below decodes it; casting it
  // directly made every correct answer score zero.
  if (round.kind === "TRIVIA") {
    const meta = readJson<{ acceptedAnswers: string[] }>(round.meta);
    const normalized = rawAnswer.trim().toLowerCase();
    isCorrect = (meta?.acceptedAnswers ?? []).some((a) => a === normalized || normalized.includes(a));
    points = isCorrect ? Math.max(50, 100 - Math.floor(responseTimeMs / 300)) : 0;
  } else if (round.kind === "MCQ") {
    const meta = readJson<{ correctIndex: number }>(round.meta);
    const scored = scoreMcq(meta?.correctIndex ?? -1, Number(rawAnswer), responseTimeMs);
    isCorrect = scored.isCorrect;
    points = scored.points;
  } else if (round.kind === "CATEGORY_SPRINT") {
    const meta = readJson<{ acceptedItems: string[] }>(round.meta);
    const scored = scoreCategorySprint(rawAnswer, (item) => isCategorySprintItemValid({ id: "", category: "", acceptedItems: meta?.acceptedItems ?? [] }, item));
    isCorrect = scored.isCorrect;
    points = scored.points;
  } else if (round.kind === "REACTION") {
    const meta = readJson<{ revealDelayMs: number }>(round.meta);
    const scored = scoreReaction(round.startedAt!.getTime(), meta?.revealDelayMs ?? 0, Date.now());
    isCorrect = scored.isCorrect;
    points = scored.points;
    responseTimeMs = scored.responseTimeMs;
  } else if (round.kind === "TAP") {
    const scored = scoreTap(rawAnswer);
    isCorrect = scored.isCorrect;
    points = scored.points;
  } else if (round.kind === "MEMORY") {
    const meta = readJson<{ sequence: number[] }>(round.meta);
    const scored = scoreMemory(meta?.sequence ?? [], parseMemoryAnswer(rawAnswer));
    isCorrect = scored.isCorrect;
    points = scored.points;
  }
  // VOTE, IMPOSTOR_CLUE and IMPOSTOR_VOTE are scored once, after everyone has answered,
  // in closeRound() — same deferred-scoring pattern as the original VOTE kind.

  const result = await prisma.gameResult.create({
    data: { gameRoundId, gamePlayerId, answer: rawAnswer, isCorrect, isTimeout: false, pointsAwarded: points, responseTimeMs, answeredAt: new Date() },
  });

  if (points > 0) {
    await prisma.gamePlayer.update({ where: { id: gamePlayerId }, data: { score: { increment: points } } });
  }

  emitToTableSession(round.gameSession.tableSessionId, { type: "game_round.result", tableSessionId: round.gameSession.tableSessionId, result });

  const answeredCount = await prisma.gameResult.count({ where: { gameRoundId } });
  if (answeredCount >= round.gameSession.players.length) {
    const timer = roundTimers.get(gameRoundId);
    if (timer) {
      clearTimeout(timer);
      roundTimers.delete(gameRoundId);
    }
    // submitAnswer doesn't have startRound's closure over "what's left to play," so it
    // re-derives that from the session's durable roundPlan (written once at startGame)
    // rather than re-running the registry's random selection — re-running it here would
    // both diverge from what actually started and risk reselecting an already-used
    // question within this same session.
    const fullPlan = decodeGamePayloadList<RoundBlueprint>(round.gameSession.roundPlan);
    const roundsSoFar = await prisma.gameRound.count({ where: { gameSessionId: round.gameSessionId } });
    await closeRound(gameRoundId, fullPlan.slice(roundsSoFar));
  }

  return result;
}

async function closeRound(gameRoundId: string, remainingPlan: RoundBlueprint[]) {
  const round = await prisma.gameRound.findUnique({ where: { id: gameRoundId }, include: { gameSession: { include: { players: true } }, results: true } });
  if (!round || round.endedAt) return;

  await prisma.gameRound.update({ where: { id: gameRoundId }, data: { endedAt: new Date() } });

  const answeredPlayerIds = new Set(round.results.map((r) => r.gamePlayerId));
  const missing = round.gameSession.players.filter((p) => !answeredPlayerIds.has(p.id));
  for (const player of missing) {
    await prisma.gameResult.create({
      data: { gameRoundId, gamePlayerId: player.id, isCorrect: round.kind === "TRIVIA" || round.kind === "MCQ" ? false : null, isTimeout: true, pointsAwarded: 0 },
    });
  }

  if (round.kind === "VOTE") {
    const allResults = await prisma.gameResult.findMany({ where: { gameRoundId } });
    const { winners } = tallyVotes(allResults);
    for (const winnerId of winners) {
      await prisma.gamePlayer.update({ where: { id: winnerId }, data: { score: { increment: 50 } } });
      await prisma.gameResult.updateMany({ where: { gameRoundId, gamePlayerId: winnerId }, data: { pointsAwarded: 50 } });
    }
  } else if (round.kind === "IMPOSTOR_VOTE") {
    await scoreImpostorVote(round.gameSessionId, round.roundNumber, gameRoundId);
  }

  emitToTableSession(round.gameSession.tableSessionId, {
    type: "game_session.updated",
    tableSessionId: round.gameSession.tableSessionId,
    gameSession: await getFullGameSession(round.gameSessionId),
  });

  if (remainingPlan.length === 0) {
    await prisma.gameSession.update({ where: { id: round.gameSessionId }, data: { status: "COMPLETED", endedAt: new Date() } });
    emitToTableSession(round.gameSession.tableSessionId, {
      type: "game_session.updated",
      tableSessionId: round.gameSession.tableSessionId,
      gameSession: await getFullGameSession(round.gameSessionId),
    });
    return;
  }

  await startRound(round.gameSessionId, round.roundNumber + 1, remainingPlan);
}

/** The impostor's identity for a match lives only in GameRoundSecret rows on the
 *  preceding IMPOSTOR_CLUE round — never in any broadcast round.meta — so scoring has
 *  to look it up there rather than trust anything already sent to a client. */
async function scoreImpostorVote(gameSessionId: string, voteRoundNumber: number, voteRoundId: string) {
  const clueRound = await prisma.gameRound.findUnique({ where: { gameSessionId_roundNumber: { gameSessionId, roundNumber: voteRoundNumber - 1 } } });
  if (!clueRound) return;
  const secrets = await prisma.gameRoundSecret.findMany({ where: { gameRoundId: clueRound.id } });
  // `data` is JSON text since the move to SQLite; cast raw, `.role` was always undefined
  // and the impostor was never found, so catching them scored nothing.
  const impostorSecret = secrets.find((s) => readJson<{ role?: string }>(s.data)?.role === "IMPOSTOR");
  if (!impostorSecret) return;
  const impostorPlayerId = impostorSecret.gamePlayerId;

  const votes = await prisma.gameResult.findMany({ where: { gameRoundId: voteRoundId } });
  const { winners } = tallyVotes(votes);
  const caught = winners.length === 1 && winners[0] === impostorPlayerId;

  if (caught) {
    const correctVoters = votes.filter((v) => v.answer === impostorPlayerId).map((v) => v.gamePlayerId);
    for (const voterId of correctVoters) {
      await prisma.gamePlayer.update({ where: { id: voterId }, data: { score: { increment: 40 } } });
      await prisma.gameResult.updateMany({ where: { gameRoundId: voteRoundId, gamePlayerId: voterId }, data: { pointsAwarded: 40, isCorrect: true } });
    }
  } else {
    await prisma.gamePlayer.update({ where: { id: impostorPlayerId }, data: { score: { increment: 60 } } });
    await prisma.gameResult.updateMany({ where: { gameRoundId: voteRoundId, gamePlayerId: impostorPlayerId }, data: { pointsAwarded: 60 } });
  }
}

export async function getFullGameSession(gameSessionId: string) {
  const session = await prisma.gameSession.findUniqueOrThrow({
    where: { id: gameSessionId },
    include: {
      game: true,
      players: { orderBy: { score: "desc" } },
      rounds: { orderBy: { roundNumber: "asc" }, include: { results: true } },
    },
  });
  return {
    ...session,
    roundPlan: decodeGamePayloadList<RoundBlueprint>(session.roundPlan),
    rounds: session.rounds.map((r) => ({ ...r, meta: decodeGamePayload(r.meta) })),
  };
}

/** A player's own private data for a round (Impostor's role + word). Only ever looked
 *  up by the server for the specific gamePlayerId the request's own session resolves to
 *  — never accepts an arbitrary player id from the client to look up someone else's. */
export async function getMySecret(gameRoundId: string, gamePlayerId: string) {
  const secret = await prisma.gameRoundSecret.findUnique({ where: { gameRoundId_gamePlayerId: { gameRoundId, gamePlayerId } } });
  return decodeGamePayload(secret?.data);
}
