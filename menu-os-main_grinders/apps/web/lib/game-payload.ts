import { readJson } from "@menu-os/db";

/**
 * The wire shape every game client (and every realtime broadcast) expects.
 *
 * Since the move to SQLite, `GameSession.roundPlan`, `GameRound.meta` and
 * `GameRoundSecret.data` are JSON *text*. Both game engines — the original
 * `lib/game.ts` and the registry-driven `lib/games/engine.ts` — therefore have to
 * turn those columns back into real objects at every point where a payload leaves
 * the server: the `/api/game/state` response, and each Socket.IO broadcast.
 *
 * Decoding here rather than in each page means the guest app, the admin app, and the
 * realtime channel all keep seeing the same object shape they always did, so the
 * SQLite migration is invisible above this line. It is also the only place that has
 * to know a `null`/malformed column degrades to `null` rather than throwing mid-round
 * and leaving a table stuck on a spinner.
 */
export type GamePayload = Record<string, unknown> | null;

/** Decodes one JSON-text column into an object, or null when absent/malformed. */
export function decodeGamePayload(value: string | null | undefined): GamePayload {
  return readJson<Record<string, unknown>>(value);
}

/** Decodes a JSON-text column that must be an array, or `[]` when absent/malformed. */
export function decodeGamePayloadList<T>(value: string | null | undefined): T[] {
  const parsed = readJson<unknown>(value);
  return Array.isArray(parsed) ? (parsed as T[]) : [];
}
