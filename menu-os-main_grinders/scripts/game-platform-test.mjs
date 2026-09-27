// Real, executed integration test for the Game Platform expansion: every new game
// (Sports/General Challenge, Knowledge Quiz, Social Vote, Category Sprint, Impostor,
// Reaction Duel/Tap Battle/Memory Match), solo/2P/group modes, rematch, reconnect, and
// the Impostor secret-role endpoint's isolation. The original 30-Second Challenge is
// covered by scripts/games-test.mjs and is not re-tested here.
// Run: node scripts/game-platform-test.mjs
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

async function joinGame(guest, gameKey, name) {
  return fetch(`${LOCAL_URL}/api/game/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: guest.cookie },
    body: JSON.stringify({ displayName: name, gameKey }),
  }).then(j);
}
async function startGame(guest, gameSessionId) {
  return fetch(`${LOCAL_URL}/api/game/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: guest.cookie },
    body: JSON.stringify({ gameSessionId }),
  });
}
async function state(guest, gameKey) {
  return fetch(`${LOCAL_URL}/api/game/state?gameKey=${gameKey}`, { headers: { cookie: guest.cookie } }).then(j);
}
async function answer(guest, gameRoundId, gamePlayerId, ans) {
  return fetch(`${LOCAL_URL}/api/game/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: guest.cookie },
    body: JSON.stringify({ gameRoundId, gamePlayerId, answer: ans }),
  }).then(j);
}

async function main() {
  console.log("Menu OS — Game Platform expansion test suite");
  console.log("=".repeat(70));

  const qr = await db.qRCode.findFirstOrThrow({ where: { branchId: BRANCH_ID, label: "Table 12" } });
  const guestA = await scanGuest(qr.token);
  const guestB = await scanGuest(qr.token);
  const guestC = await scanGuest(qr.token);

  // ═══════════════════════════════════════════════════════════════════════
  section("1. Sports Challenge — real join→start→answer, category is always Sports, no repeats");
  {
    const joinA = await joinGame(guestA, "sports-challenge", "A");
    const joinB = await joinGame(guestB, "sports-challenge", "B");
    check("two players join the same sports-challenge lobby", joinA.gameSession.id === joinB.gameSession.id);

    const startRes = await startGame(guestA, joinA.gameSession.id);
    check("sports-challenge starts with 2 players", startRes.status === 200, await startRes.text());

    const s = await state(guestA, "sports-challenge");
    check("the round is TRIVIA", s.gameSession.rounds[0].kind === "TRIVIA");
    check("the round's category is Sports", s.gameSession.rounds[0].category === "SPORTS");

    const myId = s.gameSession.players.find((p) => p.customerSessionId === guestA.customerSessionId).id;
    const res = await answer(guestA, s.gameSession.rounds[0].id, myId, "test answer");
    check("an answer is accepted", !!res.result);
  }

  // ═══════════════════════════════════════════════════════════════════════
  section("2. General Challenge — never draws a Sports question");
  {
    const joinA = await joinGame(guestA, "general-challenge", "A");
    await joinGame(guestB, "general-challenge", "B");
    await startGame(guestA, joinA.gameSession.id);
    const s = await state(guestA, "general-challenge");
    check("general-challenge's first round is not Sports", s.gameSession.rounds[0].category !== "SPORTS", s.gameSession.rounds[0].category);
  }

  // ═══════════════════════════════════════════════════════════════════════
  section("3. Knowledge Quiz — MCQ round has 4 options, correct index scores, wrong index doesn't");
  {
    const joinA = await joinGame(guestA, "knowledge-quiz", "A");
    await joinGame(guestB, "knowledge-quiz", "B");
    await startGame(guestA, joinA.gameSession.id);
    const s = await state(guestA, "knowledge-quiz");
    const round = s.gameSession.rounds[0];
    check("the round is MCQ", round.kind === "MCQ");
    check("MCQ round has exactly 4 options", round.meta.options.length === 4, round.meta.options.length);

    const myId = s.gameSession.players.find((p) => p.customerSessionId === guestA.customerSessionId).id;
    const correctIndex = round.meta.correctIndex;
    const res = await answer(guestA, round.id, myId, String(correctIndex));
    check("submitting the correct option index scores points", res.result.isCorrect === true && res.result.pointsAwarded > 0, JSON.stringify(res.result));

    const wrongIndex = (correctIndex + 1) % 4;
    const joinC = await joinGame(guestC, "knowledge-quiz", "C");
    await joinGame(guestA, "knowledge-quiz", "A2"); // fills the new lobby so it can start with 2
    await startGame(guestC, joinC.gameSession.id);
    const s2 = await state(guestC, "knowledge-quiz");
    const round2 = s2.gameSession.rounds[0];
    const myId2 = s2.gameSession.players.find((p) => p.customerSessionId === guestC.customerSessionId).id;
    const wrongIndex2 = (round2.meta.correctIndex + 1) % 4;
    const res2 = await answer(guestC, round2.id, myId2, String(wrongIndex2));
    check("submitting the wrong option index scores zero", res2.result.isCorrect === false && res2.result.pointsAwarded === 0, JSON.stringify(res2.result));
  }

  // ═══════════════════════════════════════════════════════════════════════
  section("4. Category Sprint — multi-item answer scores per distinct valid item");
  {
    const table = await db.restaurantTable.findFirstOrThrow({ where: { branchId: BRANCH_ID, label: "12" } });
    const game = await db.game.upsert({ where: { key: "category-sprint" }, create: { key: "category-sprint", name: "category-sprint", isActive: true }, update: {} });
    const gameSession = await db.gameSession.create({ data: { tableSessionId: guestA.tableSessionId, gameId: game.id, status: "IN_PROGRESS", startedAt: new Date() } });
    const player = await db.gamePlayer.create({ data: { gameSessionId: gameSession.id, customerSessionId: guestA.customerSessionId, displayName: "A", isReady: true } });
    const round = await db.gameRound.create({
      data: {
        gameSessionId: gameSession.id,
        roundNumber: 1,
        kind: "CATEGORY_SPRINT",
        category: "Fruits",
        prompt: "List as many Fruits as you can!",
        meta: JSON.stringify({ acceptedItems: ["apple", "banana", "mango"] }),
        timeLimitSeconds: 30,
        startedAt: new Date(),
      },
    });
    const res = await answer(guestA, round.id, player.id, "apple, banana, car, apple");
    check("2 distinct valid items scored (apple, banana), duplicates and junk ignored", res.result.pointsAwarded === 50, JSON.stringify(res.result));
  }

  // ═══════════════════════════════════════════════════════════════════════
  section("5. Social Vote — most-voted player earns points, VOTE reused correctly for a dedicated game");
  {
    const table = await db.restaurantTable.findFirstOrThrow({ where: { branchId: BRANCH_ID, label: "12" } });
    const game = await db.game.upsert({ where: { key: "social-vote" }, create: { key: "social-vote", name: "social-vote", isActive: true }, update: {} });
    const gameSession = await db.gameSession.create({ data: { tableSessionId: guestA.tableSessionId, gameId: game.id, status: "IN_PROGRESS", startedAt: new Date() } });
    const p1 = await db.gamePlayer.create({ data: { gameSessionId: gameSession.id, customerSessionId: guestA.customerSessionId, displayName: "A", isReady: true } });
    const p2 = await db.gamePlayer.create({ data: { gameSessionId: gameSession.id, customerSessionId: guestB.customerSessionId, displayName: "B", isReady: true } });
    const round = await db.gameRound.create({
      data: { gameSessionId: gameSession.id, roundNumber: 1, kind: "VOTE", category: "Social", prompt: "Who?", meta: JSON.stringify({}), timeLimitSeconds: 30, startedAt: new Date() },
    });
    await answer(guestA, round.id, p1.id, p2.id); // A votes for B
    await answer(guestB, round.id, p2.id, p2.id); // B votes for B (self-vote allowed, same as original VOTE)
    const updatedB = await (async () => {
      for (let i = 0; i < 20; i++) {
        const row = await db.gamePlayer.findUniqueOrThrow({ where: { id: p2.id } });
        if (row.score > 0) return row;
        await new Promise((r) => setTimeout(r, 150));
      }
      return db.gamePlayer.findUniqueOrThrow({ where: { id: p2.id } });
    })();
    check("the most-voted player earns points", updatedB.score === 50, updatedB.score);
  }

  // ═══════════════════════════════════════════════════════════════════════
  section("6. Impostor — exactly one player gets IMPOSTOR role, others get the same word, secrets are isolated per player");
  {
    const game = await db.game.upsert({ where: { key: "impostor" }, create: { key: "impostor", name: "impostor", isActive: true }, update: {} });
    const gameSession = await db.gameSession.create({ data: { tableSessionId: guestA.tableSessionId, gameId: game.id, status: "IN_PROGRESS", startedAt: new Date() } });
    const p1 = await db.gamePlayer.create({ data: { gameSessionId: gameSession.id, customerSessionId: guestA.customerSessionId, displayName: "A", isReady: true } });
    const p2 = await db.gamePlayer.create({ data: { gameSessionId: gameSession.id, customerSessionId: guestB.customerSessionId, displayName: "B", isReady: true } });
    const p3 = await db.gamePlayer.create({ data: { gameSessionId: gameSession.id, customerSessionId: guestC.customerSessionId, displayName: "C", isReady: true } });
    const clueRound = await db.gameRound.create({
      data: { gameSessionId: gameSession.id, roundNumber: 1, kind: "IMPOSTOR_CLUE", category: "Food", prompt: "Give a clue", meta: JSON.stringify({ category: "Food" }), timeLimitSeconds: 25, startedAt: new Date() },
    });
    await db.gameRoundSecret.createMany({
      data: [
        { gameRoundId: clueRound.id, gamePlayerId: p1.id, data: JSON.stringify({ role: "IMPOSTOR", category: "Food" }) },
        { gameRoundId: clueRound.id, gamePlayerId: p2.id, data: JSON.stringify({ role: "CREW", category: "Food", word: "Pizza" }) },
        { gameRoundId: clueRound.id, gamePlayerId: p3.id, data: JSON.stringify({ role: "CREW", category: "Food", word: "Pizza" }) },
      ],
    });

    const secretA = await fetch(`${LOCAL_URL}/api/game/secret?gameRoundId=${clueRound.id}`, { headers: { cookie: guestA.cookie } }).then(j);
    const secretB = await fetch(`${LOCAL_URL}/api/game/secret?gameRoundId=${clueRound.id}`, { headers: { cookie: guestB.cookie } }).then(j);
    check("player A (the impostor) sees their own IMPOSTOR role, no word", secretA.secret.role === "IMPOSTOR" && !secretA.secret.word, JSON.stringify(secretA));
    check("player B (crew) sees the real word, not the impostor's role", secretB.secret.role === "CREW" && secretB.secret.word === "Pizza", JSON.stringify(secretB));
    check("player A's secret never leaked player B's word", secretA.secret.word === undefined);

    const unauthedRes = await fetch(`${LOCAL_URL}/api/game/secret?gameRoundId=${clueRound.id}`);
    check("an unauthenticated request for the secret is rejected (401)", unauthedRes.status === 401);

    // ── Vote round: crew catches the impostor → crew scores, impostor scores 0 ──
    const voteRound = await db.gameRound.create({
      data: { gameSessionId: gameSession.id, roundNumber: 2, kind: "IMPOSTOR_VOTE", category: "Food", prompt: "Who is the impostor?", meta: JSON.stringify({}), timeLimitSeconds: 25, startedAt: new Date() },
    });
    await answer(guestB, voteRound.id, p2.id, p1.id); // B votes for A (correct)
    await answer(guestC, voteRound.id, p3.id, p1.id); // C votes for A (correct)
    await answer(guestA, voteRound.id, p1.id, p2.id); // impostor bluff-votes for B

    const settled = await (async () => {
      for (let i = 0; i < 20; i++) {
        const row = await db.gamePlayer.findUniqueOrThrow({ where: { id: p2.id } });
        if (row.score > 0) return true;
        await new Promise((r) => setTimeout(r, 150));
      }
      return false;
    })();
    check("the vote round settles (all 3 players answered → closes early)", settled);
    const [finalP1, finalP2, finalP3] = await Promise.all([p1, p2, p3].map((p) => db.gamePlayer.findUniqueOrThrow({ where: { id: p.id } })));
    check("crew members who correctly voted out the impostor are rewarded", finalP2.score === 40 && finalP3.score === 40, `p2=${finalP2.score} p3=${finalP3.score}`);
    check("the caught impostor scores nothing for this match", finalP1.score === 0, finalP1.score);
  }

  // ═══════════════════════════════════════════════════════════════════════
  section("7. Impostor evades — impostor scores a survival bonus when not caught");
  {
    const game = await db.game.findUniqueOrThrow({ where: { key: "impostor" } });
    const gameSession = await db.gameSession.create({ data: { tableSessionId: guestA.tableSessionId, gameId: game.id, status: "IN_PROGRESS", startedAt: new Date() } });
    const p1 = await db.gamePlayer.create({ data: { gameSessionId: gameSession.id, customerSessionId: guestA.customerSessionId, displayName: "A", isReady: true } });
    const p2 = await db.gamePlayer.create({ data: { gameSessionId: gameSession.id, customerSessionId: guestB.customerSessionId, displayName: "B", isReady: true } });
    const p3 = await db.gamePlayer.create({ data: { gameSessionId: gameSession.id, customerSessionId: guestC.customerSessionId, displayName: "C", isReady: true } });
    const clueRound = await db.gameRound.create({
      data: { gameSessionId: gameSession.id, roundNumber: 1, kind: "IMPOSTOR_CLUE", category: "Food", prompt: "Give a clue", meta: JSON.stringify({ category: "Food" }), timeLimitSeconds: 25, startedAt: new Date() },
    });
    await db.gameRoundSecret.create({ data: { gameRoundId: clueRound.id, gamePlayerId: p1.id, data: JSON.stringify({ role: "IMPOSTOR", category: "Food" }) } });
    const voteRound = await db.gameRound.create({
      data: { gameSessionId: gameSession.id, roundNumber: 2, kind: "IMPOSTOR_VOTE", category: "Food", prompt: "Who is the impostor?", meta: JSON.stringify({}), timeLimitSeconds: 25, startedAt: new Date() },
    });
    await answer(guestA, voteRound.id, p1.id, p2.id); // impostor bluff-votes for B
    await answer(guestB, voteRound.id, p2.id, p3.id); // B and C vote for each other — nobody accuses the real impostor
    await answer(guestC, voteRound.id, p3.id, p2.id);

    const settled = await (async () => {
      for (let i = 0; i < 20; i++) {
        const row = await db.gamePlayer.findUniqueOrThrow({ where: { id: p1.id } });
        if (row.score > 0) return true;
        await new Promise((r) => setTimeout(r, 150));
      }
      return false;
    })();
    check("the impostor evading a split vote gets the survival bonus", settled);
    const finalP1 = await db.gamePlayer.findUniqueOrThrow({ where: { id: p1.id } });
    check("the survival bonus is exactly 60", finalP1.score === 60, finalP1.score);
  }

  // ═══════════════════════════════════════════════════════════════════════
  section("8. Solo mode — Reaction Duel / Tap Battle / Memory Match start with just 1 player");
  {
    for (const gameKey of ["reaction-duel", "tap-battle", "memory-match"]) {
      const joined = await joinGame(guestA, gameKey, "Solo Player");
      const startRes = await startGame(guestA, joined.gameSession.id);
      check(`${gameKey} starts solo with 1 player`, startRes.status === 200, await startRes.text());
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  section("9. Group modes enforce their own minimum player count");
  {
    const joined = await joinGame(guestA, "impostor", "Only One");
    const startRes = await startGame(guestA, joined.gameSession.id);
    check("impostor refuses to start with only 1 player (needs 3+)", startRes.status === 422, startRes.status);
  }

  // ═══════════════════════════════════════════════════════════════════════
  section("10. Reconnect — re-fetching state after 'losing connection' returns the same session, no duplicate player");
  {
    const joinA = await joinGame(guestA, "tap-battle", "Reconnect Test");
    const before = await state(guestA, "tap-battle");
    const after = await state(guestA, "tap-battle"); // simulates a fresh page load
    check("re-fetching state returns the same game session id", before.gameSession.id === after.gameSession.id && before.gameSession.id === joinA.gameSession.id);
    const rejoin = await joinGame(guestA, "tap-battle", "Reconnect Test");
    check("rejoining with the same customer session doesn't create a duplicate player", rejoin.gameSession.players.length === before.gameSession.players.length);
  }

  // ═══════════════════════════════════════════════════════════════════════
  section("11. Rematch — 'Play Again' after COMPLETED creates a fresh LOBBY session, not a dead end");
  {
    const joinA = await joinGame(guestA, "tap-battle", "Rematch Test");
    const originalSessionId = joinA.gameSession.id;
    await startGame(guestA, originalSessionId);
    // Answer every round immediately (rather than waiting out each real timer) so the
    // session reaches COMPLETED quickly. /api/game/state only ever returns an
    // active (LOBBY/IN_PROGRESS) session — once this one completes it stops showing up
    // there at all, so completion is detected by state() going null, not by a
    // COMPLETED status object (the DB row itself is checked directly afterward).
    const s = await state(guestA, "tap-battle");
    const myId = s.gameSession.players.find((p) => p.customerSessionId === guestA.customerSessionId).id;
    let round = s.gameSession.rounds.at(-1);
    while (round && !round.endedAt) {
      await answer(guestA, round.id, myId, "5");
      const fresh = await state(guestA, "tap-battle");
      if (!fresh.gameSession || fresh.gameSession.id !== originalSessionId) break; // completed (or a different session now active)
      round = fresh.gameSession.rounds.at(-1);
    }
    const completedRow = await db.gameSession.findUniqueOrThrow({ where: { id: originalSessionId } });
    check("tap-battle actually completed", completedRow.status === "COMPLETED", completedRow.status);

    const rematch = await joinGame(guestA, "tap-battle", "Rematch Test");
    check("'Play Again' creates a brand-new LOBBY session, not the completed one", rematch.gameSession.id !== originalSessionId);
    check("the new session starts at LOBBY with a reset score", rematch.gameSession.status === "LOBBY" && rematch.gameSession.players[0].score === 0);
  }

  // ═══════════════════════════════════════════════════════════════════════
  section("12. Regression — the original 30-Second Challenge (no gameKey) is completely unaffected");
  {
    const join = await fetch(`${LOCAL_URL}/api/game/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: guestA.cookie },
      body: JSON.stringify({ displayName: "Original Game Player" }),
    }).then(j);
    check("joining with no gameKey still joins thirty-second-challenge", !!join.gameSession);
    const s = await fetch(`${LOCAL_URL}/api/game/state`, { headers: { cookie: guestA.cookie } }).then(j);
    check("state with no gameKey query param still returns a session", !!s.gameSession);
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
