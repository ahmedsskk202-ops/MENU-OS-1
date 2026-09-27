import crypto from 'node:crypto';
import { getStore } from '@netlify/blobs';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_JWT_SECRET =
  process.env.ADMIN_JWT_SECRET ||
  crypto.createHash('sha256').update(`menu-os|${ADMIN_PASSWORD || ''}`).digest('hex');
const ADMIN_SESSION_DAYS = 14;

// Every token this server issues is stamped with the product it unlocks; Menu OS refuses
// tokens for anything else (e.g. a Construction OS license signed with another key).
export const PRODUCT = 'menu-os';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

function b64url(input) {
  return Buffer.from(input).toString('base64url');
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

export function corsPreflight(req) {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function readJson(req) {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

function storeFor(name) {
  const override = globalThis.__netlifyBlobsOverride;
  if (typeof override === 'function') return override(name);
  // Strong consistency: a license is verified (and revoked) right after it is saved or
  // deleted — the default eventual consistency answered "revoked" for a license created
  // seconds earlier.
  return getStore({ name, consistency: 'strong' });
}

function createHsJwt(payload) {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64url(JSON.stringify(payload));
  const signingInput = `${header}.${body}`;
  const signature = b64url(crypto.createHmac('sha256', ADMIN_JWT_SECRET).update(signingInput).digest());
  return `${signingInput}.${signature}`;
}

export function issueAdminToken(user) {
  const nowSec = Math.floor(Date.now() / 1000);
  return createHsJwt({
    id: user.id,
    username: user.username,
    exp: nowSec + ADMIN_SESSION_DAYS * 24 * 60 * 60,
  });
}

export function verifyHsJwt(token) {
  try {
    const parts = String(token || '').split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const signingInput = `${header}.${body}`;
    const expected = crypto.createHmac('sha256', ADMIN_JWT_SECRET).update(signingInput).digest();
    const received = Buffer.from(signature, 'base64url');
    if (received.length !== expected.length) return null;
    if (!crypto.timingSafeEqual(expected, received)) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function requireAuth(req) {
  const auth = req.headers.get('authorization') || '';
  const match = auth.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  const payload = verifyHsJwt(match[1]);
  if (!payload) return null;
  return { id: payload.id, username: payload.username };
}

function pemFromEnv(value) {
  return String(value || '').replace(/\\n/g, '\n');
}

let cachedKeyPair = null;

export function resetKeyCache() {
  cachedKeyPair = null;
}

export async function getLicenseKeyPair() {
  if (cachedKeyPair) return cachedKeyPair;
  if (process.env.LICENSE_PRIVATE_KEY && process.env.LICENSE_PUBLIC_KEY) {
    cachedKeyPair = {
      privateKeyPem: pemFromEnv(process.env.LICENSE_PRIVATE_KEY),
      publicKeyPem: pemFromEnv(process.env.LICENSE_PUBLIC_KEY),
    };
    return cachedKeyPair;
  }
  const store = storeFor('keystore');
  let pair = await store.get('ed25519', { type: 'json' });
  if (pair && pair.privateKeyPem && pair.publicKeyPem) {
    cachedKeyPair = pair;
    return pair;
  }
  const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');
  pair = {
    privateKeyPem: privateKey.export({ type: 'pkcs8', format: 'pem' }),
    publicKeyPem: publicKey.export({ type: 'spki', format: 'pem' }),
    createdAt: new Date().toISOString(),
  };
  await store.setJSON('ed25519', pair);
  cachedKeyPair = pair;
  return pair;
}

export async function signLicense(payload, typ = 'JWT') {
  const { privateKeyPem } = await getLicenseKeyPair();
  const privateKey = crypto.createPrivateKey(privateKeyPem);
  const header = b64url(JSON.stringify({ alg: 'Ed25519', typ }));
  const body = b64url(JSON.stringify(payload));
  const signingInput = `${header}.${body}`;
  const signature = b64url(crypto.sign(null, Buffer.from(signingInput), privateKey));
  return `${signingInput}.${signature}`;
}

export async function verifyLicenseToken(token) {
  const result = { valid: false, error: 'Invalid license token' };
  try {
    const parts = String(token || '').trim().split('.');
    if (parts.length !== 3) return result;
    const [header, body, signature] = parts;
    let headerJson;
    try {
      headerJson = JSON.parse(Buffer.from(header, 'base64url').toString('utf8'));
    } catch {
      return result;
    }
    if (!headerJson || headerJson.alg !== 'Ed25519') {
      return { valid: false, error: 'Unsupported license token algorithm' };
    }
    // A verify receipt is signed with the same key; it must never pass as a license.
    if (headerJson.typ !== 'JWT') return { valid: false, error: 'Not a license token' };
    const { publicKeyPem } = await getLicenseKeyPair();
    const publicKey = crypto.createPublicKey(publicKeyPem);
    const ok = crypto.verify(null, Buffer.from(`${header}.${body}`), publicKey, Buffer.from(signature, 'base64url'));
    if (!ok) return { valid: false, error: 'Invalid license signature' };
    let payload;
    try {
      payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    } catch {
      return result;
    }
    return { valid: true, payload };
  } catch {
    return result;
  }
}

/**
 * A signed statement of what the server just decided about a license, handed back with
 * every verify. Menu OS keeps the latest one so it can keep running through an internet
 * outage for a grace period — and because it is signed, that cached "valid as of <time>"
 * can't be edited to extend itself.
 */
export async function signReceipt(fields) {
  return signLicense({ ...fields, product: PRODUCT, checked_at: new Date().toISOString() }, 'MENU-OS-RECEIPT');
}

/** Status of a license payload right now. A lifetime license has no expiry at all. */
export function licenseTiming(payload) {
  if (payload.lifetime === true || payload.expires_at === null) {
    return { lifetime: true, expired: false, remaining_days: null };
  }
  const expires = new Date(payload.expires_at);
  const now = new Date();
  const expired = isNaN(expires.getTime()) || expires <= now;
  return { lifetime: false, expired, remaining_days: expired ? 0 : Math.max(0, Math.ceil((expires - now) / 86400000)) };
}

export async function getPublicKeyPem() {
  const { publicKeyPem } = await getLicenseKeyPair();
  return publicKeyPem;
}

export async function listLicenses() {
  const store = storeFor('licenses');
  const data = await store.get('licenses', { type: 'json' });
  return Array.isArray(data) ? data : [];
}

export async function saveLicenses(licenses) {
  const store = storeFor('licenses');
  await store.setJSON('licenses', licenses);
}

export { ADMIN_USERNAME, ADMIN_PASSWORD, CORS_HEADERS };