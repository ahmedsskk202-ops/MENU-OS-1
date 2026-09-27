"use client";

import { SessionProvider } from "next-auth/react";
import { BranchProvider } from "@/lib/BranchContext";

export function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <BranchProvider>{children}</BranchProvider>
    </SessionProvider>
  );
}
