import { json, corsPreflight, requireAuth } from './_lib.mjs';

export const config = { path: '/api/auth/me', method: ['GET', 'OPTIONS'] };

export default async (req) => {
  if (req.method === 'OPTIONS') return corsPreflight();

  const user = requireAuth(req);
  if (!user) return json({ success: false, error: 'Unauthorized' }, 401);

  return json({ success: true, user: { id: user.id, username: user.username } });
};