import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

interface CalculateOptions {
  periodStart: Date;
  periodEnd: Date;
}

async function getStageIds(type: "MEETING_BOOKED" | "SALE_WON" | "SALE_LOST") {
  const rows = await prisma.stage.findMany({
    where: { stageType: type },
    select: { kommoStatusId: true },
  });
  return rows.map((r) => r.kommoStatusId);
}

export async function calculateAndSaveRankings(options: CalculateOptions) {
  const { periodStart, periodEnd } = options;
  const now = new Date();
  const snapshotDate = new Date(now.toISOString().split("T")[0]);
  const snapshotHour = now.getHours();

  const [meetingStageIds, saleStageIds] = await Promise.all([
    getStageIds("MEETING_BOOKED"),
    getStageIds("SALE_WON"),
  ]);

  const sdrMeetings = meetingStageIds.length
    ? await prisma.leadEvent.groupBy({
        by: ["userId"],
        where: {
          statusAfter: { in: meetingStageIds },
          kommoCreatedAt: { gte: periodStart, lte: periodEnd },
          userId: { not: null },
          user: { role: "SDR", active: true },
        },
        _count: { id: true },
      })
    : [];

  const closerSales = saleStageIds.length
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
          AND le."kommoCreatedAt" >= ${periodStart}
          AND le."kommoCreatedAt" <= ${periodEnd}
          AND le."userId" IS NOT NULL
          AND u.role = 'CLOSER'
          AND u.active = true
        GROUP BY le."userId"
      `
    : [];

  const snapshots: Prisma.RankingSnapshotCreateManyInput[] = [];

  for (const entry of sdrMeetings) {
    if (!entry.userId) continue;
    snapshots.push({
      snapshotDate,
      snapshotHour,
      userId: entry.userId,
      userRole: "SDR",
      meetingsCount: entry._count.id,
      salesCount: 0,
      salesValue: 0,
      periodStart,
      periodEnd,
    });
  }

  for (const entry of closerSales) {
    if (!entry.userId) continue;
    snapshots.push({
      snapshotDate,
      snapshotHour,
      userId: entry.userId,
      userRole: "CLOSER",
      meetingsCount: 0,
      salesCount: Number(entry.count),
      salesValue: entry.sumPrice ?? new Prisma.Decimal(0),
      periodStart,
      periodEnd,
    });
  }

  for (const snap of snapshots) {
    await prisma.rankingSnapshot.upsert({
      where: {
        snapshotDate_snapshotHour_userId_periodStart_periodEnd: {
          snapshotDate: snap.snapshotDate,
          snapshotHour: snap.snapshotHour,
          userId: snap.userId,
          periodStart: snap.periodStart,
          periodEnd: snap.periodEnd,
        },
      },
      update: {
        meetingsCount: snap.meetingsCount,
        salesCount: snap.salesCount,
        salesValue: snap.salesValue,
      },
      create: snap,
    });
  }

  return { snapshotsCreated: snapshots.length };
}
