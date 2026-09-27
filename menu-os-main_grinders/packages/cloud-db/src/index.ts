import { PrismaClient } from "../generated/client";

const globalForPrisma = globalThis as unknown as { cloudPrisma?: PrismaClient };

export const cloudPrisma =
  globalForPrisma.cloudPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.cloudPrisma = cloudPrisma;

export * from "../generated/client";
