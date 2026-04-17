import { NextResponse } from "next/server";
import { runSync } from "@/lib/sync/engine";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST() {
  try {
    const result = await runSync();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro na sync via admin:", error);
    return NextResponse.json(
      {
        error: "Falha na sincronização",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
