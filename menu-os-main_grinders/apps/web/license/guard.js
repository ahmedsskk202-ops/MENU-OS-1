// Menu OS license guard. Loaded by server.js (plain Node, outside the Next.js bundle) and
// consulted before every request, so nothing — pages, APIs, realtime — runs unlicensed.
//
// How a license is trusted:
//  - The token is issued by the Menu OS License site (Netlify), signed with Ed25519, and
//    stamped product "menu-os". It says who it is for and when it expires — or that it
//    never does (Lifetime).
//  - This server asks the license site about it (MENU_OS_LICENSE_SERVER + /api/verify) at
//    start-up and every few hours. The site answers with a signed *receipt*: the status
//    (active / expired / revoked) as of a timestamp. Revocation is enforced this way: a
//    license deleted on the site comes back "revoked" at the next check.
//  - Cafés lose internet. The last good receipt keeps the system running for a grace
//    period (default 7 days) without contact. Receipts are signed, so the cached copy
//    can't be edited to stretch that; a finite license still stops at its own expiry
//    date offline, from the token itself.
//
// The public key comes from MENU_OS_LICENSE_PUBLIC_KEY if set (strongest), otherwise it is
// fetched from the license site on activation and pinned in the state file.
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const PRODUCT = "menu-os";
const DAY = 86_400_000;

function b64json(part) {
  return JSON.parse(Buffer.from(part, "base64url").toString("utf8"));
}

/** Splits and checks one of the license site's Ed25519 tokens. Returns its payload or null. */
function verifySigned(token, publicKeyPem, expectedTyp) {
  try {
    const parts = String(token || "").trim().split(".");
    if (parts.length !== 3) return null;
    const header = b64json(parts[0]);
    if (header.alg !== "Ed25519" || header.typ !== expectedTyp) return null;
    const ok = crypto.verify(null, Buffer.from(`${parts[0]}.${parts[1]}`), crypto.createPublicKey(publicKeyPem), Buffer.from(parts[2], "base64url"));
    if (!ok) return null;
    const payload = b64json(parts[1]);
    return payload && payload.product === PRODUCT ? payload : null;
  } catch {
    return null;
  }
}

/**
 * The decision, from stored state alone (no network). Pure, so it is unit-tested.
 * Returns { licensed, reason, license } — reason is one of NOT_ACTIVATED, INVALID,
 * NOT_VERIFIED, REVOKED, EXPIRED, OFFLINE_TOO_LONG, CLOCK, or OK.
 */
function evaluate(state, { publicKeyPem, graceDays, now = Date.now() }) {
  if (!state || !state.token) return { licensed: false, reason: "NOT_ACTIVATED" };
  if (!publicKeyPem) return { licensed: false, reason: "NOT_VERIFIED" };

  const lic = verifySigned(state.token, publicKeyPem, "JWT");
  if (!lic) return { licensed: false, reason: "INVALID" };
  const license = {
    client_id: lic.client_id,
    plan_type: lic.plan_type,
    lifetime: lic.lifetime === true || lic.expires_at === null,
    expires_at: lic.expires_at ?? null,
    license_id: lic.license_id,
  };

  // A finite license ends on its date even with no internet at all.
  if (!license.lifetime) {
    const end = Date.parse(license.expires_at);
    if (!Number.isFinite(end) || end <= now) return { licensed: false, reason: "EXPIRED", license };
    license.remaining_days = Math.ceil((end - now) / DAY);
  }

  const receipt = state.receipt ? verifySigned(state.receipt, publicKeyPem, "MENU-OS-RECEIPT") : null;
  if (!receipt || receipt.license_id !== lic.license_id) return { licensed: false, reason: "NOT_VERIFIED", license };
  const checkedAt = Date.parse(receipt.checked_at);
  license.checked_at = receipt.checked_at;
  if (receipt.status === "revoked") return { licensed: false, reason: "REVOKED", license };
  if (receipt.status !== "active") return { licensed: false, reason: "EXPIRED", license };
  // A clock set well before the last check is someone stretching the grace period.
  if (!Number.isFinite(checkedAt) || now < checkedAt - 10 * 60_000) return { licensed: false, reason: "CLOCK", license };
  if (now - checkedAt > graceDays * DAY) return { licensed: false, reason: "OFFLINE_TOO_LONG", license };
  license.offline_days_left = Math.max(0, Math.ceil((checkedAt + graceDays * DAY - now) / DAY));
  return { licensed: true, reason: "OK", license };
}

