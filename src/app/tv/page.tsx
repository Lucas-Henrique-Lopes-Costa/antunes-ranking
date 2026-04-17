"use client";

import { useRankings } from "@/hooks/useRankings";
import { PodiumBlock } from "@/components/dashboard/PodiumBlock";
import { SyncIndicator } from "@/components/dashboard/SyncIndicator";
import { Trophy } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect } from "react";

export default function TVPage() {
  const { rankings, loading } = useRankings("month");

  const currentMonth = format(new Date(), "MMMM yyyy", { locale: ptBR });

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "f" || e.key === "F") {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          document.documentElement.requestFullscreen();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  if (loading && !rankings) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#05060f]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-white/10 border-t-white/60" />
          <p className="text-xl text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-[#05060f]">
      {/* Background glows */}
      <div className="pointer-events-none absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/[0.07] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-blue-500/[0.07] blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#05060f_80%)]" />

      {/* Header */}
      <header className="relative flex items-center justify-between border-b border-white/5 px-10 py-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 shadow-xl shadow-yellow-500/40">
            <Trophy className="h-7 w-7 text-yellow-50" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white">
              Ranking Comercial
            </h1>
            <p className="text-base capitalize text-gray-500">{currentMonth}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <SyncIndicator lastSync={rankings?.lastSync ?? null} />
          <p className="text-xs text-gray-600">
            Pressione <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-gray-400">F</kbd> para fullscreen
          </p>
        </div>
      </header>

      {/* 2 Blocks */}
      <main className="relative flex-1 grid grid-cols-2 gap-6 p-6 overflow-hidden">
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
      </main>
    </div>
  );
}
