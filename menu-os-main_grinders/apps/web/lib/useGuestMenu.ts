"use client";

import { useEffect, useState } from "react";
import type { MenuResponse } from "./menu-types";

/** Fetches the public menu for the table-less guest ordering flow (/m/[branchId]/*). */
export function useGuestMenu(branchId: string) {
  const [menu, setMenu] = useState<MenuResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/menu?branchId=${branchId}`)
      .then((r) => r.json())
      .then((json) => !cancelled && setMenu(json))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [branchId]);

  return { menu, loading };
}
