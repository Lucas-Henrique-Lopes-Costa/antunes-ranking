"use client";

import { motion } from "framer-motion";
import { PodiumEntry } from "./PodiumEntry";
import type { RankingEntry } from "@/types/rankings";

interface PodiumBlockProps {
  title: string;
  subtitle: string;
  entries: RankingEntry[];
  type: "closer" | "sdr";
  accent: "emerald" | "blue";
}

const accentStyles = {
  emerald: {
    glow: "from-emerald-500/10 via-transparent to-transparent",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    icon: "bg-emerald-500/20 text-emerald-400",
    iconEmoji: "R$",
  },
  blue: {
    glow: "from-blue-500/10 via-transparent to-transparent",
    text: "text-blue-400",
    border: "border-blue-500/20",
    icon: "bg-blue-500/20 text-blue-400",
    iconEmoji: "📅",
  },
};

export function PodiumBlock({ title, subtitle, entries, type, accent }: PodiumBlockProps) {
  const style = accentStyles[accent];
  const top1 = entries[0];
  const rest = entries.slice(1, 5); // mostra até top 5

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative flex flex-col overflow-hidden rounded-3xl border ${style.border} bg-gradient-to-br from-white/[0.03] to-transparent p-8`}
    >
      {/* Background glow */}
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${style.glow}`} />

      {/* Header */}
      <div className="relative mb-8 flex items-center gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl font-black ${style.icon}`}>
          {style.iconEmoji}
        </div>
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            {title}
          </h2>
          <p className={`text-sm font-medium ${style.text}`}>{subtitle}</p>
        </div>
      </div>

      {/* Top 1 - hero */}
      {top1 && (
        <div className="relative mb-10 flex justify-center">
          <PodiumEntry entry={top1} type={type} isTop1 />
        </div>
      )}

      {/* Rest - grid */}
      {rest.length > 0 && (
        <div className="relative grid grid-cols-2 gap-6 md:grid-cols-4">
          {rest.map((entry) => (
            <PodiumEntry key={entry.userId} entry={entry} type={type} />
          ))}
        </div>
      )}

      {entries.length === 0 && (
        <div className="flex flex-1 items-center justify-center py-20 text-gray-500">
          Nenhum dado disponível
        </div>
      )}
    </motion.div>
  );
}
