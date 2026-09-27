const crypto = require('crypto');

const memoryStores = {};
globalThis.__netlifyBlobsOverride = (name) => {
  if (!memoryStores[name]) memoryStores[name] = {};
  const store = memoryStores[name];
  return {
    getJSON: async (key) => {
      const value = store[key];
      return value === undefined ? null : JSON.parse(value);
    },
    setJSON: async (key, value) => {
      store[key] = JSON.stringify(value);
    },
    get: async (key, options) => {
      const value = store[key];
      if (value === undefined || value === null) return null;
      if (options && options.type === 'json') return JSON.parse(value);
      return value;
    },
    set: async (key, value) => {
      store[key] = value;
    },
  };
};

const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');
process.env.LICENSE_PRIVATE_KEY = privateKey.export({ type: 'pkcs8', format: 'pem' });
process.env.LICENSE_PUBLIC_KEY = publicKey.export({ type: 'spki', format: 'pem' });
process.env.ADMIN_USERNAME = 'ProjectAdmin';
process.env.ADMIN_PASSWORD = 'ZXCV1234!@#$';

let failures = 0;
function assert(condition, message) {
  if (!condition) {
    console.error('FAIL:', message);
    failures++;
  } else {
    console.log('PASS:', message);
  }
}

function req(method, path, body, headers) {
  return new Request('http://v2.local' + path, {
    method,
    body: body === undefined ? null : JSON.stringify(body),
    headers: Object.assign({'content-type': 'application/json'}, headers || {}),
  });
}

(async () => {
  const login = await import('../netlify/functions/login.mjs');
  const me = await import('../netlify/functions/auth-me.mjs');
  const list = await import('../netlify/functions/licenses-list.mjs');
  const create = await import('../netlify/functions/licenses-create.mjs');
  const del = await import('../netlify/functions/licenses-delete.mjs');
  const verify = await import('../netlify/functions/licenses-verify.mjs');

  let res = await login.default(req('POST', '/api/login', { username: 'x', password: 'y' }));
  assert(res.status === 401, 'wrong credentials rejected');

  res = await login.default(req('POST', '/api/login', { username: 'ProjectAdmin', password: 'ZXCV1234!@#$' }));
  assert(res.status === 200, 'login succeeds');
  const auth = await res.json();
  assert(auth.token && auth.user.username === 'ProjectAdmin', 'login returns token + user');
  const headers = { authorization: 'Bearer ' + auth.token };

  res = await me.default(req('GET', '/api/auth/me', undefined, headers));
  const meBody = await res.json();
  assert(res.status === 200 && meBody.user.username === 'ProjectAdmin', 'auth/me returns user');

  res = await create.default(req('POST', '/api/licenses/create', { client_id: 'BuildCo', duration: 30 }, headers));
  const created = await res.json();
  assert(res.status === 200 && created.success, 'license created (duration)');
  const token = created.license.token;
  assert(created.license.plan_type === 'Standard', 'plan_type is Standard');
  assert(Array.isArray(created.license.features) && created.license.features.length === 0, 'features is empty array');

  res = await create.default(req('POST', '/api/licenses/create', { client_id: 'Site-002', custom_date: '2030-01-01' }, headers));
  const created2 = await res.json();
  assert(res.status === 200 && created2.license.expires_at.indexOf('2030-01-01') === 0, 'license created (custom date)');

  res = await create.default(req('POST', '/api/licenses/create', { client_id: 'X', duration: 'bogus' }, headers));
  assert(res.status === 400, 'invalid duration rejected');

  res = await create.default(req('POST', '/api/licenses/create', { client_id: 'X', duration: 30 }));
  assert(res.status === 401, 'create without auth rejected');

  res = await list.default(req('GET', '/api/licenses/list', undefined, headers));
  const listBody = await res.json();
  assert(res.status === 200 && listBody.licenses.length === 2, 'list returns 2 licenses');

  res = await verify.default(req('POST', '/api/verify', { token }));
  const vRes = await res.json();
  assert(res.status === 200 && vRes.valid === true, 'verify returns valid');
  assert(vRes.client_id === 'BuildCo' && vRes.remaining_days <= 30, 'verify returns license details');

  res = await verify.default(req('POST', '/api/verify', { token }));
  assert(res.status === 200, 'verify is public');

  res = await verify.default(req('POST', '/api/verify', { token: token.slice(0, -10) + 'AAAA' }));
  const bad = await res.json();
  assert(bad.valid === false && bad.error, 'verify rejects tampered token');

  res = await verify.default(req('POST', '/api/verify', {}));
  assert(res.status === 400, 'verify requires token');

  const idToDelete = created.license.license_id;
  res = await del.default(req('POST', '/api/licenses/delete', { license_id: idToDelete }, headers));
  const delBody = await res.json();
  assert(res.status === 200 && delBody.licenses.length === 1, 'delete removes license');

  console.log(failures === 0 ? 'ALL E2E TESTS PASSED' : failures + ' E2E TEST(S) FAILED');
  process.exitCode = failures === 0 ? 0 : 1;
})().catch((err) => {
  console.error('E2E ERROR:', err);
  process.exitCode = 1;
});