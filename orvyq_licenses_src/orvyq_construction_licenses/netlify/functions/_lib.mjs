import crypto from 'node:crypto';
import { getStore } from '@netlify/blobs';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_JWT_SECRET =
  process.env.ADMIN_JWT_SECRET ||
  crypto.createHash('sha256').update(`construction-os|${ADMIN_PASSWORD || ''}`).digest('hex');
const ADMIN_SESSION_DAYS = 14;

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
  return getStore({ name });
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

export async function signLicense(payload) {
  const { privateKeyPem } = await getLicenseKeyPair();
  const privateKey = crypto.createPrivateKey(privateKeyPem);
  const header = b64url(JSON.stringify({ alg: 'Ed25519', typ: 'JWT' }));
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