function createLicenseGuard(options = {}) {
  const env = options.env ?? process.env;
  const serverUrl = String(env.MENU_OS_LICENSE_SERVER || "").trim().replace(/\/+$/, "");
  const pinnedKey = String(env.MENU_OS_LICENSE_PUBLIC_KEY || "").replace(/\\n/g, "\n").trim() || null;
  const graceDays = Math.max(1, Number(env.MENU_OS_LICENSE_GRACE_DAYS) || 7);
  const checkEveryMs = Math.max(0.25, Number(env.MENU_OS_LICENSE_CHECK_HOURS) || 6) * 3_600_000;
  const dataDir = options.dataDir ?? path.resolve(__dirname, "..", ".license");
  const stateFile = path.join(dataDir, "license.json");
  const fetchImpl = options.fetch ?? globalThis.fetch;
  const page = fs.readFileSync(path.join(__dirname, "license.html"), "utf8");

  let state = load();
  let checking = null;
  let lastError = null;
  const attempts = [];

  function load() {
    try {
      return JSON.parse(fs.readFileSync(stateFile, "utf8"));
    } catch {
      return {};
    }
  }
  function save() {
    fs.mkdirSync(dataDir, { recursive: true });
    const tmp = `${stateFile}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
    fs.renameSync(tmp, stateFile);
  }
  const publicKey = () => pinnedKey || state.publicKeyPem || null;
  const current = () => evaluate(state, { publicKeyPem: publicKey(), graceDays });

  function serverProblem() {
    if (!serverUrl) return "MENU_OS_LICENSE_SERVER is not set";
    try {
      const u = new URL(serverUrl);
      const local = /^(localhost|127\.|\[::1\])/.test(u.hostname);
      if (u.protocol !== "https:" && !local) return "MENU_OS_LICENSE_SERVER must be an https:// address";
    } catch {
      return "MENU_OS_LICENSE_SERVER is not a valid URL";
    }
    return null;
  }

  async function call(pathname, init) {
    const res = await fetchImpl(`${serverUrl}${pathname}`, { ...init, signal: AbortSignal.timeout(10_000), headers: { "Content-Type": "application/json" } });
    const json = await res.json().catch(() => null);
    if (!json) throw new Error(`license server answered ${res.status}`);
    return json;
  }

  async function ensureKey(fresh = false) {
    if (publicKey() && !fresh) return publicKey();
    const json = await call("/api/public-key", { method: "GET" });
    if (json.product !== PRODUCT || typeof json.public_key !== "string" || !/BEGIN PUBLIC KEY/.test(json.public_key)) throw new Error("license server returned no Menu OS key");
    return json.public_key;
  }

  /** Asks the license site about `token`. Resolves to { ok, receipt, answer, key } — never throws for a "no". */
  async function askServer(token, key) {
    const answer = await call("/api/verify", { method: "POST", body: JSON.stringify({ token }) });
    const receipt = typeof answer.receipt === "string" && verifySigned(answer.receipt, key, "MENU-OS-RECEIPT") ? answer.receipt : null;
    return { ok: answer.valid === true && answer.status === "active" && !!receipt, receipt, answer };
  }

  /** Periodic / start-up check of the stored license. Network trouble keeps the last receipt. */
  function check() {
    if (checking) return checking;
    checking = (async () => {
      if (!state.token) return;
      const problem = serverProblem();
      if (problem) {
        lastError = problem;
        return;
      }
      try {
        const key = publicKey();
        if (!key) throw new Error("no license public key yet — activate again");
        const { receipt, answer } = await askServer(state.token, key);
        if (receipt) {
          state.receipt = receipt; // active, expired or revoked — all signed, all recorded
          state.lastCheckedAt = new Date().toISOString();
          save();
          lastError = null;
        } else {
          // The site no longer recognises this token at all (bad signature / other product).
          lastError = answer.error || "license rejected by the license server";
          state.receipt = null;
          save();
        }
      } catch (err) {
        lastError = `license server unreachable: ${err.message}`;
      }
    })().finally(() => {
      checking = null;
    });
    return checking;
  }

  async function activate(rawToken) {
    const token = String(rawToken || "").trim();
    if (token.split(".").length !== 3) return { ok: false, error: "That is not a Menu OS license token." };
    const problem = serverProblem();
    if (problem) return { ok: false, error: `Licensing is not configured on this server: ${problem}.` };
    try {
      let key = await ensureKey();
      // The license site may have a new key since this server first pinned one (e.g. it was
      // moved or re-deployed). Unless the key is pinned in config, take the site's current
      // key — the site must still confirm this very license below before anything changes.
      if (!verifySigned(token, key, "JWT") && !pinnedKey) key = await ensureKey(true);
      if (!verifySigned(token, key, "JWT")) return { ok: false, error: "This license is not a valid Menu OS license." };
      const { ok, receipt, answer } = await askServer(token, key);
      if (!ok) {
        const why = answer.status === "revoked" ? "This license has been revoked." : answer.status === "expired" ? "This license has expired." : answer.error || "The license server rejected this license.";
        return { ok: false, error: why };
      }
      // Only a license the site confirms replaces the current one.
      state = { token, receipt, publicKeyPem: pinnedKey ? undefined : key, activatedAt: new Date().toISOString(), lastCheckedAt: new Date().toISOString() };
      save();
      lastError = null;
      return { ok: true, status: publicStatus() };
    } catch (err) {
      return { ok: false, error: `Could not reach the license server (${err.message}). Check the internet connection and try again.` };
    }
  }

  function publicStatus() {
    const s = current();
    return {
      licensed: s.licensed,
      reason: s.reason,
      license: s.license ?? null,
      grace_days: graceDays,
      last_checked_at: state.lastCheckedAt ?? null,
      last_error: lastError,
      server_configured: !serverProblem(),
    };
  }

  let timer = null;
  function start() {
    if (timer) return;
    check();
    timer = setInterval(check, checkEveryMs);
    timer.unref?.();
  }

  const OPEN_PATHS = ["/favicon.ico", "/manifest.json", "/manifest.webmanifest"];
  function send(res, status, body, type = "application/json; charset=utf-8") {
    res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
    res.end(typeof body === "string" ? body : JSON.stringify(body));
  }
  function readBody(req) {
    return new Promise((resolve) => {
      let data = "";
      req.on("data", (c) => {
        data += c;
        if (data.length > 20_000) req.destroy();
      });
      req.on("end", () => resolve(data));
      req.on("error", () => resolve(""));
    });
  }

  /** The request gate. Returns true when it answered the request itself. */
  function handle(req, res) {
    const url = new URL(req.url, "http://x");
    const p = url.pathname;

    if (p === "/license" && req.method === "GET") {
      send(res, 200, page, "text/html; charset=utf-8");
      return true;
    }
    if (p === "/__license/status" && req.method === "GET") {
      send(res, 200, publicStatus());
      return true;
    }
    if (p === "/__license/activate" && req.method === "POST") {
      const now = Date.now();
      while (attempts.length && attempts[0] < now - 60_000) attempts.shift();
      if (attempts.length >= 10) {
        send(res, 429, { ok: false, error: "Too many attempts. Wait a minute and try again." });
        return true;
      }
      attempts.push(now);
      readBody(req).then(async (raw) => {
        let token = "";
        try {
          token = JSON.parse(raw).token;
        } catch {
          token = raw;
        }
        const result = await activate(token);
        send(res, result.ok ? 200 : 400, result);
      });
      return true;
    }

    if (current().licensed || OPEN_PATHS.includes(p)) return false;

    if (p.startsWith("/api/") || p.startsWith("/socket.io")) {
      send(res, 403, { error: "LICENSE_REQUIRED", reason: current().reason });
    } else {
      res.writeHead(302, { Location: "/license", "Cache-Control": "no-store" });
      res.end();
    }
    return true;
  }

  return { handle, start, check, activate, status: publicStatus, isLicensed: () => current().licensed };
}

module.exports = { createLicenseGuard, evaluate, verifySigned, PRODUCT };
