import { NextRequest, NextResponse } from "next/server";
import { runSync } from "@/lib/sync/engine";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes max for Vercel

export async function POST(request: NextRequest) {
  // Verify cron secret or admin auth
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Check if it's an admin request (simple check)
    const appSecret = process.env.APP_SECRET;
    if (!appSecret || authHeader !== `Bearer ${appSecret}`) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
  }

  try {
    const result = await runSync();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro na sincronização:", error);
    return NextResponse.json(
      { error: "Falha na sincronização", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Vercel Cron handler (GET)
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const result = await runSync();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro na sincronização via cron:", error);
    return NextResponse.json(
      { error: "Falha na sincronização" },
      { status: 500 }
    );
  }
}
