import { prisma } from "./db";
import { json, readJson } from "@menu-os/db";
import { emitToTableSession } from "./realtime";
import { pickRandomPrompts, isAnswerCorrect, generateMemorySequence, type TriviaQuestion } from "./game-questions";
import { decodeGamePayload, decodeGamePayloadList } from "./game-payload";
import { scoreReaction, scoreTap, scoreMemory, parseMemoryAnswer } from "./game-scoring";

// Per-round-kind time limits — REACTION/TAP/MEMORY don't need the same 30s window
// TRIVIA/VOTE do (a reaction test that took 30s to reveal would be tedious).
const TIME_LIMIT_SECONDS: Record<string, number> = { TRIVIA: 30, VOTE: 30, REACTION: 8, TAP: 10, MEMORY: 20 };
const REACTION_REVEAL_MIN_MS = 2000;
const REACTION_REVEAL_MAX_MS = 5000;

const ROUNDS_PER_GAME = 5;
export const GAME_KEY = "thirty-second-challenge";

// setTimeout handles for rounds currently running in this process. Fine for a
// single-instance deployment (see server.js note); a horizontally scaled
// deployment would move this to a durable job queue keyed by gameRoundId.
const roundTimers = new Map<string, NodeJS.Timeout>();

async function ensureGame() {
  return prisma.game.upsert({
    where: { key: GAME_KEY },
    create: { key: GAME_KEY, name: "30-Second Challenge", description: "Beat the clock with your table.", isActive: true },
    update: {},
  });
}

export async function joinGame(tableSessionId: string, customerSessionId: string, displayName: string) {
  const game = await ensureGame();

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
    await prisma.gamePlayer.create({
      data: { gameSessionId: gameSession.id, customerSessionId, displayName },
    });
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
  const session = await prisma.gameSession.findUniqueOrThrow({ where: { id: gameSessionId }, include: { players: true } });
  if (session.status !== "LOBBY") throw new Error("Game already started");
  if (session.players.length < 2) throw new Error("Need at least 2 players to start");

  await prisma.gameSession.update({ where: { id: gameSessionId }, data: { status: "IN_PROGRESS", startedAt: new Date() } });

  const prompts = pickRandomPrompts(ROUNDS_PER_GAME);
  await startRound(gameSessionId, 1, prompts);
}

async function startRound(gameSessionId: string, roundNumber: number, remainingPrompts: ReturnType<typeof pickRandomPrompts>) {
  const prompt = remainingPrompts[0];
  const timeLimitSeconds = TIME_LIMIT_SECONDS[prompt.kind] ?? 30;

  let meta: Record<string, unknown> = {};
  if (prompt.kind === "TRIVIA") meta = { acceptedAnswers: prompt.acceptedAnswers };
  else if (prompt.kind === "REACTION") meta = { revealDelayMs: REACTION_REVEAL_MIN_MS + Math.floor(Math.random() * (REACTION_REVEAL_MAX_MS - REACTION_REVEAL_MIN_MS)) };
  else if (prompt.kind === "MEMORY") meta = { sequence: generateMemorySequence() };

  const round = await prisma.gameRound.create({
    data: {
      gameSessionId,
      roundNumber,
      kind: prompt.kind,
      category: prompt.category,
      prompt: prompt.prompt,
      meta: json(meta),
      timeLimitSeconds,
      startedAt: new Date(),
    },
  });

  const session = await prisma.gameSession.findUniqueOrThrow({ where: { id: gameSessionId } });
  // `meta` is JSON text in the database; the broadcast and the /api/game/state
  // response have always carried an object, so decode on the way out.
  emitToTableSession(session.tableSessionId, { type: "game_round.started", tableSessionId: session.tableSessionId, round: { ...round, meta: decodeGamePayload(round.meta) } });

  const timer = setTimeout(() => {
    closeRound(round.id, remainingPrompts.slice(1)).catch((err) => console.error("closeRound failed", err));
  }, timeLimitSeconds * 1000);
  roundTimers.set(round.id, timer);

  return round;
}

