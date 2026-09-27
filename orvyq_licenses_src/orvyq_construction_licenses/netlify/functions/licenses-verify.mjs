import { json, corsPreflight, readJson, verifyLicenseToken } from './_lib.mjs';

export const config = { path: ['/api/licenses/verify', '/api/verify'], method: ['POST', 'OPTIONS'] };

export default async (req) => {
  if (req.method === 'OPTIONS') return corsPreflight();

  const body = await readJson(req);
  const token = String(body.token || '').trim();
  if (!token) {
    return json({ valid: false, error: 'License token is required' }, 400);
  }

  const result = await verifyLicenseToken(token);
  if (!result.valid) return json({ valid: false, error: result.error });

  const payload = result.payload;
  const expires = new Date(payload.expires_at);
  const now = new Date();
  const expired = isNaN(expires.getTime()) || expires <= now;
  const remaining_days = expired ? 0 : Math.max(0, Math.ceil((expires - now) / 86400000));

  return json({
    valid: true,
    expired,
    client_id: payload.client_id,
    plan_type: payload.plan_type,
    features: Array.isArray(payload.features) ? payload.features : [],
    issued_at: payload.issued_at,
    expires_at: payload.expires_at,
    remaining_days,
    license_id: payload.license_id,
  });
};