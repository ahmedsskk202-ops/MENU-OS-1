import { describe, expect, it } from "vitest";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { evaluate, createLicenseGuard } = require("../license/guard.js");

// A stand-in for the Menu OS License site: same token format (Ed25519, "JWT" / "MENU-OS-RECEIPT").
const keys = crypto.generateKeyPairSync("ed25519");
const PUB = keys.publicKey.export({ type: "spki", format: "pem" }).toString();
const other = crypto.generateKeyPairSync("ed25519");
const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");
function sign(payload: object, typ = "JWT", key = keys.privateKey) {
  const input = `${b64({ alg: "Ed25519", typ })}.${b64(payload)}`;
  return `${input}.${crypto.sign(null, Buffer.from(input), key).toString("base64url")}`;
}
const DAY = 86_400_000;
const lic = (over: object = {}) => ({ product: "menu-os", client_id: "Grinders", plan_type: "Standard", lifetime: false, expires_at: new Date(Date.now() + 30 * DAY).toISOString(), license_id: "L1", ...over });
const receipt = (over: object = {}) => sign({ product: "menu-os", license_id: "L1", status: "active", checked_at: new Date().toISOString(), ...over }, "MENU-OS-RECEIPT");
const ev = (state: object, now?: number) => evaluate(state, { publicKeyPem: PUB, graceDays: 7, now });

describe("license decision (offline, from stored state)", () => {
  it("nothing stored → not activated", () => {
    expect(ev({}).reason).toBe("NOT_ACTIVATED");
  });

  it("valid token + fresh active receipt → licensed", () => {
    const s = ev({ token: sign(lic()), receipt: receipt() });
    expect(s).toMatchObject({ licensed: true, reason: "OK" });
    expect(s.license.remaining_days).toBe(30);
  });

  it("lifetime license never expires, even years later (with a recent check)", () => {
    const later = Date.now() + 20 * 365 * DAY;
    const s = ev({ token: sign(lic({ lifetime: true, expires_at: null, plan_type: "Lifetime" })), receipt: receipt({ checked_at: new Date(later - DAY).toISOString() }) }, later);
    expect(s).toMatchObject({ licensed: true, license: { lifetime: true, expires_at: null } });
  });

  it("finite license stops on its date even offline with a good receipt", () => {
    expect(ev({ token: sign(lic({ expires_at: new Date(Date.now() - 1000).toISOString() })), receipt: receipt() }).reason).toBe("EXPIRED");
  });

  it("revoked or expired receipts lock the system", () => {
    expect(ev({ token: sign(lic()), receipt: receipt({ status: "revoked" }) }).reason).toBe("REVOKED");
    expect(ev({ token: sign(lic()), receipt: receipt({ status: "expired" }) }).reason).toBe("EXPIRED");
  });

  it("offline grace: fine within 7 days, locked after", () => {
    const token = sign(lic({ lifetime: true, expires_at: null }));
    expect(ev({ token, receipt: receipt({ checked_at: new Date(Date.now() - 6 * DAY).toISOString() }) }).licensed).toBe(true);
    expect(ev({ token, receipt: receipt({ checked_at: new Date(Date.now() - 8 * DAY).toISOString() }) }).reason).toBe("OFFLINE_TOO_LONG");
  });

  it("forged or edited state is refused", () => {
    // token signed by someone else
    expect(ev({ token: sign(lic(), "JWT", other.privateKey), receipt: receipt() }).reason).toBe("INVALID");
    // a token for another product
    expect(ev({ token: sign(lic({ product: "construction-os" })), receipt: receipt() }).reason).toBe("INVALID");
    // a receipt passed off as the license
    expect(ev({ token: receipt(), receipt: receipt() }).reason).toBe("INVALID");
    // receipt for a different license
    expect(ev({ token: sign(lic()), receipt: receipt({ license_id: "OTHER" }) }).reason).toBe("NOT_VERIFIED");
    // receipt with its checked_at edited (signature breaks)
    const r = receipt({ checked_at: new Date(Date.now() - 30 * DAY).toISOString() }).split(".");
    const edited = `${r[0]}.${b64({ product: "menu-os", license_id: "L1", status: "active", checked_at: new Date().toISOString() })}.${r[2]}`;
    expect(ev({ token: sign(lic()), receipt: edited }).reason).toBe("NOT_VERIFIED");
  });

  it("clock turned back before the last check is refused", () => {
    expect(ev({ token: sign(lic({ lifetime: true, expires_at: null })), receipt: receipt() }, Date.now() - 2 * DAY).reason).toBe("CLOCK");
  });
});

