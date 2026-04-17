import { prisma } from "@/lib/prisma";
import { fetchAllLeads } from "@/lib/kommo/leads";
import { fetchKommoUsers } from "@/lib/kommo/users";
import { fetchKommoPipelines } from "@/lib/kommo/pipelines";
import { processLeads } from "./leads-processor";
import { calculateAndSaveRankings } from "./ranking-calculator";
import { syncEvents } from "./events-processor";
import { appCache } from "@/lib/cache";
import {
  startOfMonth,
  endOfDay,
} from "date-fns";

export async function runSync() {
  const syncLog = await prisma.syncLog.create({
    data: { status: "RUNNING" },
  });

  const startTime = Date.now();

  try {
    // 1. Sync users from Kommo
    console.log("[Sync] Buscando usuários do Kommo...");
    const kommoUsers = await fetchKommoUsers();
    for (const ku of kommoUsers) {
      await prisma.kommoUser.upsert({
        where: { kommoUserId: ku.id },
        update: { name: ku.name, email: ku.email },
        create: {
          kommoUserId: ku.id,
          name: ku.name,
          email: ku.email,
          role: "UNASSIGNED",
        },
      });
    }
    console.log(`[Sync] ${kommoUsers.length} usuários sincronizados`);

    // 2. Sync pipelines and stages
    console.log("[Sync] Buscando pipelines do Kommo...");
    const kmmPipelines = await fetchKommoPipelines();
    for (const kp of kmmPipelines) {
      const pipeline = await prisma.pipeline.upsert({
        where: { kommoPipelineId: kp.id },
        update: { name: kp.name },
        create: { kommoPipelineId: kp.id, name: kp.name },
      });

      for (const status of kp._embedded?.statuses ?? []) {
        await prisma.stage.upsert({
          where: {
            pipelineId_kommoStatusId: {
              pipelineId: pipeline.id,
              kommoStatusId: status.id,
            },
          },
          update: { name: status.name },
          create: {
            pipelineId: pipeline.id,
            kommoStatusId: status.id,
            name: status.name,
            stageType: "OTHER",
          },
        });
      }
    }
    console.log(`[Sync] ${kmmPipelines.length} pipelines sincronizados`);

    // 3. Fetch leads from monitored pipelines
    const monitoredPipelines = await prisma.pipeline.findMany({
      where: { monitored: true },
    });

    const pipelineIds = monitoredPipelines.map((p) => p.kommoPipelineId);

    // Get last successful sync to do incremental fetch
    const lastSync = await prisma.syncLog.findFirst({
      where: { status: "SUCCESS" },
      orderBy: { finishedAt: "desc" },
    });

    const updatedFrom = lastSync?.finishedAt
      ? Math.floor(lastSync.finishedAt.getTime() / 1000) - 300 // 5min overlap for safety
      : undefined;

    console.log(
      `[Sync] Buscando leads${updatedFrom ? ` (atualizados desde ${new Date(updatedFrom * 1000).toISOString()})` : " (busca completa)"}...`
    );

    const leads = await fetchAllLeads({
      pipelineIds: pipelineIds.length > 0 ? pipelineIds : undefined,
      updatedFrom,
    });
    console.log(`[Sync] ${leads.length} leads obtidos do Kommo`);

    // 4. Process leads
    const { created, updated } = await processLeads(leads);
    console.log(`[Sync] Leads processados: ${created} criados, ${updated} atualizados`);

    // 4b. Sync events (histórico de movimentação — base do ranking)
    console.log("[Sync] Buscando eventos do Kommo...");
    const eventResult = await syncEvents();
    console.log(
      `[Sync] ${eventResult.stored} eventos armazenados (${eventResult.fetched} recebidos)`
    );

    // 5. Calculate rankings for current month
    const now = new Date();
    const periodStart = startOfMonth(now);
    const periodEnd = endOfDay(now);

    const { snapshotsCreated } = await calculateAndSaveRankings({
      periodStart,
      periodEnd,
    });
    console.log(`[Sync] ${snapshotsCreated} snapshots de ranking salvos`);

    // 6. Invalidate cache
    appCache.invalidate("rankings");

    // 7. Update sync log
    const durationMs = Date.now() - startTime;
    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: "SUCCESS",
        finishedAt: new Date(),
        leadsFetched: leads.length,
        leadsCreated: created,
        leadsUpdated: updated,
        durationMs,
      },
    });

    console.log(`[Sync] Concluída em ${durationMs}ms`);
    return { success: true, leadsFetched: leads.length, created, updated, durationMs };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        errorMessage,
        durationMs,
      },
    });

    console.error("[Sync] Falha:", errorMessage);
    throw error;
  }
}
