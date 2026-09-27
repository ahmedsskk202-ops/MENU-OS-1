// Pure scoring math for the REACTION/TAP/MEMORY round kinds — kept separate from
// lib/game.ts (which owns persistence/realtime) so it's unit-testable without a
// database, the same split TRIVIA's isAnswerCorrect (game-questions.ts) already uses.

/**
 * Reaction round: the round reveals `revealDelayMs` after it started. `answeredAtMs`
 * is server time (Date.now()) when the player's tap arrived — never client-reported,
 * so a modified client can't fake a faster time. Tapping before the reveal is a false
 * start and scores 0. Score decays linearly from 300 down to a 10-point floor for any
 * legitimate post-reveal tap, so reacting at all is never worth nothing.
 */
export function scoreReaction(startedAtMs: number, revealDelayMs: number, answeredAtMs: number): { isCorrect: boolean; points: number; responseTimeMs: number } {
  const revealAtMs = startedAtMs + revealDelayMs;
  const responseTimeMs = answeredAtMs - revealAtMs;
  if (responseTimeMs < 0) return { isCorrect: false, points: 0, responseTimeMs };
  const points = Math.max(10, 300 - Math.floor(responseTimeMs));
  return { isCorrect: true, points, responseTimeMs };
}

/** Tap round: the client counts taps locally and submits the final count once, at
 *  time-up. Points equal the (clamped) count directly — more taps, more points. */
export function scoreTap(rawCount: string): { isCorrect: boolean; points: number; count: number } {
  const count = Math.max(0, Math.min(999, Math.floor(Number(rawCount)) || 0));
  return { isCorrect: count > 0, points: Math.min(200, count), count };
}

/**
 * Memory round: partial credit for the longest correct prefix (so a near-miss still
 * scores something), plus a bonus for a fully correct sequence.
 */
export function scoreMemory(sequence: number[], submitted: number[]): { isCorrect: boolean; points: number; matched: number } {
  let matched = 0;
  while (matched < sequence.length && matched < submitted.length && sequence[matched] === submitted[matched]) matched++;
  const isCorrect = matched === sequence.length && submitted.length === sequence.length;
  const points = matched * 20 + (isCorrect ? 50 : 0);
  return { isCorrect, points, matched };
}

export function parseMemoryAnswer(raw: string): number[] {
  return raw
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
}

// ─────────────────────────────────────────────────────────────────────────
// Game Platform expansion — new round kinds' scoring (additive; nothing above this
// line is touched, so the original 30-Second Challenge's behavior is unaffected).
// ─────────────────────────────────────────────────────────────────────────

/** MCQ round: correctness is exact (the option index), so there's no fuzzy matching —
 *  points reward speed on top of a flat correct-answer base, same decay shape as TRIVIA. */
export function scoreMcq(correctIndex: number, submittedIndex: number, responseTimeMs: number): { isCorrect: boolean; points: number } {
  const isCorrect = submittedIndex === correctIndex;
  return { isCorrect, points: isCorrect ? Math.max(50, 100 - Math.floor(responseTimeMs / 300)) : 0 };
}

/** Category Sprint: the player submits a comma/newline-separated list in one answer;
 *  points are 25 per distinct valid item (case-insensitive), duplicates only counted once. */
export function scoreCategorySprint(rawAnswer: string, isValid: (item: string) => boolean): { isCorrect: boolean; points: number; validCount: number } {
  const items = rawAnswer
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const seen = new Set<string>();
  let validCount = 0;
  for (const item of items) {
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    if (isValid(item)) validCount++;
  }
  return { isCorrect: validCount > 0, points: validCount * 25, validCount };
}

/** Shared vote tally used by both the original VOTE kind and IMPOSTOR_VOTE — returns
 *  the player id(s) with the most votes (a tie returns all of them). */
export function tallyVotes(votes: { gamePlayerId: string; answer: string | null }[]): { winners: string[]; maxVotes: number; tally: Map<string, number> } {
  const tally = new Map<string, number>();
  for (const v of votes) {
    if (!v.answer) continue;
    tally.set(v.answer, (tally.get(v.answer) ?? 0) + 1);
  }
  const maxVotes = Math.max(0, ...tally.values());
  const winners = maxVotes > 0 ? [...tally.entries()].filter(([, count]) => count === maxVotes).map(([playerId]) => playerId) : [];
  return { winners, maxVotes, tally };
}
