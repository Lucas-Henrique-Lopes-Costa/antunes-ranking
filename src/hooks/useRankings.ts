"use client";

import { useState, useEffect, useCallback } from "react";
import type { RankingsData, PeriodFilter } from "@/types/rankings";

const REFRESH_INTERVAL = 30_000; // 30 seconds

export function useRankings(initialPeriod: PeriodFilter = "month") {
  const [rankings, setRankings] = useState<RankingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<PeriodFilter>(initialPeriod);
  const [customRange, setCustomRange] = useState<{ start?: string; end?: string }>({});

  const fetchRankings = useCallback(async () => {
    try {
      const params = new URLSearchParams({ period });
      if (period === "custom") {
        if (customRange.start) params.set("start", customRange.start);
        if (customRange.end) params.set("end", customRange.end);
      }

      const res = await fetch(`/api/rankings?${params.toString()}`);
      if (!res.ok) throw new Error("Falha ao buscar rankings");

      const data: RankingsData = await res.json();
      setRankings(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, [period, customRange]);

  useEffect(() => {
    fetchRankings();
    const interval = setInterval(fetchRankings, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchRankings]);

  return {
    rankings,
    loading,
    error,
    period,
    setPeriod,
    customRange,
    setCustomRange,
    refresh: fetchRankings,
  };
}
