import { NextRequest, NextResponse } from "next/server";
import { MOCK_RANKINGS } from "@/lib/mock-data";
import { getRankings } from "@/lib/sync/get-rankings";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const dbUrl = process.env.DATABASE_URL ?? "";
  const forceMock = process.env.USE_MOCK === "true" || !dbUrl || dbUrl.includes("placeholder");

  if (forceMock) {
    return NextResponse.json(MOCK_RANKINGS);
  }

  const { searchParams } = request.nextUrl;
  const period = searchParams.get("period") ?? "month";
  const customStart = searchParams.get("start") ?? undefined;
  const customEnd = searchParams.get("end") ?? undefined;

  try {
    const rankings = await getRankings(period, customStart, customEnd);
    return NextResponse.json(rankings);
  } catch (error) {
    console.error("Erro ao buscar rankings:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro no banco" },
      { status: 500 }
    );
  }
}
