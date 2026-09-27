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

const primary = crypto.generateKeyPairSync('ed25519');
const primaryPrivate = primary.privateKey.export({ type: 'pkcs8', format: 'pem' });
const primaryPublic = primary.publicKey.export({ type: 'spki', format: 'pem' });

process.env.LICENSE_PRIVATE_KEY = primaryPrivate;
process.env.LICENSE_PUBLIC_KEY = primaryPublic;
process.env.ADMIN_USERNAME = 'ProjectAdmin';
process.env.ADMIN_PASSWORD = 'test-password';

function assert(condition, message) {
  if (!condition) {
    console.error('FAIL:', message);
    process.exitCode = 1;
  } else {
    console.log('PASS:', message);
  }
}

(async () => {
  const lib = await import('../netlify/functions/_lib.mjs');

  const adminToken = lib.issueAdminToken({ id: 1, username: 'ProjectAdmin' });
  const decoded = lib.verifyHsJwt(adminToken);
  assert(decoded && decoded.username === 'ProjectAdmin', 'admin JWT round-trips');

  const tamperedAdmin = adminToken.slice(0, -8) + 'AAAAAAAA';
  assert(lib.verifyHsJwt(tamperedAdmin) === null, 'tampered admin JWT rejected');

  const payload = {
    client_id: 'BuildCo',
    plan_type: 'Standard',
    expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
    features: [],
    issued_at: new Date().toISOString(),
    license_id: crypto.randomUUID(),
  };

  const token = await lib.signLicense(payload);
  const verified = await lib.verifyLicenseToken(token);
  assert(verified.valid === true, 'license token verifies');
  assert(verified.payload.client_id === 'BuildCo', 'license payload intact');

  const tampered = token.slice(0, -10) + 'AAAAAAAAAA=';
  const bad = await lib.verifyLicenseToken(tampered);
  assert(bad.valid === false, 'tampered license token rejected');
  assert(bad.error && bad.error.length > 0, 'tampered license returns error reason');

  const other = crypto.generateKeyPairSync('ed25519');
  process.env.LICENSE_PRIVATE_KEY = other.privateKey.export({ type: 'pkcs8', format: 'pem' });
  process.env.LICENSE_PUBLIC_KEY = other.publicKey.export({ type: 'spki', format: 'pem' });
  lib.resetKeyCache();
  const foreignToken = await lib.signLicense(payload);
  process.env.LICENSE_PRIVATE_KEY = primaryPrivate;
  process.env.LICENSE_PUBLIC_KEY = primaryPublic;
  lib.resetKeyCache();
  const foreign = await lib.verifyLicenseToken(foreignToken);
  assert(foreign.valid === false, 'foreign-key license token rejected');

  const malformed = await lib.verifyLicenseToken('not-a-token');
  assert(malformed.valid === false, 'malformed token rejected');

  const empty = await lib.verifyLicenseToken('');
  assert(empty.valid === false, 'empty token rejected');

  console.log(process.exitCode ? 'Smoke test completed with failures.' : 'SMOKE TESTS PASSED');
})();