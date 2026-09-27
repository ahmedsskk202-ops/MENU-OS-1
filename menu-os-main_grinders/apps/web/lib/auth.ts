import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

export interface SessionUser {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  permissions: string[];
  branchIds: string[]; // branches this user can access; empty = all branches of tenant
}

/**
 * What a user may do and where, read fresh from their role assignments.
 *
 * Null when the account is switched off or holds no role at all. "No role" has to mean
 * "no access", not "all branches": an empty branchIds list is how a tenant-wide role is
 * encoded, so a user stripped of every role would otherwise read as an Owner-shaped
 * scope with no permissions.
 */
async function loadAccess(userId: string): Promise<{ permissions: string[]; branchIds: string[] } | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { branchRoles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } },
  });
  if (!user || !user.isActive || user.branchRoles.length === 0) return null;

  const permissions = new Set<string>();
  const branchIds = new Set<string>();
  let hasTenantWideRole = false;
  for (const br of user.branchRoles) {
    for (const rp of br.role.permissions) permissions.add(rp.permission.key);
    if (br.branchId) branchIds.add(br.branchId);
    else hasTenantWideRole = true;
  }
  return { permissions: Array.from(permissions), branchIds: hasTenantWideRole ? [] : Array.from(branchIds) };
}

// Permissions used to be frozen into the token at sign-in, so a role change or a
// deactivated account only took effect whenever that person next signed out — which on
// a shared cafe tablet can be never. The token is now re-checked against the database at
// most this often; the small in-process cache keeps it to one query per user per window
// even when many requests arrive together.
const ACCESS_REFRESH_MS = 15_000;
const accessCache = new Map<string, { at: number; access: Awaited<ReturnType<typeof loadAccess>> }>();

async function currentAccess(userId: string) {
  const hit = accessCache.get(userId);
  if (hit && Date.now() - hit.at < ACCESS_REFRESH_MS) return hit.access;
  const access = await loadAccess(userId);
  accessCache.set(userId, { at: Date.now(), access });
  return access;
}

/** Drop a user's cached access so the next request re-reads it (after a staff edit). */
export function invalidateAccess(userId: string) {
  accessCache.delete(userId);
}

export const authOptions: AuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [
    CredentialsProvider({
      name: "Staff Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findFirst({ where: { email: credentials.email.toLowerCase().trim(), isActive: true } });
        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        const access = await loadAccess(user.id);
        if (!access) return null;
        accessCache.set(user.id, { at: Date.now(), access });

        return {
          id: user.id,
          tenantId: user.tenantId,
          name: user.name,
          email: user.email,
          permissions: access.permissions,
          branchIds: access.branchIds,
        } satisfies SessionUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as SessionUser;
        token.id = u.id;
        token.tenantId = u.tenantId;
        token.permissions = u.permissions;
        token.branchIds = u.branchIds;
        token.disabled = false;
        return token;
      }
      if (typeof token.id !== "string") return token;
      const access = await currentAccess(token.id);
      if (!access) {
        token.disabled = true;
        token.permissions = [];
        return token;
      }
      token.disabled = false;
      token.permissions = access.permissions;
      token.branchIds = access.branchIds;
      return token;
    },
    async session({ session, token }) {
      // An empty session is what next-auth reads as "signed out" (getServerSession
      // returns null for it), so a deactivated account loses access on its next request.
      if (token.disabled) return {} as typeof session;
      session.user = {
        ...session.user,
        id: token.id as string,
        tenantId: token.tenantId as string,
        name: session.user?.name ?? "",
        email: session.user?.email ?? "",
        permissions: (token.permissions as string[]) ?? [],
        branchIds: (token.branchIds as string[]) ?? [],
      };
      return session;
    },
  },
};
