"use client";

import { useEffect, useState } from "react";

export interface TableSessionData {
  tableSessionId: string;
  sessionNumber: number;
  guestsCount: number;
  customerSessionId: string;
  table: { id: string; label: string };
  // address/phone are the receipt header lines (see /api/session).
  branch: { id: string; name: string; address: string | null; phone: string | null };
  brand: { id: string; name: string; logoUrl: string | null; currency: string; defaultLocale: string };
  participants: { id: string; displayName: string }[];
}

export function useTableSession() {
  const [data, setData] = useState<TableSessionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/session")
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error ?? "Session expired");
        return res.json();
      })
      .then((json) => !cancelled && setData(json))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, error, loading };
}
