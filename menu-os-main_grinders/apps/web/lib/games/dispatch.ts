// Routes the shared /api/game/* endpoints to whichever engine owns a given game session
// — the original, untouched lib/game.ts for "thirty-second-challenge", or the new
// registry-driven lib/games/engine.ts for every other game. This is the only place that
// needs to know both engines exist; every route file just calls these.
import { prisma } from "@/lib/db";
import { GAME_KEY as ORIGINAL_GAME_KEY, joinGame as originalJoin, setPlayerReady as originalReady, startGame as originalStart, submitAnswer as originalAnswer, getFullGameSession as originalGetFull } from "@/lib/game";
import { joinGame as newJoin, setPlayerReady as newReady, startGame as newStart, submitAnswer as newAnswer, getFullGameSession as newGetFull } from "./engine";
import { getGameDefinition } from "./registry";

export async function joinAnyGame(gameKey: string | undefined, tableSessionId: string, customerSessionId: string, displayName: string) {
  const key = gameKey ?? ORIGINAL_GAME_KEY;
  if (key === ORIGINAL_GAME_KEY) return originalJoin(tableSessionId, customerSessionId, displayName);
  if (!getGameDefinition(key)) throw new Error(`Unknown game: ${key}`);
  return newJoin(key, tableSessionId, customerSessionId, displayName);
}

async function resolveGameKey(gameSessionId: string): Promise<string> {
  const session = await prisma.gameSession.findUniqueOrThrow({ where: { id: gameSessionId }, include: { game: true } });
  return session.game.key;
}

export async function readyAnyGame(gameSessionId: string, gamePlayerId: string, isReady: boolean) {
  const key = await resolveGameKey(gameSessionId);
  return key === ORIGINAL_GAME_KEY ? originalReady(gameSessionId, gamePlayerId, isReady) : newReady(gameSessionId, gamePlayerId, isReady);
}

export async function startAnyGame(gameSessionId: string) {
  const key = await resolveGameKey(gameSessionId);
  return key === ORIGINAL_GAME_KEY ? originalStart(gameSessionId) : newStart(gameSessionId);
}

export async function answerAnyGame(gameRoundId: string, gamePlayerId: string, rawAnswer: string) {
  const round = await prisma.gameRound.findUniqueOrThrow({ where: { id: gameRoundId }, include: { gameSession: { include: { game: true } } } });
  return round.gameSession.game.key === ORIGINAL_GAME_KEY ? originalAnswer(gameRoundId, gamePlayerId, rawAnswer) : newAnswer(gameRoundId, gamePlayerId, rawAnswer);
}

export async function getAnyFullGameSession(gameSessionId: string) {
  const key = await resolveGameKey(gameSessionId);
  return key === ORIGINAL_GAME_KEY ? originalGetFull(gameSessionId) : newGetFull(gameSessionId);
}
