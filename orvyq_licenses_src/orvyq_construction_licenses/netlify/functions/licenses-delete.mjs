import { json, corsPreflight, readJson, requireAuth, listLicenses, saveLicenses } from './_lib.mjs';

export const config = { path: '/api/licenses/delete', method: ['POST', 'OPTIONS'] };

export default async (req) => {
  if (req.method === 'OPTIONS') return corsPreflight();

  const user = requireAuth(req);
  if (!user) return json({ success: false, error: 'Unauthorized' }, 401);

  const body = await readJson(req);
  const { license_id } = body;
  if (!license_id) {
    return json({ success: false, error: 'license_id is required' }, 400);
  }

  const licenses = await listLicenses();
  const remaining = licenses.filter((license) => license.license_id !== license_id);
  await saveLicenses(remaining);

  return json({ success: true, message: 'License deleted', licenses: remaining });
};