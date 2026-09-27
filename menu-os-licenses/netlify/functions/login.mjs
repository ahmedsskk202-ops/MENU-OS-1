import { ADMIN_USERNAME, ADMIN_PASSWORD, json, corsPreflight, readJson, issueAdminToken } from './_lib.mjs';

export const config = { path: '/api/login', method: ['POST', 'OPTIONS'] };

export default async (req) => {
  if (req.method === 'OPTIONS') return corsPreflight();

  const { username, password } = await readJson(req);

  if (!username || !password) {
    return json({ success: false, error: 'Username and password are required' }, 400);
  }

  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    return json(
      { success: false, error: 'Server is not configured. Set the ADMIN_USERNAME and ADMIN_PASSWORD environment variables.' },
      500
    );
  }

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return json({ success: false, error: 'Invalid username or password' }, 401);
  }

  const user = { id: 1, username: ADMIN_USERNAME };
  return json({ success: true, token: issueAdminToken(user), user });
};