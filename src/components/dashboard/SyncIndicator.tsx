"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SyncIndicatorProps {
  lastSync: string | null;
}

export function SyncIndicator({ lastSync }: SyncIndicatorProps) {
  if (!lastSync) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="h-2 w-2 rounded-full bg-gray-600" />
        Ainda não sincronizado
      </div>
    );
  }

  const date = new Date(lastSync);
  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60_000);
  const isRecent = diffMinutes < 90; // Less than 1.5 hours

  return (
    <div className="flex items-center gap-2 text-sm">
      <span
        className={`h-2 w-2 rounded-full ${
          isRecent ? "bg-emerald-500 animate-pulse" : "bg-yellow-500"
        }`}
      />
      <span className={isRecent ? "text-gray-400" : "text-yellow-400"}>
        Última atualização:{" "}
        {format(date, "dd/MM/yyyy HH:mm", { locale: ptBR })}
      </span>
      {!isRecent && (
        <span className="text-yellow-500 text-xs">(atrasada)</span>
      )}
    </div>
  );
}
