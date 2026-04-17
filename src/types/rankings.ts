export interface RankingEntry {
  userId: string;
  kommoUserId: number;
  name: string;
  position: number;
  meetingsCount?: number;
  meetingsScheduled?: number;
  meetingsCompleted?: number;
  salesCount?: number;
  salesValue?: number;
}

export interface RankingsData {
  sdrMeetings: RankingEntry[];
  closerSalesCount: RankingEntry[];
  closerSalesValue: RankingEntry[];
  lastSync: string | null;
  periodStart: string;
  periodEnd: string;
}

export type PeriodFilter = "today" | "week" | "month" | "custom";

export interface PeriodRange {
  start: Date;
  end: Date;
}