export async function submitAnswer(gameRoundId: string, gamePlayerId: string, rawAnswer: string) {
  const round = await prisma.gameRound.findUniqueOrThrow({ where: { id: gameRoundId }, include: { gameSession: { include: { players: true } } } });
  if (round.endedAt) throw new Error("This round has already ended");

  const existing = await prisma.gameResult.findUnique({ where: { gameRoundId_gamePlayerId: { gameRoundId, gamePlayerId } } });
  if (existing) throw new Error("You already answered this round");

  let responseTimeMs = round.startedAt ? Date.now() - round.startedAt.getTime() : 0;
  let isCorrect: boolean | null = null;
  let points = 0;

  if (round.kind === "TRIVIA") {
    const meta = readJson<{ acceptedAnswers?: unknown }>(round.meta);
    const question: TriviaQuestion = {
      kind: "TRIVIA",
      category: round.category,
      prompt: round.prompt,
      acceptedAnswers: Array.isArray(meta?.acceptedAnswers) ? (meta!.acceptedAnswers as string[]) : [],
    };
    isCorrect = isAnswerCorrect(question, rawAnswer);
    points = isCorrect ? Math.max(50, 100 - Math.floor(responseTimeMs / 300)) : 0;
  } else if (round.kind === "REACTION") {
    const meta = readJson<{ revealDelayMs?: number }>(round.meta);
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
  // VOTE rounds are scored once, after everyone has voted, in closeRound().

  const result = await prisma.gameResult.create({
    data: {
      gameRoundId,
      gamePlayerId,
      answer: rawAnswer,
      isCorrect,
      isTimeout: false,
      pointsAwarded: points,
      responseTimeMs,
      answeredAt: new Date(),
    },
  });

  if (points > 0) {
    await prisma.gamePlayer.update({ where: { id: gamePlayerId }, data: { score: { increment: points } } });
  }

  emitToTableSession(round.gameSession.tableSessionId, {
    type: "game_round.result",
    tableSessionId: round.gameSession.tableSessionId,
    result,
  });

  // If every active player has answered, close the round early instead of waiting for the timer.
  const answeredCount = await prisma.gameResult.count({ where: { gameRoundId } });
  if (answeredCount >= round.gameSession.players.length) {
    const timer = roundTimers.get(gameRoundId);
    if (timer) {
      clearTimeout(timer);
      roundTimers.delete(gameRoundId);
    }
    const remainingRounds = ROUNDS_PER_GAME - round.roundNumber;
    await closeRound(gameRoundId, pickRandomPrompts(remainingRounds));
  }

  return result;
}

async function closeRound(gameRoundId: string, remainingPrompts: ReturnType<typeof pickRandomPrompts>) {
  const round = await prisma.gameRound.findUnique({ where: { id: gameRoundId }, include: { gameSession: { include: { players: true } }, results: true } });
  if (!round || round.endedAt) return;

  await prisma.gameRound.update({ where: { id: gameRoundId }, data: { endedAt: new Date() } });

  // Record timeouts for anyone who never answered.
  const answeredPlayerIds = new Set(round.results.map((r) => r.gamePlayerId));
  const missing = round.gameSession.players.filter((p) => !answeredPlayerIds.has(p.id));
  for (const player of missing) {
    await prisma.gameResult.create({
      data: { gameRoundId, gamePlayerId: player.id, isCorrect: round.kind === "TRIVIA" ? false : null, isTimeout: true, pointsAwarded: 0 },
    });
  }

  if (round.kind === "VOTE") {
    const allResults = await prisma.gameResult.findMany({ where: { gameRoundId } });
    const tally = new Map<string, number>();
    for (const r of allResults) {
      if (!r.answer) continue;
      tally.set(r.answer, (tally.get(r.answer) ?? 0) + 1);
    }
    const maxVotes = Math.max(0, ...tally.values());
    if (maxVotes > 0) {
      const winners = [...tally.entries()].filter(([, count]) => count === maxVotes).map(([playerId]) => playerId);
      for (const winnerId of winners) {
        await prisma.gamePlayer.update({ where: { id: winnerId }, data: { score: { increment: 50 } } });
        // Stamp the winner's own vote-round result row with the points they received
        // (for round-by-round display), separate from the vote they cast.
        await prisma.gameResult.updateMany({
          where: { gameRoundId, gamePlayerId: winnerId },
          data: { pointsAwarded: 50 },
        });
      }
    }
  }

  emitToTableSession(round.gameSession.tableSessionId, {
    type: "game_session.updated",
    tableSessionId: round.gameSession.tableSessionId,
    gameSession: await getFullGameSession(round.gameSessionId),
  });

  if (remainingPrompts.length === 0) {
    await prisma.gameSession.update({ where: { id: round.gameSessionId }, data: { status: "COMPLETED", endedAt: new Date() } });
    emitToTableSession(round.gameSession.tableSessionId, {
      type: "game_session.updated",
      tableSessionId: round.gameSession.tableSessionId,
      gameSession: await getFullGameSession(round.gameSessionId),
    });
    return;
  }

  await startRound(round.gameSessionId, round.roundNumber + 1, remainingPrompts);
}

export async function getFullGameSession(gameSessionId: string) {
  const session = await prisma.gameSession.findUniqueOrThrow({
    where: { id: gameSessionId },
    include: {
      players: { orderBy: { score: "desc" } },
      rounds: { orderBy: { roundNumber: "asc" }, include: { results: true } },
    },
  });
  return { ...session, rounds: session.rounds.map((r) => ({ ...r, meta: decodeGamePayload(r.meta) })) };
}
