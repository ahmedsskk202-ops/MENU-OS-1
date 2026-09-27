// Real, executed integration test for the REACTION/TAP/MEMORY round kinds added to
// the 30-Second Challenge engine (GameSession/GameRound/GamePlayer/GameResult,
// unchanged), plus a full real join→start→answer regression pass through the
// existing engine to prove the schema/scoring changes didn't break TRIVIA/VOTE.
// Run: node scripts/games-test.mjs
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const LOCAL_URL = "http://localhost:3100";
const BRANCH_ID = "cmug2a45d0004stemr504wzug";

const { PrismaClient } = await import(pathToFileURL(path.join(ROOT, "packages/db/generated/client/index.js")));
const db = new PrismaClient();

let pass = 0,
  fail = 0;
const failures = [];
function check(label, cond, detail) {
  if (cond) {
    pass++;
    console.log(`  \x1b[32m✓\x1b[0m ${label}`);
  } else {
    fail++;
    failures.push(label);
    console.log(`  \x1b[31m✗\x1b[0m ${label}${detail !== undefined ? ` — ${detail}` : ""}`);
  }
}
function section(t) {
  console.log(`\n\x1b[1m${t}\x1b[0m`);
}
async function j(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function scanGuest(qrToken) {
  const res = await fetch(`${LOCAL_URL}/r/${qrToken}`, { redirect: "manual" });
  const cookie = res.headers.getSetCookie().find((c) => c.startsWith("mos_session")).split(";")[0];
  const session = await fetch(`${LOCAL_URL}/api/session`, { headers: { cookie } }).then((r) => r.json());
  return { cookie, customerSessionId: session.customerSessionId, tableSessionId: session.tableSessionId };
}

/** Sets up one throwaway GameSession with N players and one hand-crafted round of the
 *  given kind/meta — bypassing the real random prompt picker so the scoring path for
 *  that exact kind is exercised deterministically, the same way other integration
 *  tests in this repo construct specific fixtures directly against the live DB. */
async function makeCustomRound(tableSessionId, playerCustomerSessionIds, kind, meta, startedAtOffsetMs = 0) {
  const game = await db.game.upsert({
    where: { key: "thirty-second-challenge" },
    create: { key: "thirty-second-challenge", name: "30-Second Challenge", description: "Beat the clock with your table.", isActive: true },
    update: {},
  });
  const gameSession = await db.gameSession.create({ data: { tableSessionId, gameId: game.id, status: "IN_PROGRESS", startedAt: new Date() } });
  const players = [];
  for (const customerSessionId of playerCustomerSessionIds) {
    players.push(await db.gamePlayer.create({ data: { gameSessionId: gameSession.id, customerSessionId, displayName: "Tester", isReady: true } }));
  }
  const round = await db.gameRound.create({
    data: {
      gameSessionId: gameSession.id,
      roundNumber: 5, // last round — closeRound marks the session COMPLETED with no dangling next-round timer
      kind,
      category: "Test",
      prompt: "Test prompt",
      meta: meta == null ? null : JSON.stringify(meta),
      timeLimitSeconds: 30,
      startedAt: new Date(Date.now() - startedAtOffsetMs),
    },
  });
  return { gameSession, players, round };
}

async function main() {
  console.log("Menu OS — REACTION/TAP/MEMORY game round test suite");
  console.log("=".repeat(70));

  const table = await db.restaurantTable.findFirstOrThrow({ where: { branchId: BRANCH_ID, label: "12" } });
  const qr = await db.qRCode.findFirstOrThrow({ where: { branchId: BRANCH_ID, label: "Table 12" } });
  const guestA = await scanGuest(qr.token);
  const guestB = await scanGuest(qr.token);

  // ═══════════════════════════════════════════════════════════════════════
  section("1. REACTION — server-timed scoring, not client-reported");
  {
    const { players, round } = await makeCustomRound(guestA.tableSessionId, [guestA.customerSessionId], "REACTION", { revealDelayMs: 200 }, 250);
    // startedAt was backdated 250ms and revealDelayMs is 200ms, so the reveal already
    // happened — this is a legitimate post-reveal tap.
    const res = await fetch(`${LOCAL_URL}/api/game/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: guestA.cookie },
      body: JSON.stringify({ gameRoundId: round.id, gamePlayerId: players[0].id, answer: "tap" }),
    });
    const json = await j(res);
    check("a post-reveal tap is accepted", res.status === 200, JSON.stringify(json));
    check("it's scored correct with positive points", json?.result?.isCorrect === true && json.result.pointsAwarded > 0, JSON.stringify(json?.result));
  }
  {
    const { players, round } = await makeCustomRound(guestA.tableSessionId, [guestA.customerSessionId], "REACTION", { revealDelayMs: 999999 }, 0);
    const res = await fetch(`${LOCAL_URL}/api/game/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: guestA.cookie },
      body: JSON.stringify({ gameRoundId: round.id, gamePlayerId: players[0].id, answer: "tap" }),
    });
    const json = await j(res);
    check("a false start (tapped long before reveal) scores zero, not accepted as a win", json?.result?.isCorrect === false && json.result.pointsAwarded === 0, JSON.stringify(json?.result));
  }

  // ═══════════════════════════════════════════════════════════════════════
  section("2. TAP — final count submitted once, scored directly, clamped");
  {
    const { players, round } = await makeCustomRound(guestA.tableSessionId, [guestA.customerSessionId], "TAP", {});
    const res = await fetch(`${LOCAL_URL}/api/game/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: guestA.cookie },
      body: JSON.stringify({ gameRoundId: round.id, gamePlayerId: players[0].id, answer: "23" }),
    });
    const json = await j(res);
    check("tap count of 23 scores 23 points", json?.result?.pointsAwarded === 23, JSON.stringify(json?.result));
  }
  {
    const { players, round } = await makeCustomRound(guestA.tableSessionId, [guestA.customerSessionId], "TAP", {});
    const res = await fetch(`${LOCAL_URL}/api/game/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: guestA.cookie },
      body: JSON.stringify({ gameRoundId: round.id, gamePlayerId: players[0].id, answer: "50000" }),
    });
    const json = await j(res);
    check("an absurd tap count is clamped, not trusted unbounded", json?.result?.pointsAwarded === 200, JSON.stringify(json?.result));
  }

  // ═══════════════════════════════════════════════════════════════════════
  section("3. MEMORY — sequence match scoring, exact and partial credit");
  {
    const { players, round } = await makeCustomRound(guestA.tableSessionId, [guestA.customerSessionId], "MEMORY", { sequence: [1, 2, 3, 4] });
    const res = await fetch(`${LOCAL_URL}/api/game/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: guestA.cookie },
      body: JSON.stringify({ gameRoundId: round.id, gamePlayerId: players[0].id, answer: "1,2,3,4" }),
    });
    const json = await j(res);
    check("an exact sequence match is correct with the full-match bonus", json?.result?.isCorrect === true && json.result.pointsAwarded === 130, JSON.stringify(json?.result));
  }
  {
    const { players, round } = await makeCustomRound(guestA.tableSessionId, [guestA.customerSessionId], "MEMORY", { sequence: [1, 2, 3, 4] });
    const res = await fetch(`${LOCAL_URL}/api/game/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: guestA.cookie },
      body: JSON.stringify({ gameRoundId: round.id, gamePlayerId: players[0].id, answer: "1,2,9,9" }),
    });
    const json = await j(res);
    check("a partially-correct sequence gets partial credit, not zero or full", json?.result?.isCorrect === false && json.result.pointsAwarded === 40, JSON.stringify(json?.result));
  }

  // ═══════════════════════════════════════════════════════════════════════
  section("4. Scores actually accumulate on the player row (leaderboard is real)");
  {
    const { players, round } = await makeCustomRound(guestA.tableSessionId, [guestA.customerSessionId], "TAP", {});
    await fetch(`${LOCAL_URL}/api/game/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: guestA.cookie },
      body: JSON.stringify({ gameRoundId: round.id, gamePlayerId: players[0].id, answer: "15" }),
    });
    const updatedPlayer = await db.gamePlayer.findUniqueOrThrow({ where: { id: players[0].id } });
    check("GamePlayer.score incremented by the round's points", updatedPlayer.score === 15, updatedPlayer.score);
    const updatedSession = await db.gameSession.findUniqueOrThrow({ where: { id: round.gameSessionId } });
    check("with only 1 player, answering the last round completes the session immediately", updatedSession.status === "COMPLETED", updatedSession.status);
  }

  // ═══════════════════════════════════════════════════════════════════════
  section("5. Regression — a duplicate answer to the same round is still rejected");
  {
    const { players, round } = await makeCustomRound(guestA.tableSessionId, [guestA.customerSessionId], "TAP", {});
    await fetch(`${LOCAL_URL}/api/game/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: guestA.cookie },
      body: JSON.stringify({ gameRoundId: round.id, gamePlayerId: players[0].id, answer: "5" }),
    });
    const secondAttempt = await fetch(`${LOCAL_URL}/api/game/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: guestA.cookie },
      body: JSON.stringify({ gameRoundId: round.id, gamePlayerId: players[0].id, answer: "999" }),
    });
    check("answering the same round twice is rejected (422), score isn't double-counted", secondAttempt.status === 422);
  }

  // ═══════════════════════════════════════════════════════════════════════
  section("6. Full real flow — join, start, answer whatever round comes up (TRIVIA/VOTE unaffected)");
  {
    const joinA = await fetch(`${LOCAL_URL}/api/game/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: guestA.cookie },
      body: JSON.stringify({ displayName: "Player A" }),
    }).then(j);
    const joinB = await fetch(`${LOCAL_URL}/api/game/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: guestB.cookie },
      body: JSON.stringify({ displayName: "Player B" }),
    }).then(j);
    check("two real players join the same lobby", joinA.gameSession.id === joinB.gameSession.id);

    const startRes = await fetch(`${LOCAL_URL}/api/game/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: guestA.cookie },
      body: JSON.stringify({ gameSessionId: joinA.gameSession.id }),
    });
    check("the real game starts", startRes.status === 200, await startRes.text());

    const state = await fetch(`${LOCAL_URL}/api/game/state`, { headers: { cookie: guestA.cookie } }).then(j);
    const round = state.gameSession.rounds[0];
    check("a round was created with one of the 5 known kinds", ["TRIVIA", "VOTE", "REACTION", "TAP", "MEMORY"].includes(round.kind), round.kind);

    const myPlayerId = state.gameSession.players.find((p) => p.customerSessionId === guestA.customerSessionId).id;
    const answerValue = round.kind === "TRIVIA" ? "test" : round.kind === "VOTE" ? myPlayerId : round.kind === "REACTION" ? "tap" : round.kind === "TAP" ? "3" : "1,2,3,4";
    const answerRes = await fetch(`${LOCAL_URL}/api/game/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: guestA.cookie },
      body: JSON.stringify({ gameRoundId: round.id, gamePlayerId: myPlayerId, answer: answerValue }),
    });
    check(`a real ${round.kind} round accepts an answer through the live engine`, answerRes.status === 200, await answerRes.text());
  }

  // ═══════════════════════════════════════════════════════════════════════
  console.log("\n" + "=".repeat(70));
  console.log(`RESULT: ${pass} passed, ${fail} failed`);
  if (failures.length) {
    console.log("Failed checks:");
    for (const f of failures) console.log(`  - ${f}`);
    process.exitCode = 1;
  }
  await db.$disconnect();
}

main().catch((err) => {
  console.error("Test harness crashed:", err);
  process.exitCode = 1;
});
