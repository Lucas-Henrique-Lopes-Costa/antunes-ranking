import { prisma } from "@/lib/prisma";
import type { KommoLead } from "@/types/kommo";
import type { StageType } from "@/generated/prisma/client";

export async function processLeads(kommoLeads: KommoLead[]) {
  // Build stage map: "pipelineId:statusId" -> StageType
  const stages = await prisma.stage.findMany({
    include: { pipeline: true },
  });

  const stageMap = new Map<string, StageType>();
  for (const stage of stages) {
    stageMap.set(
      `${stage.pipeline.kommoPipelineId}:${stage.kommoStatusId}`,
      stage.stageType
    );
  }

  // Build user map: kommoUserId -> internal id
  const users = await prisma.kommoUser.findMany();
  const userMap = new Map<number, string>();
  for (const user of users) {
    userMap.set(user.kommoUserId, user.id);
  }

  // Build pipeline map: kommoPipelineId -> internal id
  const pipelines = await prisma.pipeline.findMany();
  const pipelineMap = new Map<number, string>();
  for (const pipeline of pipelines) {
    pipelineMap.set(pipeline.kommoPipelineId, pipeline.id);
  }

  let created = 0;
  let updated = 0;

  for (const lead of kommoLeads) {
    const stageKey = `${lead.pipeline_id}:${lead.status_id}`;
    const stageType = stageMap.get(stageKey) ?? "OTHER";
    const responsibleId = userMap.get(lead.responsible_user_id) ?? null;
    const pipelineId = pipelineMap.get(lead.pipeline_id) ?? null;

    const data = {
      name: lead.name || null,
      price: lead.price ?? 0,
      responsibleId,
      pipelineId,
      kommoStatusId: lead.status_id,
      stageType: stageType as StageType,
      kommoCreatedAt: lead.created_at
        ? new Date(lead.created_at * 1000)
        : null,
      kommoUpdatedAt: lead.updated_at
        ? new Date(lead.updated_at * 1000)
        : null,
      closedAt: lead.closed_at ? new Date(lead.closed_at * 1000) : null,
    };

    const existing = await prisma.lead.findUnique({
      where: { kommoLeadId: lead.id },
    });

    if (existing) {
      await prisma.lead.update({
        where: { kommoLeadId: lead.id },
        data,
      });
      updated++;
    } else {
      await prisma.lead.create({
        data: { kommoLeadId: lead.id, ...data },
      });
      created++;
    }
  }

  return { created, updated };
}
