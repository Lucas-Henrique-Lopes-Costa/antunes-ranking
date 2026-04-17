"use client";

import { motion } from "framer-motion";
import type { RankingEntry } from "@/types/rankings";

const medalColors: Record<number, string> = {
  1: "from-yellow-500/30 to-yellow-600/10 border-yellow-500/50",
  2: "from-gray-300/20 to-gray-400/10 border-gray-400/40",
  3: "from-amber-700/20 to-amber-800/10 border-amber-600/40",
};

const medalEmoji: Record<number, string> = {
  1: "1\u00ba",
  2: "2\u00ba",
  3: "3\u00ba",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

interface UserPositionProps {
  entry: RankingEntry;
  type: "meetings" | "salesCount" | "salesValue";
}

export function UserPosition({ entry, type }: UserPositionProps) {
  const isTop3 = entry.position <= 3;
  const bgClass = isTop3
    ? medalColors[entry.position]
    : "from-white/5 to-white/[0.02] border-white/10";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: entry.position * 0.05 }}
      className={`flex items-center gap-4 rounded-xl border bg-gradient-to-r p-4 ${bgClass}`}
    >
      {/* Position */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold ${
          isTop3
            ? "bg-white/10 text-lg"
            : "bg-white/5 text-sm text-gray-400"
        }`}
      >
        {isTop3 ? medalEmoji[entry.position] : entry.position}
      </div>

      {/* Avatar */}
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-semibold ${
          entry.position === 1
            ? "bg-yellow-500/20 text-yellow-400"
            : entry.position === 2
              ? "bg-gray-400/20 text-gray-300"
              : entry.position === 3
                ? "bg-amber-600/20 text-amber-400"
                : "bg-white/10 text-gray-300"
        }`}
      >
        {getInitials(entry.name)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className={`truncate font-semibold ${
            isTop3 ? "text-white text-base" : "text-gray-200 text-sm"
          }`}
        >
          {entry.name}
        </p>
      </div>

      {/* Metric */}
      <div className="text-right shrink-0">
        {type === "meetings" && (
          <p className={`font-bold ${isTop3 ? "text-xl text-white" : "text-lg text-gray-300"}`}>
            {entry.meetingsCount}
            <span className="ml-1 text-xs font-normal text-gray-400">
              {entry.meetingsCount === 1 ? "reunião" : "reuniões"}
            </span>
          </p>
        )}

        {type === "salesCount" && (
          <div>
            <p className={`font-bold ${isTop3 ? "text-xl text-white" : "text-lg text-gray-300"}`}>
              {entry.salesCount}
              <span className="ml-1 text-xs font-normal text-gray-400">
                {entry.salesCount === 1 ? "venda" : "vendas"}
              </span>
            </p>
            {entry.salesValue !== undefined && (
              <p className="text-xs text-gray-500">
                {formatCurrency(entry.salesValue)}
              </p>
            )}
          </div>
        )}

        {type === "salesValue" && (
          <div>
            <p className={`font-bold ${isTop3 ? "text-xl text-emerald-400" : "text-lg text-emerald-500"}`}>
              {formatCurrency(entry.salesValue ?? 0)}
            </p>
            <p className="text-xs text-gray-500">
              {entry.salesCount} {entry.salesCount === 1 ? "venda" : "vendas"}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
