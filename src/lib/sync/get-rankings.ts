import { prisma } from "@/lib/prisma";
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

export async function getRankings(
  period = "month",
  customStart?: string,
  customEnd?: string
): Promise<RankingsData> {
  const cacheKey = `rankings:${period}:${customStart ?? ""}:${customEnd ?? ""}`;
  const cached = appCache.get<RankingsData>(cacheKey);
  if (cached) return cached;

  const { start, end } = getPeriodRange(period, customStart, customEnd);

  // SDR meetings
  const sdrRaw = await prisma.lead.groupBy({
    by: ["responsibleId"],
    where: {
      stageType: "MEETING_BOOKED",
      responsible: { role: "SDR", active: true },
      responsibleId: { not: null },
      kommoUpdatedAt: { gte: start, lte: end },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });

  // Closer sales
  const closerRaw = await prisma.lead.groupBy({
    by: ["responsibleId"],
    where: {
      stageType: "SALE_WON",
      responsible: { role: "CLOSER", active: true },
      responsibleId: { not: null },
      closedAt: { gte: start, lte: end },
    },
    _count: { id: true },
    _sum: { price: true },
    orderBy: { _count: { id: "desc" } },
  });

  // Get user details
  const userIds = [
    ...new Set([
      ...sdrRaw.map((r) => r.responsibleId!),
      ...closerRaw.map((r) => r.responsibleId!),
    ]),
  ];

  const users = await prisma.kommoUser.findMany({
    where: { id: { in: userIds } },
  });

  const userMap = new Map(users.map((u) => [u.id, u]));

  // Build SDR ranking
  const sdrMeetings: RankingEntry[] = sdrRaw
    .filter((r) => r.responsibleId && userMap.has(r.responsibleId))
    .map((r, i) => ({
      userId: r.responsibleId!,
      kommoUserId: userMap.get(r.responsibleId!)!.kommoUserId,
      name: userMap.get(r.responsibleId!)!.name,
      position: i + 1,
      meetingsCount: r._count.id,
    }));

  // Build Closer rankings (sort by count)
  const closerSalesCount: RankingEntry[] = [...closerRaw]
    .sort((a, b) => b._count.id - a._count.id)
    .filter((r) => r.responsibleId && userMap.has(r.responsibleId))
    .map((r, i) => ({
      userId: r.responsibleId!,
      kommoUserId: userMap.get(r.responsibleId!)!.kommoUserId,
      name: userMap.get(r.responsibleId!)!.name,
      position: i + 1,
      salesCount: r._count.id,
      salesValue: Number(r._sum.price ?? 0),
    }));

  // Build Closer rankings (sort by value)
  const closerSalesValue: RankingEntry[] = [...closerRaw]
    .sort((a, b) => Number(b._sum.price ?? 0) - Number(a._sum.price ?? 0))
    .filter((r) => r.responsibleId && userMap.has(r.responsibleId))
    .map((r, i) => ({
      userId: r.responsibleId!,
      kommoUserId: userMap.get(r.responsibleId!)!.kommoUserId,
      name: userMap.get(r.responsibleId!)!.name,
      position: i + 1,
      salesCount: r._count.id,
      salesValue: Number(r._sum.price ?? 0),
    }));

  // Last sync
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

  // Cache for 30 seconds
  appCache.set(cacheKey, result, 30_000);

  return result;
}
