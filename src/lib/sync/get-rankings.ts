import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { appCache } from "@/lib/cache";
import type { RankingsData, RankingEntry } from "@/types/rankings";
import { startOfDay, startOfWeek, startOfMonth, endOfDay } from "date-fns";

function getPeriodRange(period: string, customStart?: string, customEnd?: string) {
  const now = new Date();

  switch (period) {
    case "today":
      return { start: startOfDay(now), end: endOfDay(now) };
    case "week":
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfDay(now) };
    case "month":
      return { start: startOfMonth(now), end: endOfDay(now) };
    case "custom":
      return {
        start: customStart ? new Date(customStart) : startOfMonth(now),
        end: customEnd ? new Date(customEnd) : endOfDay(now),
      };
    default:
      return { start: startOfMonth(now), end: endOfDay(now) };
  }
}

async function getStageIds(type: "MEETING_BOOKED" | "SALE_WON" | "SALE_LOST") {
  const rows = await prisma.stage.findMany({
    where: { stageType: type },
    select: { kommoStatusId: true },
  });
  return rows.map((r) => r.kommoStatusId);
}

export async function getRankings(
  period = "month",
  customStart?: string,
  customEnd?: string
): Promise<RankingsData> {
  const cacheKey = `rankings:${period}:${customStart ?? ""}:${customEnd ?? ""}`;
  const cached = appCache.get<RankingsData>(cacheKey);
  if (cached) return cached;

  const { start, end } = getPeriodRange(period, customStart, customEnd);

  const [meetingStageIds, saleStageIds] = await Promise.all([
    getStageIds("MEETING_BOOKED"),
    getStageIds("SALE_WON"),
  ]);

  // SDR meetings: contar eventos onde estágio passou a ser MEETING_BOOKED
  const sdrRaw = meetingStageIds.length
    ? await prisma.leadEvent.groupBy({
        by: ["userId"],
        where: {
          statusAfter: { in: meetingStageIds },
          kommoCreatedAt: { gte: start, lte: end },
          userId: { not: null },
          user: { role: "SDR", active: true },
        },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      })
    : [];

  // Closer sales: contar eventos SALE_WON + somar price do lead atual
  const closerRaw = saleStageIds.length
    ? await prisma.$queryRaw<
        Array<{ userId: string; count: bigint; sumPrice: Prisma.Decimal }>
      >`
        SELECT le."userId" AS "userId",
               COUNT(*)::bigint AS "count",
               COALESCE(SUM(l.price), 0) AS "sumPrice"
        FROM lead_events le
        JOIN kommo_users u ON u.id = le."userId"
        LEFT JOIN leads l ON l."kommoLeadId" = le."kommoLeadId"
        WHERE le."statusAfter" IN (${Prisma.join(saleStageIds)})
          AND le."kommoCreatedAt" >= ${start}
          AND le."kommoCreatedAt" <= ${end}
          AND le."userId" IS NOT NULL
          AND u.role = 'CLOSER'
          AND u.active = true
        GROUP BY le."userId"
      `
    : [];

  // Dedupe userIds (eventos múltiplos no mesmo lead)
  const userIds = [
    ...new Set([
      ...sdrRaw.map((r) => r.userId!).filter(Boolean),
      ...closerRaw.map((r) => r.userId).filter(Boolean),
    ]),
  ];

  const users = await prisma.kommoUser.findMany({
    where: { id: { in: userIds } },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  const sdrMeetings: RankingEntry[] = sdrRaw
    .filter((r) => r.userId && userMap.has(r.userId))
    .map((r, i) => ({
      userId: r.userId!,
      kommoUserId: userMap.get(r.userId!)!.kommoUserId,
      name: userMap.get(r.userId!)!.name,
      position: i + 1,
      meetingsCount: r._count.id,
    }));

  const closerAll = closerRaw
    .filter((r) => userMap.has(r.userId))
    .map((r) => ({
      userId: r.userId,
      kommoUserId: userMap.get(r.userId)!.kommoUserId,
      name: userMap.get(r.userId)!.name,
      count: Number(r.count),
      value: Number(r.sumPrice ?? 0),
    }));

  const closerSalesCount: RankingEntry[] = [...closerAll]
    .sort((a, b) => b.count - a.count)
    .map((r, i) => ({
      userId: r.userId,
      kommoUserId: r.kommoUserId,
      name: r.name,
      position: i + 1,
      salesCount: r.count,
      salesValue: r.value,
    }));

  const closerSalesValue: RankingEntry[] = [...closerAll]
    .sort((a, b) => b.value - a.value)
    .map((r, i) => ({
      userId: r.userId,
      kommoUserId: r.kommoUserId,
      name: r.name,
      position: i + 1,
      salesCount: r.count,
      salesValue: r.value,
    }));

  const lastSyncLog = await prisma.syncLog.findFirst({
    where: { status: "SUCCESS" },
    orderBy: { finishedAt: "desc" },
  });

  const result: RankingsData = {
    sdrMeetings,
    closerSalesCount,
    closerSalesValue,
    lastSync: lastSyncLog?.finishedAt?.toISOString() ?? null,
    periodStart: start.toISOString(),
    periodEnd: end.toISOString(),
  };

  appCache.set(cacheKey, result, 30_000);

  return result;
}
