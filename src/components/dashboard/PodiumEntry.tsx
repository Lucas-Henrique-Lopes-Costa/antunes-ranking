"use client";

import { motion } from "framer-motion";
import type { RankingEntry } from "@/types/rankings";

type PodiumType = "closer" | "sdr";

interface PodiumEntryProps {
  entry: RankingEntry;
  type: PodiumType;
  isTop1?: boolean;
}

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Paletas de cor para os círculos — cíclicas pelo userId
const circlePalettes = [
  { bg: "from-emerald-500/20 to-teal-600/10", ring: "ring-emerald-400/60", text: "text-emerald-300", glow: "shadow-emerald-500/30" },
  { bg: "from-blue-500/20 to-indigo-600/10", ring: "ring-blue-400/60", text: "text-blue-300", glow: "shadow-blue-500/30" },
  { bg: "from-purple-500/20 to-fuchsia-600/10", ring: "ring-purple-400/60", text: "text-purple-300", glow: "shadow-purple-500/30" },
  { bg: "from-amber-500/20 to-orange-600/10", ring: "ring-amber-400/60", text: "text-amber-300", glow: "shadow-amber-500/30" },
  { bg: "from-pink-500/20 to-rose-600/10", ring: "ring-pink-400/60", text: "text-pink-300", glow: "shadow-pink-500/30" },
];

function getPalette(id: string) {
  const hash = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return circlePalettes[hash % circlePalettes.length];
}

// Medal colors by position
const medalStyles: Record<number, { bg: string; ribbon: string; icon: string }> = {
  1: {
    bg: "bg-gradient-to-b from-yellow-300 to-yellow-600",
    ribbon: "bg-yellow-500",
    icon: "text-yellow-100",
  },
  2: {
    bg: "bg-gradient-to-b from-gray-200 to-gray-400",
    ribbon: "bg-gray-400",
    icon: "text-gray-100",
  },
  3: {
    bg: "bg-gradient-to-b from-amber-500 to-amber-800",
    ribbon: "bg-amber-700",
    icon: "text-amber-100",
  },
};

function Medal({ position }: { position: number }) {
  if (position > 3) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-bold text-gray-400">
        {position}
      </div>
    );
  }

  const style = medalStyles[position];

  return (
    <div className="relative flex flex-col items-center">
      {/* Ribbon */}
      <div className="flex gap-0.5">
        <div className={`h-4 w-1.5 ${style.ribbon} clip-ribbon-left`} style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 75%)" }} />
        <div className={`h-4 w-1.5 ${style.ribbon} clip-ribbon-right`} style={{ clipPath: "polygon(0 0, 100% 0, 50% 75%, 0 100%)" }} />
      </div>
      {/* Medal */}
      <div className={`-mt-1 flex h-8 w-8 items-center justify-center rounded-full ${style.bg} shadow-lg ring-2 ring-white/20`}>
        <span className={`text-xs font-black ${style.icon}`}>{position}</span>
      </div>
    </div>
  );
}

export function PodiumEntry({ entry, type, isTop1 }: PodiumEntryProps) {
  const palette = getPalette(entry.userId);
  const circleSize = isTop1 ? "h-32 w-32 md:h-40 md:w-40" : "h-20 w-20 md:h-24 md:w-24";
  const initialSize = isTop1 ? "text-5xl md:text-6xl" : "text-3xl md:text-4xl";
  const nameSize = isTop1 ? "text-xl md:text-2xl" : "text-base md:text-lg";
  const metricSize = isTop1 ? "text-2xl md:text-4xl" : "text-lg md:text-xl";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: entry.position * 0.08, type: "spring", stiffness: 120 }}
      className="flex flex-col items-center text-center"
    >
      {/* Circle with initial */}
      <div className="relative">
        {isTop1 && (
          <>
            <div className="absolute inset-0 -m-4 rounded-full bg-yellow-500/20 blur-2xl animate-pulse" />
            <div className="absolute inset-0 -m-2 rounded-full ring-4 ring-yellow-400/40 animate-pulse" />
          </>
        )}
        <div
          className={`relative ${circleSize} rounded-full bg-gradient-to-br ${palette.bg} flex items-center justify-center ring-4 ${isTop1 ? "ring-yellow-400/70 shadow-2xl shadow-yellow-500/40" : `${palette.ring} shadow-xl ${palette.glow}`} backdrop-blur-sm`}
        >
          <span className={`${initialSize} font-black ${isTop1 ? "text-yellow-200" : palette.text} drop-shadow-lg`}>
            {getInitial(entry.name)}
          </span>
        </div>
      </div>

      {/* Medal */}
      <div className="mt-3">
        <Medal position={entry.position} />
      </div>

      {/* Name */}
      <p className={`mt-3 font-bold ${nameSize} ${isTop1 ? "text-white" : "text-gray-200"}`}>
        {entry.name}
      </p>

      {/* Metrics */}
      <div className="mt-2 flex flex-col items-center">
        {type === "closer" ? (
          <>
            <p className={`${metricSize} font-extrabold ${isTop1 ? "text-yellow-300" : "text-emerald-400"} tracking-tight`}>
              {formatCurrency(entry.salesValue ?? 0)}
            </p>
            <p className="text-sm text-gray-400">
              {entry.salesCount} {entry.salesCount === 1 ? "venda" : "vendas"}
            </p>
          </>
        ) : (
          <>
            <p className={`${metricSize} font-extrabold ${isTop1 ? "text-yellow-300" : "text-blue-400"} leading-tight`}>
              {entry.meetingsScheduled ?? entry.meetingsCount ?? 0}
              <span className="ml-1 text-sm font-medium text-gray-400">marcadas</span>
            </p>
            <p className={`text-sm ${isTop1 ? "text-white/80" : "text-gray-400"}`}>
              <span className="font-bold text-emerald-400">{entry.meetingsCompleted ?? entry.meetingsCount ?? 0}</span> realizadas
            </p>
          </>
        )}
      </div>
    </motion.div>
  );
}
