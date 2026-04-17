"use client";

import { motion } from "framer-motion";
import { UserPosition } from "./UserPosition";
import type { RankingEntry } from "@/types/rankings";

interface RankingCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  entries: RankingEntry[];
  type: "meetings" | "salesCount" | "salesValue";
  accentColor: string;
}

export function RankingCard({
  title,
  subtitle,
  icon,
  entries,
  type,
  accentColor,
}: RankingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col rounded-2xl border border-white/10 bg-gray-900/60 backdrop-blur-sm"
    >
      {/* Header */}
      <div className={`flex items-center gap-3 border-b border-white/10 px-6 py-4`}>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${accentColor}`}>
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <p className="text-sm text-gray-400">{subtitle}</p>
        </div>
      </div>

      {/* Rankings list */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        {entries.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-12 text-gray-500">
            Nenhum dado disponível
          </div>
        ) : (
          entries.map((entry) => (
            <UserPosition key={entry.userId} entry={entry} type={type} />
          ))
        )}
      </div>
    </motion.div>
  );
}
