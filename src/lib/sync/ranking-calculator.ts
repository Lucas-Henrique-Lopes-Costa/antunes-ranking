import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

interface CalculateOptions {
  periodStart: Date;
  periodEnd: Date;
}

export async function calculateAndSaveRankings(options: CalculateOptions) {
  const { periodStart, periodEnd } = options;
  const now = new Date();
  const snapshotDate = new Date(now.toISOString().split("T")[0]);
  const snapshotHour = now.getHours();

  // SDR meetings ranking
  const sdrMeetings = await prisma.lead.groupBy({
    by: ["responsibleId"],
    where: {
      stageType: "MEETING_BOOKED",
      responsible: { role: "SDR", active: true },
      responsibleId: { not: null },
      kommoUpdatedAt: { gte: periodStart, lte: periodEnd },
    },
    _count: { id: true },
  });

  // Closer sales ranking
  const closerSales = await prisma.lead.groupBy({
    by: ["responsibleId"],
    where: {
      stageType: "SALE_WON",
      responsible: { role: "CLOSER", active: true },
      responsibleId: { not: null },
      closedAt: { gte: periodStart, lte: periodEnd },
    },
    _count: { id: true },
    _sum: { price: true },
  });

  // Save snapshots
  const snapshots: Prisma.RankingSnapshotCreateManyInput[] = [];

  for (const entry of sdrMeetings) {
    if (!entry.responsibleId) continue;
    snapshots.push({
      snapshotDate,
      snapshotHour,
      userId: entry.responsibleId,
      userRole: "SDR",
      meetingsCount: entry._count.id,
      salesCount: 0,
      salesValue: 0,
      periodStart,
      periodEnd,
    });
  }

  for (const entry of closerSales) {
    if (!entry.responsibleId) continue;
    snapshots.push({
      snapshotDate,
      snapshotHour,
      userId: entry.responsibleId,
      userRole: "CLOSER",
      meetingsCount: 0,
      salesCount: entry._count.id,
      salesValue: entry._sum.price ?? new Prisma.Decimal(0),
      periodStart,
      periodEnd,
    });
  }

  // Upsert snapshots (avoid duplicates if sync runs multiple times in same hour)
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
