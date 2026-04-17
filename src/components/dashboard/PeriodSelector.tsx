"use client";

import type { PeriodFilter } from "@/types/rankings";

const periods: { value: PeriodFilter; label: string }[] = [
  { value: "today", label: "Hoje" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mês" },
];

interface PeriodSelectorProps {
  value: PeriodFilter;
  onChange: (period: PeriodFilter) => void;
}

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="flex gap-1 rounded-lg bg-white/5 p-1">
      {periods.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
            value === p.value
              ? "bg-white/10 text-white shadow-sm"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
