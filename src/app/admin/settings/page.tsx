"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Configurações</h1>
        <p className="mt-1 text-gray-400">Configurações gerais do sistema</p>
      </div>

      <Card className="border-white/10 bg-gray-900/60">
        <CardHeader>
          <CardTitle className="text-white">Sincronização</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-4">
            <div>
              <p className="font-medium text-white">Intervalo de Sincronização</p>
              <p className="text-sm text-gray-500">Configurado via Vercel Cron Jobs</p>
            </div>
            <Badge variant="secondary">A cada 1 hora</Badge>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-4">
            <div>
              <p className="font-medium text-white">Timezone</p>
              <p className="text-sm text-gray-500">Utilizado para cálculo de períodos</p>
            </div>
            <Badge variant="secondary">America/Sao_Paulo</Badge>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-4">
            <div>
              <p className="font-medium text-white">Período Padrão</p>
              <p className="text-sm text-gray-500">Período exibido no dashboard por padrão</p>
            </div>
            <Badge variant="secondary">Mês corrente</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-gray-900/60">
        <CardHeader>
          <CardTitle className="text-white">Sobre</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-400">
          <p><strong className="text-gray-200">Versão:</strong> 1.0.0</p>
          <p><strong className="text-gray-200">Stack:</strong> Next.js + Prisma + PostgreSQL</p>
          <p><strong className="text-gray-200">Integração:</strong> Kommo CRM API v4</p>
        </CardContent>
      </Card>
    </div>
  );
}
