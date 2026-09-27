/**
 * Grinders prototype — end-to-end verification.
 *
 * Run with the dev server up and the Grinders seed applied:
 *   npm run db:seed:grinders
 *   PORT=3100 npm run dev
 *   node scripts/grinders-verify.mjs
 *
 * Covers the real menu data, the locally-served assets, bilingual naming, the
 * Small/Medium/Large size selector, and — most importantly — that size pricing is
 * enforced SERVER-side (a Large order must total 7000 IQD, not the 6000 base) and
 * that a size option cannot be forced onto a product which has no size group.
 */
const BASE = process.env.BASE_URL || "http://localhost:3100";
import { readFile } from "node:fs/promises";
let pass = 0, fail = 0;
const ok = (name, cond, detail = "") => {
  if (cond) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name}  ${detail}`); }
};

// ── Locate the Grinders branch from a QR token ───────────────────────────
// The redirect response sets the table-session cookie, so carry cookies through
// every subsequent call — /api/session identifies the table by that cookie alone.
let jar = new Map();
const remember = (res) => {
  for (const c of res.headers.getSetCookie?.() ?? []) {
    const [pair] = c.split(";");
    const eq = pair.indexOf("=");
    jar.set(pair.slice(0, eq), pair.slice(eq + 1));
  }
  return res;
};
const cookieHeader = () => [...jar].map(([k, v]) => `${k}=${v}`).join("; ");

const j2 = async (path, init = {}) => {
  const res = await fetch(BASE + path, { ...init, headers: { ...(init.headers ?? {}), cookie: cookieHeader() } });
  remember(res);
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
};

const r1 = remember(await fetch(`${BASE}/r/grinders-table-1`, { redirect: "manual" }));
const loc = new URL(r1.headers.get("location") || "http://x/", BASE);
const sessionPath = loc.pathname;
ok("QR /r/grinders-table-1 redirects to a table session", /^\/t\/[^/]+$/.test(sessionPath), sessionPath);

const sess = await j2("/api/session");
const sessionId = sessionPath.split("/").pop();
ok("GET /api/session returns the Grinders table session", sess.status === 200 && !!sess.body?.branch, `status ${sess.status}`);
const branchId = sess.body?.branch?.id;

// ── Menu data is the real Grinders menu ───────────────────────────────────
const menu = await j2(`/api/menu?branchId=${branchId}`);
const cats = menu.body?.menus?.[0]?.categories ?? [];
const products = cats.flatMap((c) => c.products);
ok("brand is The Grinders", menu.body?.brand?.name === "The Grinders", menu.body?.brand?.name);
ok("brand logo is the real client logo", menu.body?.brand?.logoUrl === "/brand/grinders-logo.png");
ok("currency is IQD", menu.body?.brand?.currency === "IQD");
ok("default locale is Arabic", menu.body?.brand?.defaultLocale === "ar");
ok("15 categories", cats.length === 15, `got ${cats.length}`);
ok("136 products", products.length === 136, `got ${products.length}`);
ok("every category has an Arabic name", cats.every((c) => !!c.nameAr));
ok("every product has an Arabic name", products.every((p) => !!p.nameAr));
ok("every product has an English name", products.every((p) => !!p.nameEn));
ok("every product has a local image", products.every((p) => typeof p.imageUrl === "string" && p.imageUrl.startsWith("/menu/products/")));

const sized = products.filter((p) => p.modifierGroups.some((g) => g.options.length > 1));
ok("78 products carry a size selector", sized.length === 78, `got ${sized.length}`);
const three = sized.find((p) => p.modifierGroups[0].options.length === 3);
ok("a 3-size product prices 6000/6500/7000 IQD",
  three && three.basePrice === 6000 &&
  three.modifierGroups[0].options.map((o) => o.priceDelta).join(",") === "0,500,1000",
  three ? `${three.basePrice} / ${three.modifierGroups[0].options.map((o) => o.priceDelta)}` : "none");
ok("size options are bilingual",
  three && three.modifierGroups[0].options.every((o) => o.nameAr && o.nameEn));
ok("size group is required, pick exactly one",
  three && three.modifierGroups[0].isRequired && three.modifierGroups[0].minSelect === 1 && three.modifierGroups[0].maxSelect === 1);
ok("exactly one size option is the default",
  three && three.modifierGroups[0].options.filter((o) => o.isDefault).length === 1 &&
  three.modifierGroups[0].options[0].isDefault);
ok("sizes always render smallest -> largest",
  sized.every((p) => {
    const d = p.modifierGroups[0].options.map((o) => Number(o.priceDelta));
    return d.join() === [...d].sort((a, b) => a - b).join();
  }));

// ── Price fidelity against the captured source snapshot ───────────────────
// The most important guarantee: every price the customer sees must be a price
// that is actually published by the client. This re-derives the expected price
// for all 136 products from grinders-menu.json and compares.
const snapshot = JSON.parse(
  await readFile(new URL("../packages/db/prisma/grinders-menu.json", import.meta.url), "utf8")
);
const snapshotById = new Map(
  snapshot.categories.flatMap((c) => c.products).map((p) => [p.remoteId, p])
);
let priceMismatches = 0, bogusSelectors = 0, singleSize = 0;
for (const p of products) {
  const s = snapshotById.get(p.id.split("-").pop());
  if (!s) continue;
  const offered = [s.prices.s, s.prices.m, s.prices.l].map((v) => Number(v || 0)).filter((v) => v > 0);
  const hasSelector = p.modifierGroups.some((g) => g.options.length > 1);
  if (offered.length === 1) {
    singleSize++;
    if (hasSelector) bogusSelectors++;
    if (Number(p.basePrice) !== offered[0]) priceMismatches++;
  } else {
    const want = offered.slice().sort((a, b) => a - b);
    const got = p.modifierGroups[0].options.map((o) => Number(p.basePrice) + Number(o.priceDelta));
    if (got.join() !== want.join()) priceMismatches++;
  }
}
ok("58 products are genuinely single-size", singleSize === 58, `got ${singleSize}`);
ok("no single-size product is given a size selector", bogusSelectors === 0, `${bogusSelectors} bogus`);
ok("every price matches the client's published menu", priceMismatches === 0, `${priceMismatches} mismatched`);

// ── Local assets exist (no hotlinking) ────────────────────────────────────
for (const asset of [
  "/brand/grinders-logo.png",
  `/menu/products/${products[0].imageUrl.split("/").pop()}`,
  `/menu/categories/${cats[0].imageUrl.split("/").pop()}`,
]) {
  const r = await fetch(BASE + asset);
  ok(`asset served locally: ${asset}`, r.ok && Number(r.headers.get("content-length")) > 1000, `status ${r.status}`);
}

// ── Server-authoritative size pricing is enforced on order ────────────────
const sizedProduct = three;
const bigOpt = sizedProduct.modifierGroups[0].options.find((o) => o.nameEn === "Large");
const order = await j2("/api/orders", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    clientRequestId: crypto.randomUUID(),
    lines: [{
      productId: sizedProduct.id,
      quantity: 1,
      modifierOptionIds: [bigOpt.id],
    }],
  }),
});
ok("ordering a Large size is accepted", order.status === 201, `status ${order.status} ${JSON.stringify(order.body).slice(0, 120)}`);
if (order.status === 201) {
  const total = Number(order.body?.order?.total ?? order.body?.total ?? 0);
  ok("server priced Large at 7000 IQD (not the 6000 base)", total === 7000, `total ${total}`);
}

// A product with no size group must reject an unknown modifier.
const plain = products.find((p) => !p.modifierGroups.length);
const bad = await j2("/api/orders", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    clientRequestId: crypto.randomUUID(),
    lines: [{ productId: plain.id, quantity: 1, modifierOptionIds: [sizedProduct.modifierGroups[0].options[0].id] }],
  }),
});
ok("a size modifier cannot be forced onto a non-sized product", bad.status >= 400, `status ${bad.status}`);

// ── Both guest entry points work ─────────────────────────────────────────
const guest = await fetch(`${BASE}/m/${branchId}`, { redirect: "manual" });
ok("guest menu /m/[branchId] is reachable", guest.status === 200, `status ${guest.status}`);
const menuQr = await fetch(`${BASE}/r/grinders-menu-main`, { redirect: "manual" });
ok("menu-wide QR resolves", menuQr.status === 307 || menuQr.status === 200, `status ${menuQr.status}`);

// ── Pages compile ────────────────────────────────────────────────────────
for (const p of ["/", "/admin/login"]) {
  const r = await fetch(BASE + p);
  ok(`page ${p} renders`, r.ok, `status ${r.status}`);
}

// ── Staff can sign in with the Grinders accounts ─────────────────────────
for (const [role, email] of [
  ["Owner", "admin@grinders.demo"],
  ["Cashier", "cashier@grinders.demo"],
  ["Kitchen", "kitchen@grinders.demo"],
]) {
  const csrf = await fetch(`${BASE}/api/auth/csrf`);
  const { csrfToken } = await csrf.json();
  const cookie = (csrf.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
  const body = new URLSearchParams({ csrfToken, email, password: "Password123!", callbackUrl: "/admin" });
  const res = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", cookie },
    body, redirect: "manual",
  });
  ok(`${role} can sign in (${email})`, res.status === 200 || res.status === 302, `status ${res.status}`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
