import crypto from 'node:crypto';
import { json, corsPreflight, readJson, requireAuth, signLicense, listLicenses, saveLicenses } from './_lib.mjs';

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

  let expires_at;
  if (body.custom_date) {
    const date = new Date(body.custom_date);
    if (isNaN(date.getTime())) {
      return json({ success: false, error: 'Invalid custom expiry date' }, 400);
    }
    expires_at = date.toISOString();
  } else {
    const days = parseInt(body.duration, 10);
    if (!days || days <= 0 || days > 36500) {
      return json({ success: false, error: 'Invalid duration - pick a period between 1 day and 10 years' }, 400);
    }
    const date = new Date();
    date.setDate(date.getDate() + days);
    expires_at = date.toISOString();
  }

  const issued_at = new Date().toISOString();
  const license_id = crypto.randomUUID();
  const payload = {
    client_id,
    plan_type: 'Standard',
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
      plan_type: payload.plan_type,
      expires_at,
      features: [],
      created_at: issued_at,
    };
    const licenses = await listLicenses();
    licenses.unshift(record);
    await saveLicenses(licenses);

    return json({
      success: true,
      license: {
        token,
        client_id,
        plan_type: payload.plan_type,
        expires_at,
        features: [],
        issued_at,
        license_id,
      },
    });
  } catch (err) {
    return json({ success: false, error: `Failed to generate license: ${err.message || 'unknown error'}` }, 500);
  }
};