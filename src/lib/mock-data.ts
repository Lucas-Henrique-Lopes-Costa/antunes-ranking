import type { RankingsData } from "@/types/rankings";

export const MOCK_RANKINGS: RankingsData = {
  // SDRs - ranking por reuniões realizadas
  sdrMeetings: [
    { userId: "sdr1", kommoUserId: 101, name: "Pedro", position: 1, meetingsScheduled: 56, meetingsCompleted: 34, meetingsCount: 34 },
    { userId: "sdr2", kommoUserId: 102, name: "Felipe", position: 2, meetingsScheduled: 52, meetingsCompleted: 27, meetingsCount: 27 },
    { userId: "sdr3", kommoUserId: 103, name: "Henrique", position: 3, meetingsScheduled: 40, meetingsCompleted: 20, meetingsCount: 20 },
    { userId: "sdr4", kommoUserId: 104, name: "Mariana", position: 4, meetingsScheduled: 33, meetingsCompleted: 15, meetingsCount: 15 },
    { userId: "sdr5", kommoUserId: 105, name: "Beatriz", position: 5, meetingsScheduled: 28, meetingsCompleted: 11, meetingsCount: 11 },
  ],
  // Closers - vendas por quantidade (mesma ordem do valor nesse mock)
  closerSalesCount: [
    { userId: "cl1", kommoUserId: 201, name: "João", position: 1, salesCount: 6, salesValue: 122800 },
    { userId: "cl2", kommoUserId: 202, name: "Davi", position: 2, salesCount: 5, salesValue: 110300 },
    { userId: "cl3", kommoUserId: 203, name: "Thales", position: 3, salesCount: 3, salesValue: 103200 },
    { userId: "cl4", kommoUserId: 204, name: "Rafael", position: 4, salesCount: 3, salesValue: 78500 },
    { userId: "cl5", kommoUserId: 205, name: "Bruno", position: 5, salesCount: 2, salesValue: 54000 },
  ],
  // Closers - ranking principal por valor
  closerSalesValue: [
    { userId: "cl1", kommoUserId: 201, name: "João", position: 1, salesCount: 6, salesValue: 122800 },
    { userId: "cl2", kommoUserId: 202, name: "Davi", position: 2, salesCount: 5, salesValue: 110300 },
    { userId: "cl3", kommoUserId: 203, name: "Thales", position: 3, salesCount: 3, salesValue: 103200 },
    { userId: "cl4", kommoUserId: 204, name: "Rafael", position: 4, salesCount: 3, salesValue: 78500 },
    { userId: "cl5", kommoUserId: 205, name: "Bruno", position: 5, salesCount: 2, salesValue: 54000 },
  ],
  lastSync: new Date().toISOString(),
  periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
  periodEnd: new Date().toISOString(),
};
