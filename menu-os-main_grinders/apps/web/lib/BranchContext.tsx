"use client";

import { createContext, useContext, useEffect, useState } from "react";

export interface BranchOption {
  id: string;
  name: string;
  brandId: string;
  brandName: string;
  currency: string;
}

interface BranchContextValue {
  branches: BranchOption[];
  branchId: string | null;
  setBranchId: (id: string) => void;
  currentBranch: BranchOption | null;
  loading: boolean;
}

const BranchContext = createContext<BranchContextValue | null>(null);

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [branchId, setBranchIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/branches")
      .then((r) => r.json())
      .then((json) => {
        setBranches(json.branches ?? []);
        const stored = typeof window !== "undefined" ? localStorage.getItem("mos_admin_branch") : null;
        const initial = json.branches?.find((b: BranchOption) => b.id === stored)?.id ?? json.branches?.[0]?.id ?? null;
        setBranchIdState(initial);
      })
      .finally(() => setLoading(false));
  }, []);

  function setBranchId(id: string) {
    setBranchIdState(id);
    if (typeof window !== "undefined") localStorage.setItem("mos_admin_branch", id);
  }

  const currentBranch = branches.find((b) => b.id === branchId) ?? null;

  return (
    <BranchContext.Provider value={{ branches, branchId, setBranchId, currentBranch, loading }}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const ctx = useContext(BranchContext);
  if (!ctx) throw new Error("useBranch must be used within BranchProvider");
  return ctx;
}
