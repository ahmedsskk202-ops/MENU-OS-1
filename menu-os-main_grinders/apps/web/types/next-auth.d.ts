import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      tenantId: string;
      name: string;
      email: string;
      permissions: string[];
      branchIds: string[];
    } & DefaultSession["user"];
  }
}