describe("activation and re-checks against the license site", () => {
  function site(answer: (token: string) => object) {
    const calls: string[] = [];
    const fetch = async (url: string, init: { body?: string }) => {
      calls.push(url);
      if (url.endsWith("/api/public-key")) return new Response(JSON.stringify({ product: "menu-os", public_key: PUB }));
      return new Response(JSON.stringify(answer(JSON.parse(init.body || "{}").token)));
    };
    return { fetch, calls };
  }
  const env = { MENU_OS_LICENSE_SERVER: "https://licenses.example" };
  const dir = () => fs.mkdtempSync(path.join(os.tmpdir(), "mos-lic-"));

  it("activates a lifetime license confirmed by the site, and persists it", async () => {
    const token = sign(lic({ lifetime: true, expires_at: null }));
    const { fetch } = site(() => ({ valid: true, status: "active", receipt: receipt() }));
    const d = dir();
    const g = createLicenseGuard({ env, dataDir: d, fetch });
    const r = await g.activate(token);
    expect(r.ok).toBe(true);
    expect(g.isLicensed()).toBe(true);
    // a restart reads it back
    expect(createLicenseGuard({ env, dataDir: d, fetch }).isLicensed()).toBe(true);
  });

  it("refuses revoked, expired, foreign and garbage tokens without touching the stored license", async () => {
    const d = dir();
    const good = sign(lic());
    const g = createLicenseGuard({ env, dataDir: d, fetch: site(() => ({ valid: true, status: "active", receipt: receipt() })).fetch });
    await g.activate(good);
    const bad = createLicenseGuard({ env, dataDir: d, fetch: site(() => ({ valid: false, revoked: true, status: "revoked", receipt: receipt({ status: "revoked" }) })).fetch });
    expect((await bad.activate(sign(lic({ license_id: "L2" })))).error).toMatch(/revoked/);
    expect((await bad.activate(sign(lic(), "JWT", other.privateKey))).ok).toBe(false);
    expect((await bad.activate("not a token")).ok).toBe(false);
    expect(bad.isLicensed()).toBe(true); // still the original, good license
  });

  it("after the license site changes its key, a license from the new site can still be activated", async () => {
    const d = dir();
    const g = createLicenseGuard({ env, dataDir: d, fetch: site(() => ({ valid: true, status: "active", receipt: receipt() })).fetch });
    await g.activate(sign(lic()));
    // the site is re-deployed with a new key pair
    const next = crypto.generateKeyPairSync("ed25519");
    const nextPub = next.publicKey.export({ type: "spki", format: "pem" }).toString();
    const signNext = (p: object, typ = "JWT") => sign(p, typ, next.privateKey);
    const fetch2 = async (url: string) => {
      if (url.endsWith("/api/public-key")) return new Response(JSON.stringify({ product: "menu-os", public_key: nextPub }));
      return new Response(JSON.stringify({ valid: true, status: "active", receipt: signNext({ product: "menu-os", license_id: "N1", status: "active", checked_at: new Date().toISOString() }, "MENU-OS-RECEIPT") }));
    };
    const g2 = createLicenseGuard({ env, dataDir: d, fetch: fetch2 });
    const r = await g2.activate(signNext(lic({ license_id: "N1" })));
    expect(r.ok).toBe(true);
    expect(g2.status()).toMatchObject({ licensed: true, license: { license_id: "N1" } });
  });

  it("a re-check that comes back revoked locks the system", async () => {
    let status = "active";
    const { fetch } = site(() => ({ valid: status === "active", status, receipt: receipt({ status }) }));
    const g = createLicenseGuard({ env, dataDir: dir(), fetch });
    await g.activate(sign(lic()));
    expect(g.isLicensed()).toBe(true);
    status = "revoked";
    await g.check();
    expect(g.status()).toMatchObject({ licensed: false, reason: "REVOKED" });
  });

  it("license site unreachable: keeps working on the last receipt", async () => {
    let up = true;
    const inner = site(() => ({ valid: true, status: "active", receipt: receipt() }));
    const fetch = async (u: string, i: { body?: string }) => { if (!up) throw new Error("ENOTFOUND"); return inner.fetch(u, i); };
    const g = createLicenseGuard({ env, dataDir: dir(), fetch });
    await g.activate(sign(lic()));
    up = false;
    await g.check();
    expect(g.status()).toMatchObject({ licensed: true, last_error: expect.stringMatching(/unreachable/) });
  });

  it("refuses a plain-http license server (except localhost), and no server at all", async () => {
    const g1 = createLicenseGuard({ env: { MENU_OS_LICENSE_SERVER: "http://licenses.example" }, dataDir: dir(), fetch: site(() => ({})).fetch });
    expect((await g1.activate(sign(lic()))).error).toMatch(/https/);
    const g2 = createLicenseGuard({ env: {}, dataDir: dir(), fetch: site(() => ({})).fetch });
    expect((await g2.activate(sign(lic()))).error).toMatch(/not set/);
    expect(g2.status()).toMatchObject({ licensed: false, reason: "NOT_ACTIVATED", server_configured: false });
  });
});
