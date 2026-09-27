import crypto from 'node:crypto';
import { PRODUCT, json, corsPreflight, readJson, requireAuth, signLicense, listLicenses, saveLicenses } from './_lib.mjs';

export const config = { path: '/api/licenses/create', method: ['POST', 'OPTIONS'] };

export default async (req) => {
  if (req.method === 'OPTIONS') return corsPreflight();

  const user = requireAuth(req);
  if (!user) return json({ success: false, error: 'Unauthorized' }, 401);

  const body = await readJson(req);
  const client_id = String(body.client_id || '').trim();
  if (!client_id) {
    return json({ success: false, error: 'Client name / ID is required' }, 400);
  }

  // Lifetime: the license never expires (expires_at is null). It can still be revoked by
  // deleting it here — Menu OS checks back with this server.
  const lifetime = body.lifetime === true || body.duration === 'lifetime';
  let expires_at = null;
  if (!lifetime) {
    if (body.custom_date) {
      const date = new Date(body.custom_date);
      if (isNaN(date.getTime())) {
        return json({ success: false, error: 'Invalid custom expiry date' }, 400);
      }
      if (date <= new Date()) {
        return json({ success: false, error: 'The expiry date must be in the future' }, 400);
      }
      expires_at = date.toISOString();
    } else {
      const days = parseInt(body.duration, 10);
      if (!days || days <= 0 || days > 36500) {
        return json({ success: false, error: 'Invalid duration - pick a period between 1 day and 10 years, or Lifetime' }, 400);
      }
      const date = new Date();
      date.setDate(date.getDate() + days);
      expires_at = date.toISOString();
    }
  }

  const plan_type = lifetime ? 'Lifetime' : 'Standard';
  const issued_at = new Date().toISOString();
  const license_id = crypto.randomUUID();
  const payload = {
    product: PRODUCT,
    client_id,
    plan_type,
    lifetime,
    expires_at,
    features: [],
    issued_at,
    license_id,
  };

  try {
    const token = await signLicense(payload);
    const record = {
      license_id,
      token,
      client_id,
      plan_type,
      lifetime,
      expires_at,
      features: [],
      created_at: issued_at,
    };
    const licenses = await listLicenses();
    licenses.unshift(record);
    await saveLicenses(licenses);

    return json({
      success: true,
      license: { token, client_id, plan_type, lifetime, expires_at, features: [], issued_at, license_id },
    });
  } catch (err) {
    return json({ success: false, error: `Failed to generate license: ${err.message || 'unknown error'}` }, 500);
  }
};
