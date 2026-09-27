import { PRODUCT, json, corsPreflight, readJson, verifyLicenseToken, licenseTiming, listLicenses, signReceipt } from './_lib.mjs';

export const config = { path: ['/api/licenses/verify', '/api/verify'], method: ['POST', 'OPTIONS'] };

// Public: Menu OS installations call this to check their license. The answer covers the
// signature, the product, expiry (none for Lifetime) and revocation — a license deleted in
// the panel is revoked, even though its token is still correctly signed. Every answer for
// a genuine token carries a signed `receipt` that Menu OS caches for offline grace.
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
  if (payload.product !== PRODUCT) {
    return json({ valid: false, error: 'This license is not for Menu OS' });
  }

  const licenses = await listLicenses();
  const revoked = !licenses.some((l) => l.license_id === payload.license_id);
  const timing = licenseTiming(payload);
  const status = revoked ? 'revoked' : timing.expired ? 'expired' : 'active';

  const receipt = await signReceipt({
    license_id: payload.license_id,
    client_id: payload.client_id,
    status,
    lifetime: timing.lifetime,
    expires_at: payload.expires_at ?? null,
  });

  if (revoked) {
    return json({ valid: false, revoked: true, status, error: 'This license has been revoked', license_id: payload.license_id, receipt });
  }

  return json({
    valid: true,
    status,
    expired: timing.expired,
    lifetime: timing.lifetime,
    client_id: payload.client_id,
    plan_type: payload.plan_type,
    features: Array.isArray(payload.features) ? payload.features : [],
    issued_at: payload.issued_at,
    expires_at: payload.expires_at ?? null,
    remaining_days: timing.remaining_days,
    license_id: payload.license_id,
    receipt,
  });
};
