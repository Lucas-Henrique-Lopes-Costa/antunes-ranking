import { NextRequest, NextResponse } from "next/server";
import { MOCK_RANKINGS } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Se DATABASE_URL está configurado e não é placeholder, usa dados reais
    const dbUrl = process.env.DATABASE_URL ?? "";
    const useMock = !dbUrl || dbUrl.includes("placeholder");

    if (useMock) {
      return NextResponse.json(MOCK_RANKINGS);
    }

    // Dados reais do banco
    const { getRankings } = await import("@/lib/sync/get-rankings");
    const { searchParams } = request.nextUrl;
    const period = searchParams.get("period") ?? "month";
    const customStart = searchParams.get("start") ?? undefined;
    const customEnd = searchParams.get("end") ?? undefined;

    const rankings = await getRankings(period, customStart, customEnd);
    return NextResponse.json(rankings);
  } catch (error) {
    console.error("Erro ao buscar rankings, retornando mock:", error);
    // Fallback para mock se o banco falhar
    return NextResponse.json(MOCK_RANKINGS);
  }
}
