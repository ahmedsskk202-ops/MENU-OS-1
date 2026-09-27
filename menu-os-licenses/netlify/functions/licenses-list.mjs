import { json, corsPreflight, requireAuth, listLicenses } from './_lib.mjs';

export const config = { path: '/api/licenses/list', method: ['GET', 'OPTIONS'] };

export default async (req) => {
  if (req.method === 'OPTIONS') return corsPreflight();

  const user = requireAuth(req);
  if (!user) return json({ success: false, error: 'Unauthorized' }, 401);

  const licenses = await listLicenses();
  return json({ success: true, licenses });
};