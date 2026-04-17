"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface SyncLogEntry {
  id: string;
  startedAt: string;
  finishedAt: string | null;
  status: "RUNNING" | "SUCCESS" | "FAILED";
  leadsFetched: number;
  leadsCreated: number;
  leadsUpdated: number;
  errorMessage: string | null;
  durationMs: number | null;
}

export default function SyncLogsPage() {
  const [logs, setLogs] = useState<SyncLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sync/logs?limit=50");
      setLogs(await res.json());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const statusConfig = {
    SUCCESS: { variant: "default" as const, label: "Sucesso" },
    FAILED: { variant: "destructive" as const, label: "Falhou" },
    RUNNING: { variant: "secondary" as const, label: "Rodando" },
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Logs de Sincronização</h1>
          <p className="mt-1 text-gray-400">Histórico de todas as sincronizações</p>
        </div>
        <Button variant="outline" onClick={fetchLogs} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      <Card className="border-white/10 bg-gray-900/60">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-gray-400">
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Início</th>
                  <th className="px-4 py-3 font-medium">Duração</th>
                  <th className="px-4 py-3 font-medium">Leads</th>
                  <th className="px-4 py-3 font-medium">Criados</th>
                  <th className="px-4 py-3 font-medium">Atualizados</th>
                  <th className="px-4 py-3 font-medium">Erro</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-white/5 text-gray-300"
                  >
                    <td className="px-4 py-3">
                      <Badge variant={statusConfig[log.status].variant}>
                        {statusConfig[log.status].label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {new Date(log.startedAt).toLocaleString("pt-BR")}
                    </td>
                    <td className="px-4 py-3">
                      {log.durationMs ? `${(log.durationMs / 1000).toFixed(1)}s` : "—"}
                    </td>
                    <td className="px-4 py-3">{log.leadsFetched}</td>
                    <td className="px-4 py-3 text-emerald-400">+{log.leadsCreated}</td>
                    <td className="px-4 py-3 text-blue-400">{log.leadsUpdated}</td>
                    <td className="px-4 py-3">
                      {log.errorMessage ? (
                        <span className="max-w-[300px] truncate text-red-400 block" title={log.errorMessage}>
                          {log.errorMessage}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                      Nenhum log disponível
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
