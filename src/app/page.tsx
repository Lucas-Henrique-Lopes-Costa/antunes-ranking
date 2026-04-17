"use client";

import { useRankings } from "@/hooks/useRankings";
import { PodiumBlock } from "@/components/dashboard/PodiumBlock";
import { SyncIndicator } from "@/components/dashboard/SyncIndicator";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import { Maximize2, Trophy } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

export default function DashboardPage() {
  const { rankings, loading, error, period, setPeriod } = useRankings("month");

  const currentMonth = format(new Date(), "MMMM yyyy", { locale: ptBR });

  if (loading && !rankings) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-white/60" />
          <p className="text-gray-400">Carregando rankings...</p>
        </div>
      </div>
    );
  }

  if (error && !rankings) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <p className="text-xl text-red-400">Erro ao carregar dados</p>
          <p className="mt-2 text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#05060f] overflow-hidden">
      {/* Background decorative glows */}
      <div className="pointer-events-none absolute top-0 left-1/4 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />

      {/* Header */}
      <header className="relative border-b border-white/5 bg-black/30 backdrop-blur-sm sticky top-0 z-20">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 shadow-lg shadow-yellow-500/30">
              <Trophy className="h-6 w-6 text-yellow-50" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white">
                Ranking Comercial
              </h1>
              <p className="text-sm capitalize text-gray-400">{currentMonth}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <SyncIndicator lastSync={rankings?.lastSync ?? null} />
            <PeriodSelector value={period} onChange={setPeriod} />
            <Link
              href="/tv"
              className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Maximize2 className="h-4 w-4" />
              TV
            </Link>
          </div>
        </div>
      </header>

      {/* 2 Podium Blocks */}
      <main className="relative mx-auto max-w-[1800px] p-8">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          <PodiumBlock
            title="Closers"
            subtitle="Vendas realizadas"
            entries={rankings?.closerSalesValue ?? []}
            type="closer"
            accent="emerald"
          />

          <PodiumBlock
            title="SDRs"
            subtitle="Reuniões agendadas"
            entries={rankings?.sdrMeetings ?? []}
            type="sdr"
            accent="blue"
          />
        </div>
      </main>
    </div>
  );
}
