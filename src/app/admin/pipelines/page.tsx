"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface Stage {
  id: string;
  kommoStatusId: number;
  name: string;
  stageType: string;
}

interface Pipeline {
  id: string;
  kommoPipelineId: number;
  name: string;
  monitored: boolean;
  stages: Stage[];
}

const stageTypeLabels: Record<string, { label: string; color: string }> = {
  MEETING_BOOKED: { label: "Reunião", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  SALE_WON: { label: "Venda", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  SALE_LOST: { label: "Perdido", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  OTHER: { label: "Outro", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
};

export default function PipelinesPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);

  useEffect(() => {
    fetch("/api/admin/pipelines").then((r) => r.json()).then(setPipelines).catch(() => {});
  }, []);

  const toggleMonitored = async (pipelineId: string, monitored: boolean) => {
    try {
      await fetch("/api/admin/pipelines", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pipelineId, monitored }),
      });
      setPipelines((prev) =>
        prev.map((p) => (p.id === pipelineId ? { ...p, monitored } : p))
      );
      toast.success(monitored ? "Pipeline ativado" : "Pipeline desativado");
    } catch {
      toast.error("Erro ao atualizar pipeline");
    }
  };

  const updateStageType = async (stageId: string, stageType: string) => {
    try {
      await fetch("/api/admin/stages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageId, stageType }),
      });
      setPipelines((prev) =>
        prev.map((p) => ({
          ...p,
          stages: p.stages.map((s) =>
            s.id === stageId ? { ...s, stageType } : s
          ),
        }))
      );
      toast.success("Stage atualizado");
    } catch {
      toast.error("Erro ao atualizar stage");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Pipelines & Stages</h1>
        <p className="mt-1 text-gray-400">
          Ative os pipelines que deseja monitorar e classifique cada stage
        </p>
      </div>

      {pipelines.length === 0 ? (
        <Card className="border-white/10 bg-gray-900/60">
          <CardContent className="py-12 text-center text-gray-500">
            Nenhum pipeline encontrado. Execute uma sincronização primeiro.
          </CardContent>
        </Card>
      ) : (
        pipelines.map((pipeline) => (
          <Card key={pipeline.id} className="border-white/10 bg-gray-900/60">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">{pipeline.name}</CardTitle>
                <p className="text-sm text-gray-500">ID: {pipeline.kommoPipelineId}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">
                  {pipeline.monitored ? "Monitorando" : "Desativado"}
                </span>
                <Switch
                  checked={pipeline.monitored}
                  onCheckedChange={(checked) =>
                    toggleMonitored(pipeline.id, checked)
                  }
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pipeline.stages.map((stage) => (
                  <div
                    key={stage.id}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3"
                  >
                    <div>
                      <span className="text-sm text-gray-200">{stage.name}</span>
                      <span className="ml-2 text-xs text-gray-600">
                        ({stage.kommoStatusId})
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {Object.entries(stageTypeLabels).map(([type, config]) => (
                        <button
                          key={type}
                          onClick={() => updateStageType(stage.id, type)}
                          className={`rounded-md border px-3 py-1 text-xs font-medium transition-all ${
                            stage.stageType === type
                              ? config.color
                              : "border-white/5 text-gray-600 hover:border-white/10 hover:text-gray-400"
                          }`}
                        >
                          {config.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
