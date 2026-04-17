"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, RefreshCw } from "lucide-react";

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

interface KommoConfig {
  kommo_subdomain?: string;
  isConnected: boolean;
}

export default function AdminOverview() {
  const [logs, setLogs] = useState<SyncLogEntry[]>([]);
  const [config, setConfig] = useState<KommoConfig | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetch("/api/sync/logs?limit=5").then((r) => r.json()).then(setLogs).catch(() => {});
    fetch("/api/admin/config").then((r) => r.json()).then(setConfig).catch(() => {});
  }, []);

  const triggerSync = async () => {
    setSyncing(true);
    try {
      const appSecret = prompt("Digite o APP_SECRET para autorizar:");
      if (!appSecret) return;
      await fetch("/api/sync", {
        method: "POST",
        headers: { Authorization: `Bearer ${appSecret}` },
      });
      // Refresh logs
      const res = await fetch("/api/sync/logs?limit=5");
      setLogs(await res.json());
    } catch {
      // ignore
    } finally {
      setSyncing(false);
    }
  };

  const lastSync = logs.find((l) => l.status === "SUCCESS");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Painel Administrativo</h1>
        <p className="mt-1 text-gray-400">Visão geral do sistema</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-white/10 bg-gray-900/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Conexão Kommo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {config?.isConnected ? (
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">Conectado</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-400">
                <XCircle className="h-5 w-5" />
                <span className="font-semibold">Desconectado</span>
              </div>
            )}
            {config?.kommo_subdomain && (
              <p className="mt-1 text-xs text-gray-500">
                {String(config.kommo_subdomain)}.kommo.com
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-gray-900/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Última Sincronização
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lastSync ? (
              <div>
                <div className="flex items-center gap-2 text-white">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="font-semibold">
                    {new Date(lastSync.finishedAt!).toLocaleString("pt-BR")}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {lastSync.leadsFetched} leads | {lastSync.durationMs}ms
                </p>
              </div>
            ) : (
              <p className="text-gray-500">Nenhuma sync realizada</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-gray-900/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Ações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <button
              onClick={triggerSync}
              disabled={syncing}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Sincronizando..." : "Sincronizar Agora"}
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sync Logs */}
      <Card className="border-white/10 bg-gray-900/60">
        <CardHeader>
          <CardTitle className="text-white">Sincronizações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-gray-500">Nenhum log disponível</p>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        log.status === "SUCCESS"
                          ? "default"
                          : log.status === "FAILED"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {log.status}
                    </Badge>
                    <span className="text-sm text-gray-300">
                      {new Date(log.startedAt).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{log.leadsFetched} leads</span>
                    <span>{log.durationMs ?? "—"}ms</span>
                    {log.errorMessage && (
                      <span className="max-w-[200px] truncate text-red-400" title={log.errorMessage}>
                        {log.errorMessage}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
